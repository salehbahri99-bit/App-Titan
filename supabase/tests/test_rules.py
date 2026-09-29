"""Checks the security rules in supabase/migrations against a throwaway Postgres database.

Usage: PGHOST=… PGPORT=… PGUSER=postgres python supabase/tests/test_rules.py
Creates the database `titanpack_test`, loads stubs.sql + every migration, then runs each case as
anon / a signed-in user and compares the outcome with what the rules should allow."""
import os, subprocess, sys, uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = "titanpack_test"
env = {**os.environ}

def psql(sql, db=DB, check=True):
    r = subprocess.run(["psql", "-X", "-q", "-t", "-A", "-v", "ON_ERROR_STOP=1", "-d", db, "-c", sql],
                       capture_output=True, text=True, env=env)
    if check and r.returncode:
        sys.exit(f"setup failed: {r.stderr.strip()}\n{sql[:300]}")
    return r

def run_file(path):
    r = subprocess.run(["psql", "-X", "-q", "-v", "ON_ERROR_STOP=1", "-d", DB, "-f", str(path)], capture_output=True, text=True, env=env)
    if r.returncode:
        sys.exit(f"{path.name} failed:\n{r.stderr}")

psql(f"drop database if exists {DB}", db="postgres")
psql(f"create database {DB}", db="postgres")
run_file(ROOT / "tests" / "stubs.sql")
for m in sorted((ROOT / "migrations").glob("*.sql")):
    run_file(m)
    run_file(m)   # migrations must be safe to re-run

def as_user(uid, sql):
    """Run sql the way the API would: role anon (uid None) or authenticated with auth.uid() = uid."""
    role = "anon" if uid is None else "authenticated"
    return psql(f"begin; set local role {role}; select set_config('request.jwt.claim.sub', '{uid or ''}', true) is not null; {sql}; commit;", check=False)

def signup(email, name=""):
    uid = str(uuid.uuid4())
    r = psql(f"insert into auth.users (id, email, raw_user_meta_data) values ('{uid}', '{email}', '{{\"name\":\"{name}\"}}')", check=False)
    return uid if r.returncode == 0 else r.stderr

fails = 0
def case(label, uid, sql, expect):
    """expect: 'ok' | 'err:<text>' | 'rows:<n>' (number of rows the last statement returns) | 'val:<text>'"""
    global fails
    r = as_user(uid, sql)
    out = [l for l in r.stdout.strip().splitlines() if l and l not in ("BEGIN", "COMMIT", "SET")]
    if expect == "ok": ok = r.returncode == 0
    elif expect.startswith("err:"): ok = r.returncode != 0 and expect[4:] in r.stderr
    elif expect.startswith("rows:"): ok = r.returncode == 0 and len(out) - 1 == int(expect[5:])   # first line = set_config
    elif expect.startswith("val:"): ok = r.returncode == 0 and out[-1:] == [expect[4:]]
    fails += not ok
    print(("PASS " if ok else "FAIL ") + label + ("" if ok else f"\n     expected {expect}; got rc={r.returncode} out={out} err={r.stderr.strip()[:200]}"))

# ── accounts: first sign-up becomes owner, later ones need an invite
case("fresh install has no owner", None, "select public.has_owner()", "val:f")
owner = signup("owner@titanpack.com", "Owner")
case("first account became owner", owner, "select role from public.profiles where id = auth.uid()", "val:owner")
stranger = signup("stranger@example.com")
print(("PASS " if "signup_not_invited" in stranger else "FAIL ") + "uninvited sign-up is refused"); fails += "signup_not_invited" not in stranger
case("owner invites an editor", owner, "insert into public.invites (email, role) values ('editor@titanpack.com', 'editor')", "ok")
case("owner invites a manager", owner, "insert into public.invites (email, role) values ('manager@titanpack.com', 'manager')", "ok")
case("owner invites a viewer", owner, "insert into public.invites (email, role) values ('viewer@titanpack.com', 'viewer')", "ok")
case("nobody can invite a second owner", owner, "insert into public.invites (email, role) values ('x@titanpack.com', 'owner')", "err:check")
editor, manager, viewer = signup("editor@titanpack.com"), signup("manager@titanpack.com"), signup("viewer@titanpack.com")
case("invited editor got the editor role", editor, "select role from public.profiles where id = auth.uid()", "val:editor")
case("invite is used up", owner, "select count(*) from public.invites", "val:0")
case("editor cannot invite", editor, "insert into public.invites (email, role) values ('y@titanpack.com', 'editor')", "err:row-level security")
case("editor cannot promote themself", editor, "update public.profiles set role = 'owner' where id = auth.uid()", "err:permission denied")
case("editor can rename themself", editor, "update public.profiles set name = 'Omar' where id = auth.uid()", "ok")
case("editor cannot call set_user_access", editor, f"select public.set_user_access('{editor}', 'owner')", "err:forbidden")
case("owner changes a role", owner, f"select public.set_user_access('{viewer}', 'editor')", "ok")
case("owner changes it back", owner, f"select public.set_user_access('{viewer}', 'viewer')", "ok")
case("the last owner cannot demote themself", owner, f"select public.set_user_access('{owner}', 'manager')", "err:last_owner")
case("visitors cannot read profiles", None, "select * from public.profiles", "err:permission denied")

