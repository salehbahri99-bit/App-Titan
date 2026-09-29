"""Local stand-in for a Supabase project, for automated tests only — NOT secure, never deploy it.

One port serves:
  /rest/v1/*     → a real PostgREST (the same API Supabase runs), so every query goes through the RLS rules
  /auth/v1/*     → a minimal GoTrue-compatible sign-in service (sign-up, password sign-in, refresh, user, recover)
  /storage/v1/*  → a minimal Storage service; object rows are written as the caller's role, so bucket
                   policies apply, and bucket size / MIME limits are enforced like Supabase does
  everything else → static files from --site (the built prototype)

Usage:
  python supabase/tests/dev_stack.py --pg-host /var/run/postgresql --pg-port 5432 --postgrest ./postgrest \
      --site prototype --port 54321
It (re)creates the database `titanpack_stack`, loads stubs.sql + migrations, starts PostgREST and prints
the URL and anon key to put in config.js."""
import argparse, base64, email.parser, email.policy, hashlib, hmac, json, mimetypes, os, re, subprocess, sys, tempfile, threading, time, uuid
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, parse_qs, unquote
import urllib.request, urllib.error
import psycopg2

ROOT = Path(__file__).resolve().parents[1]
SECRET = "titan-pack-local-test-secret-at-least-32-chars"
DB = "titanpack_stack"

def b64u(b): return base64.urlsafe_b64encode(b).rstrip(b"=").decode()
def jwt(claims):
    h = b64u(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()); p = b64u(json.dumps(claims).encode())
    s = b64u(hmac.new(SECRET.encode(), f"{h}.{p}".encode(), hashlib.sha256).digest())
    return f"{h}.{p}.{s}"
def unjwt(tok):
    try:
        h, p, s = tok.split(".")
        if not hmac.compare_digest(s, b64u(hmac.new(SECRET.encode(), f"{h}.{p}".encode(), hashlib.sha256).digest())): return None
        c = json.loads(base64.urlsafe_b64decode(p + "=" * (-len(p) % 4)))
        return c if c.get("exp", 0) > time.time() else None
    except Exception: return None