# ── draft / publish / versions
case("visitor sees no live content yet", None, "select payload from public.site_state", "rows:0")
case("viewer cannot save a draft", viewer, "insert into public.site_state (slot, payload) values ('draft', '{\"a\":1}')", "err:row-level security")
case("editor saves a draft", editor, "insert into public.site_state (slot, payload) values ('draft', '{\"hero\":\"v1\"}')", "ok")
case("editor updates the draft", editor, "update public.site_state set payload = '{\"hero\":\"v2\"}' where slot = 'draft'", "ok")
case("editor cannot write live directly", editor, "insert into public.site_state (slot, payload) values ('live', '{\"x\":1}')", "err:row-level security")
case("editor cannot publish", editor, "select public.publish('try', '[]')", "err:forbidden")
case("visitor cannot publish", None, "select public.publish('try', '[]')", "err:permission denied")
case("visitor cannot read the draft", None, "select payload from public.site_state where slot = 'draft'", "rows:0")
case("manager publishes → version 1", manager, "select public.publish('first', '[\"الواجهة\"]')", "val:1")
case("visitor reads the live payload", None, "select payload->>'hero' from public.site_state where slot = 'live'", "val:v2")
case("editor changes the draft again", editor, "update public.site_state set payload = '{\"hero\":\"v3\"}' where slot = 'draft'", "ok")
case("owner publishes → version 2", owner, "select public.publish('second', '[]')", "val:2")
case("visitor sees v3", None, "select payload->>'hero' from public.site_state where slot = 'live'", "val:v3")
case("version records its author", owner, "select author || '/' || author_role from public.versions where v = 2", "val:Owner/owner")
case("visitors cannot read versions", None, "select * from public.versions", "rows:0")
case("viewer can read versions", viewer, "select v from public.versions order by v", "rows:2")
case("editor cannot restore", editor, "select public.restore_version(1)", "err:forbidden")
case("manager restores v1 into the draft", manager, "select public.restore_version(1)", "ok")
case("draft now holds version 1 (hero v2)", editor, "select payload->>'hero' from public.site_state where slot = 'draft'", "val:v2")
case("live site unchanged by restore", None, "select payload->>'hero' from public.site_state where slot = 'live'", "val:v3")
case("nobody can edit versions", owner, "update public.versions set note = 'x'", "rows:0")

# ── media
case("editor adds a media record", editor, "insert into public.media (id, name, kind, ext, size) values ('m-test1', 'a.webp', 'image', 'webp', 10)", "ok")
case("viewer cannot add media", viewer, "insert into public.media (id, name, kind, ext, size) values ('m-test2', 'b.webp', 'image', 'webp', 10)", "err:row-level security")
case("visitor can list media (site needs URLs)", None, "select id from public.media where id = 'm-test1'", "rows:1")
case("bundled clips are present", None, "select count(*) from public.media where kind = 'video'", "val:5")
case("editor cannot delete media", editor, "delete from public.media where id = 'm-test1' returning id", "rows:0")
case("manager deletes media", manager, "delete from public.media where id = 'm-test1' returning id", "rows:1")
case("editor uploads to media bucket", editor, "insert into storage.objects (bucket_id, name) values ('media', 'projects/x.webp')", "ok")
case("visitor cannot upload to media bucket", None, "insert into storage.objects (bucket_id, name) values ('media', 'x.webp')", "err:row-level security")
lead_id = str(uuid.uuid4())
case("visitor uploads a lead attachment", None, f"insert into storage.objects (bucket_id, name) values ('lead-files', 'incoming/{lead_id}/brief.pdf')", "ok")
case("visitor cannot upload outside incoming/<uuid>/", None, "insert into storage.objects (bucket_id, name) values ('lead-files', 'other/brief.pdf')", "err:row-level security")
case("visitor cannot list lead files", None, "select name from storage.objects where bucket_id = 'lead-files'", "rows:0")
case("staff can read lead files", viewer, "select name from storage.objects where bucket_id = 'lead-files'", "rows:1")

# ── leads
lead = "insert into public.leads (id, name, email, msg, lang, files) values ('{id}', 'Noor', '{email}', 'Candle box', 'ar', '[]')"
case("visitor submits the contact form", None, lead.format(id=lead_id, email="noor@example.com"), "ok")
case("visitor cannot read leads", None, "select * from public.leads", "rows:0")
case("visitor-supplied status is reset to new", None, f"insert into public.leads (name, email, msg, status) values ('A', 'a@example.com', 'm', 'done')", "ok")
case("…and stored as new", owner, "select status from public.leads where email = 'a@example.com'", "val:new")
case("invalid email is refused", None, "insert into public.leads (name, email, msg) values ('A', 'not-an-email', 'm')", "err:check")
case("second request same email", None, lead.format(id=uuid.uuid4(), email="noor@example.com"), "ok")
case("third request same email", None, lead.format(id=uuid.uuid4(), email="noor@example.com"), "ok")
case("fourth within an hour is rate limited", None, lead.format(id=uuid.uuid4(), email="noor@example.com"), "err:rate_limited")
case("viewer reads leads", viewer, "select id from public.leads", "rows:4")
case("viewer cannot change a lead", viewer, "update public.leads set status = 'done' returning id", "rows:0")
case("editor marks a lead in progress", editor, f"update public.leads set status = 'progress' where id = '{lead_id}' returning id", "rows:1")
case("editor cannot delete leads", editor, "delete from public.leads returning id", "rows:0")

# ── deactivated accounts lose access immediately
case("owner deactivates the editor", owner, f"select public.set_user_access('{editor}', 'editor', false)", "ok")
case("deactivated editor cannot save a draft", editor, "update public.site_state set payload = '{}' where slot = 'draft' returning slot", "rows:0")
case("deactivated editor cannot read leads", editor, "select id from public.leads", "rows:0")

print(f"\n{'ALL PASSED' if not fails else f'{fails} FAILED'}")
sys.exit(1 if fails else 0)