ANON = jwt({"role": "anon", "iss": "local", "exp": int(time.time()) + 10 * 365 * 86400})

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pg-host", required=True); ap.add_argument("--pg-port", default="5432")
    ap.add_argument("--postgrest", required=True); ap.add_argument("--site", required=True)
    ap.add_argument("--port", type=int, default=54321)
    a = ap.parse_args()
    env = {**os.environ, "PGHOST": a.pg_host, "PGPORT": a.pg_port, "PGUSER": "postgres"}
    def psql(sql, db="postgres"): subprocess.run(["psql", "-X", "-q", "-v", "ON_ERROR_STOP=1", "-d", db, "-c", sql], check=True, env=env, capture_output=True)
    psql(f"drop database if exists {DB} with (force)"); psql(f"create database {DB}")
    for f in [ROOT / "tests" / "stubs.sql", *sorted((ROOT / "migrations").glob("*.sql"))]:
        subprocess.run(["psql", "-X", "-q", "-v", "ON_ERROR_STOP=1", "-d", DB, "-f", str(f)], check=True, env=env, capture_output=True)
    psql("do $$ begin create role authenticator login noinherit; exception when duplicate_object then null; end $$; grant anon, authenticated to authenticator;", DB)

    pg_port = a.port + 1
    conf = tempfile.NamedTemporaryFile("w", suffix=".conf", delete=False)
    conf.write(f'db-uri = "postgres://authenticator@/{DB}?host={a.pg_host}&port={a.pg_port}"\ndb-schemas = "public"\ndb-anon-role = "anon"\n'
               f'jwt-secret = "{SECRET}"\nserver-port = {pg_port}\nserver-host = "127.0.0.1"\nlog-level = "crit"\n'); conf.close()
    rest = subprocess.Popen([a.postgrest, conf.name], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(50):
        try: urllib.request.urlopen(f"http://127.0.0.1:{pg_port}/"); break
        except Exception: time.sleep(.2)

    dsn = dict(host=a.pg_host, port=a.pg_port, user="postgres", dbname=DB)
    files = Path(tempfile.mkdtemp(prefix="tp-storage-"))
    users, refresh, lock = {}, {}, threading.Lock()   # email → {id,password,meta}, refresh token → email

    def as_role(claims, sql, args=()):
        """Run SQL the way Storage does: as the caller's database role with their JWT claims, so RLS applies."""
        con = psycopg2.connect(**dsn)
        try:
            with con, con.cursor() as cur:
                cur.execute(f"set local role {'authenticated' if claims.get('role') == 'authenticated' else 'anon'}")
                cur.execute("select set_config('request.jwt.claims', %s, true)", (json.dumps(claims),))
                cur.execute(sql, args)
                return cur.fetchall() if cur.description else cur.rowcount
        finally: con.close()
    def superuser(sql, args=()):
        con = psycopg2.connect(**dsn)
        try:
            with con, con.cursor() as cur:
                cur.execute(sql, args); return cur.fetchall() if cur.description else None
        finally: con.close()

    def user_json(u):
        now = "2026-01-01T00:00:00Z"
        return {"id": u["id"], "aud": "authenticated", "role": "authenticated", "email": u["email"], "email_confirmed_at": now,
                "user_metadata": u["meta"], "app_metadata": {"provider": "email", "providers": ["email"]}, "identities": [],
                "created_at": now, "updated_at": now}
    def session(email):
        u = users[email]; exp = int(time.time()) + 3600; rt = uuid.uuid4().hex; refresh[rt] = email
        return {"access_token": jwt({"sub": u["id"], "role": "authenticated", "aud": "authenticated", "email": email, "exp": exp}),
                "token_type": "bearer", "expires_in": 3600, "expires_at": exp, "refresh_token": rt, "user": user_json(u)}

    class H(BaseHTTPRequestHandler):
        def log_message(self, *a): pass
        def send(self, code, body=b"", ctype="application/json", extra=None):
            if isinstance(body, (dict, list)): body = json.dumps(body).encode()
            self.send_response(code); self.send_header("Content-Type", ctype); self.send_header("Content-Length", str(len(body)))
            for k, v in (extra or {}).items(): self.send_header(k, v)
            self.end_headers(); self.wfile.write(body)
        def body(self): n = int(self.headers.get("Content-Length") or 0); return self.rfile.read(n) if n else b""
        def claims(self):
            tok = (self.headers.get("Authorization") or "").removeprefix("Bearer ").strip()
            return unjwt(tok) or {"role": "anon"}
        def do_OPTIONS(self): self.send(204)
        def do_GET(self): self.route("GET")
        def do_POST(self): self.route("POST")
        def do_PATCH(self): self.route("PATCH")
        def do_PUT(self): self.route("PUT")
        def do_DELETE(self): self.route("DELETE")
        def do_HEAD(self): self.route("HEAD")

        def route(self, m):
            u = urlsplit(self.path); p = u.path
            try:
                if p.startswith("/rest/v1"): return self.rest(m, p[len("/rest/v1"):] + (f"?{u.query}" if u.query else ""))
                if p.startswith("/auth/v1"): return self.auth(m, p[len("/auth/v1"):], parse_qs(u.query))
                if p.startswith("/storage/v1"): return self.storage(m, unquote(p[len("/storage/v1"):]), parse_qs(u.query))
                return self.static(p)
            except BrokenPipeError: pass

        def rest(self, m, path):
            req = urllib.request.Request(f"http://127.0.0.1:{pg_port}{path}", data=self.body() or None, method=m)
            for k in ("Authorization", "Content-Type", "Prefer", "Accept", "Range", "Accept-Profile", "Content-Profile"):
                if self.headers.get(k): req.add_header(k, self.headers[k])
            try: r = urllib.request.urlopen(req); code, data, hdr = r.status, r.read(), r.headers
            except urllib.error.HTTPError as e: code, data, hdr = e.code, e.read(), e.headers
            self.send(code, data, hdr.get("Content-Type", "application/json"), {k: hdr[k] for k in ("Content-Range",) if hdr.get(k)})

        def auth(self, m, p, q):
            d = json.loads(self.body() or b"{}") if m in ("POST", "PUT") else {}
            with lock:
                if p == "/signup":
                    em = d.get("email", "").lower()
                    if em in users: return self.send(422, {"code": 422, "error_code": "user_already_exists", "msg": "User already registered"})
                    if len(d.get("password", "")) < 8: return self.send(422, {"code": 422, "error_code": "weak_password", "msg": "Password should be at least 8 characters."})
                    uid = str(uuid.uuid4())
                    try: superuser("insert into auth.users (id, email, raw_user_meta_data) values (%s, %s, %s)", (uid, em, json.dumps(d.get("data") or {})))
                    except psycopg2.Error: return self.send(500, {"code": 500, "error_code": "unexpected_failure", "msg": "Database error saving new user"})
                    users[em] = {"id": uid, "email": em, "password": d["password"], "meta": d.get("data") or {}}
                    return self.send(200, session(em))
                if p == "/token":
                    g = q.get("grant_type", [""])[0]
                    if g == "password":
                        em = d.get("email", "").lower(); u = users.get(em)
                        if not u or u["password"] != d.get("password"): return self.send(400, {"code": 400, "error_code": "invalid_credentials", "msg": "Invalid login credentials"})
                        return self.send(200, session(em))
                    if g == "refresh_token" and d.get("refresh_token") in refresh: return self.send(200, session(refresh.pop(d["refresh_token"])))
                    return self.send(400, {"code": 400, "error_code": "refresh_token_not_found", "msg": "Invalid Refresh Token"})
                c = unjwt((self.headers.get("Authorization") or "").removeprefix("Bearer ").strip())
                me = next((u for u in users.values() if c and u["id"] == c.get("sub")), None)
                if p == "/user" and m == "GET": return self.send(200, user_json(me)) if me else self.send(401, {"code": 401, "msg": "invalid JWT"})
                if p == "/user" and m == "PUT":
                    if not me: return self.send(401, {"code": 401, "msg": "invalid JWT"})
                    if d.get("password"): me["password"] = d["password"]
                    return self.send(200, user_json(me))
                if p == "/logout": return self.send(204, b"")
                if p == "/recover": return self.send(200, {})
            self.send(404, {"msg": "not found"})

        def storage(self, m, p, q):
            c = self.claims()
            mm = re.match(r"^/object/public/([^/]+)/(.+)$", p)
            if mm and m in ("GET", "HEAD"):
                b, name = mm.groups()
                pub = superuser("select public from storage.buckets where id = %s", (b,))
                f = files / b / name
                if not pub or not pub[0][0] or not f.exists(): return self.send(404, {"statusCode": "404", "error": "not_found", "message": "Object not found"})
                return self.send(200, f.read_bytes(), mimetypes.guess_type(name)[0] or "application/octet-stream")
            mm = re.match(r"^/object/sign/([^/]+)/(.+)$", p)
            if mm:
                b, name = mm.groups()
                if m == "POST":
                    if not as_role(c, "select 1 from storage.objects where bucket_id = %s and name = %s", (b, name)):
                        return self.send(400, {"statusCode": "404", "error": "not_found", "message": "Object not found"})
                    tok = jwt({"url": f"{b}/{name}", "exp": int(time.time()) + int(json.loads(self.body() or b"{}").get("expiresIn", 60))})
                    return self.send(200, {"signedURL": f"/object/sign/{b}/{name}?token={tok}"})
                t = unjwt(q.get("token", [""])[0])
                if not t or t.get("url") != f"{b}/{name}" or not (files / b / name).exists(): return self.send(400, {"statusCode": "400", "error": "InvalidJWT", "message": "invalid signature"})
                return self.send(200, (files / b / name).read_bytes(), mimetypes.guess_type(name)[0] or "application/octet-stream")
            mm = re.match(r"^/object/([^/]+)/(.+)$", p)
            if mm and m in ("POST", "PUT"):
                b, name = mm.groups(); raw = self.body(); ctype = self.headers.get("Content-Type", "")
                if ctype.startswith("multipart/form-data"):
                    msg = email.parser.BytesParser(policy=email.policy.HTTP).parsebytes(f"Content-Type: {ctype}\r\n\r\n".encode() + raw)
                    part = next(x for x in msg.iter_parts() if x.get_filename() is not None or x.get_param("name", header="content-disposition") == "")
                    data, ctype = part.get_payload(decode=True), part.get_content_type()
                else: data = raw
                lim = superuser("select file_size_limit, allowed_mime_types from storage.buckets where id = %s", (b,))
                if not lim: return self.send(400, {"statusCode": "404", "error": "Bucket not found", "message": "Bucket not found"})
                if lim[0][0] and len(data) > lim[0][0]: return self.send(413, {"statusCode": "413", "error": "Payload too large", "message": "The object exceeded the maximum allowed size"})
                if lim[0][1] and ctype not in lim[0][1]: return self.send(415, {"statusCode": "415", "error": "invalid_mime_type", "message": f"mime type {ctype} is not supported"})
                if (files / b / name).exists() and self.headers.get("x-upsert") != "true": return self.send(400, {"statusCode": "409", "error": "Duplicate", "message": "The resource already exists"})
                try: as_role(c, "insert into storage.objects (bucket_id, name) values (%s, %s)", (b, name))
                except psycopg2.Error: return self.send(400, {"statusCode": "403", "error": "Unauthorized", "message": "new row violates row-level security policy"})
                (files / b / name).parent.mkdir(parents=True, exist_ok=True); (files / b / name).write_bytes(data)
                return self.send(200, {"Key": f"{b}/{name}", "Id": str(uuid.uuid4())})
            mm = re.match(r"^/object/([^/]+)$", p)
            if mm and m == "DELETE":
                b = mm.group(1); names = json.loads(self.body() or b"{}").get("prefixes", [])
                gone = as_role(c, "delete from storage.objects where bucket_id = %s and name = any(%s) returning name", (b, names))
                for (n,) in gone: (files / b / n).unlink(missing_ok=True)
                return self.send(200, [{"name": n} for (n,) in gone])
            self.send(404, {"statusCode": "404", "error": "not_found", "message": p})

        def static(self, p):
            f = (Path(a.site) / unquote(p.lstrip("/") or "index.html")).resolve()
            if not str(f).startswith(str(Path(a.site).resolve())) or not f.is_file(): return self.send(404, b"not found", "text/plain")
            self.send(200, f.read_bytes(), mimetypes.guess_type(f.name)[0] or "application/octet-stream")

    srv = ThreadingHTTPServer(("127.0.0.1", a.port), H)
    print(json.dumps({"url": f"http://localhost:{a.port}", "anonKey": ANON}), flush=True)
    try: srv.serve_forever()
    finally: rest.terminate()

if __name__ == "__main__": main()
