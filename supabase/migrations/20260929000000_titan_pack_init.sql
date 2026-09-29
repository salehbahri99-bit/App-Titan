-- Titan Pack — database, security rules and server-side actions (Supabase / Postgres 15+).
--
-- Who can do what is decided HERE, not in the browser:
--   * The first account ever created becomes the owner. After that, sign-up only works for emails
--     the owner has invited, with the role chosen in the invite.
--   * Roles: owner > manager > editor > viewer. Every table has row-level security; the dashboard
--     only mirrors these rules.
--   * The public site can read the published payload and media list, and submit the contact form.
--   * Publishing and restoring versions are server functions that check the caller's role.
--
-- Run once in the Supabase SQL editor (or `supabase db push`). Safe to re-run.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('owner','manager','editor','viewer');
exception when duplicate_object then null; end $$;

-- ───────────────────────────────────────────── people
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text not null default '' check (length(name) <= 120),
  role        public.app_role not null default 'viewer',
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  last_seen   timestamptz
);

create table if not exists public.invites (
  email       text primary key check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  name        text not null default '' check (length(name) <= 120),
  role        public.app_role not null check (role <> 'owner'),
  invited_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- role of the signed-in user (null for visitors and deactivated accounts)
create or replace function public.app_user_role() returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and active
$$;

create or replace function public.has_role(roles public.app_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.app_user_role() = any(roles), false)
$$;

-- used by the sign-in screen to offer "create the owner account" on a fresh install
create or replace function public.has_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where role = 'owner')
$$;

-- first account → owner; later accounts must be invited
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare inv public.invites;
begin
  perform pg_advisory_xact_lock(72610);            -- two simultaneous first sign-ups cannot both become owner
  if not exists (select 1 from public.profiles) then
    insert into public.profiles (id, email, name, role)
    values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'name', ''), 'owner');
    return new;
  end if;
  select * into inv from public.invites where email = lower(new.email);
  if not found then
    raise exception 'signup_not_invited' using errcode = '42501';
  end if;
  insert into public.profiles (id, email, name, role)
  values (new.id, lower(new.email), coalesce(nullif(new.raw_user_meta_data->>'name', ''), inv.name), inv.role);
  delete from public.invites where email = inv.email;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- owner-only role changes; the last active owner can never be demoted or deactivated
create or replace function public.set_user_access(target uuid, new_role public.app_role, is_active boolean default true)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(array['owner']::public.app_role[]) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if (new_role <> 'owner' or not is_active)
     and exists (select 1 from public.profiles where id = target and role = 'owner' and active)
     and (select count(*) from public.profiles where role = 'owner' and active) = 1 then
    raise exception 'last_owner' using errcode = '42501';
  end if;
  update public.profiles set role = new_role, active = is_active where id = target;
end $$;

alter table public.profiles enable row level security;
alter table public.invites  enable row level security;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or public.app_user_role() is not null);
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- only name / last_seen are editable directly; role and active go through set_user_access()
revoke all on public.profiles, public.invites from anon;
revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (name, last_seen) on public.profiles to authenticated;

drop policy if exists invites_owner on public.invites;
create policy invites_owner on public.invites for all to authenticated
  using (public.has_role(array['owner']::public.app_role[]))
  with check (public.has_role(array['owner']::public.app_role[]));

-- ───────────────────────────────────────────── site content: draft & published
create table if not exists public.site_state (
  slot        text primary key check (slot in ('draft', 'live')),
  payload     jsonb not null check (jsonb_typeof(payload) = 'object' and pg_column_size(payload) < 4194304),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null
);

create table if not exists public.versions (
  v            integer primary key,
  payload      jsonb not null,
  note         text not null default '' check (length(note) <= 200),
  changes      jsonb not null default '[]' check (jsonb_typeof(changes) = 'array'),
  created_by   uuid references auth.users(id) on delete set null,
  author       text not null default '',
  author_role  public.app_role,
  created_at   timestamptz not null default now()
);

create or replace function public.stamp_site_state() returns trigger
language plpgsql as $$
begin new.updated_at := now(); new.updated_by := auth.uid(); return new; end $$;
drop trigger if exists site_state_stamp on public.site_state;
create trigger site_state_stamp before insert or update on public.site_state
  for each row execute function public.stamp_site_state();

alter table public.site_state enable row level security;
alter table public.versions   enable row level security;

drop policy if exists site_live_public on public.site_state;
create policy site_live_public on public.site_state for select to anon, authenticated
  using (slot = 'live' or public.app_user_role() is not null);
drop policy if exists site_draft_write on public.site_state;
create policy site_draft_write on public.site_state for insert to authenticated
  with check (slot = 'draft' and public.has_role(array['owner','manager','editor']::public.app_role[]));
drop policy if exists site_draft_update on public.site_state;
create policy site_draft_update on public.site_state for update to authenticated
  using (slot = 'draft' and public.has_role(array['owner','manager','editor']::public.app_role[]))
  with check (slot = 'draft');

drop policy if exists versions_staff_read on public.versions;
create policy versions_staff_read on public.versions for select to authenticated
  using (public.app_user_role() is not null);
-- versions are written only by publish()

-- draft → live, and a new version; owner / manager only
create or replace function public.publish(note text default '', changes jsonb default '[]')
returns integer language plpgsql security definer set search_path = public as $$
declare d jsonb; n integer; who public.profiles;
begin
  if not public.has_role(array['owner','manager']::public.app_role[]) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(72611);
  select payload into d from public.site_state where slot = 'draft';
  if d is null then raise exception 'no_draft' using errcode = 'P0002'; end if;
  select * into who from public.profiles where id = auth.uid();
  insert into public.site_state (slot, payload) values ('live', d)
    on conflict (slot) do update set payload = excluded.payload;
  select coalesce(max(v), 0) + 1 into n from public.versions;
  insert into public.versions (v, payload, note, changes, created_by, author, author_role)
  values (n, d, left(coalesce(note, ''), 200), coalesce(changes, '[]'), auth.uid(), coalesce(nullif(who.name, ''), who.email), who.role);
  return n;
end $$;

-- a stored version → draft (the live site changes only on the next publish)
create or replace function public.restore_version(version integer)
returns void language plpgsql security definer set search_path = public as $$
declare p jsonb;
begin
  if not public.has_role(array['owner','manager']::public.app_role[]) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select payload into p from public.versions where v = version;
  if p is null then raise exception 'no_version' using errcode = 'P0002'; end if;
  insert into public.site_state (slot, payload) values ('draft', p)
    on conflict (slot) do update set payload = excluded.payload;
end $$;

-- ───────────────────────────────────────────── media library
create table if not exists public.media (
  id          text primary key check (id ~ '^[A-Za-z0-9_-]{3,64}$'),
  name        text not null check (length(name) between 1 and 200),
  title       text check (length(title) <= 200),
  kind        text not null check (kind in ('image', 'video', 'doc')),
  ext         text not null check (ext ~ '^[a-z0-9]{2,5}$'),
  size        bigint not null default 0 check (size >= 0),
  opt_size    bigint,
  w           integer, h integer,
  folder      text not null default 'projects' check (length(folder) <= 64),
  path        text,                       -- object path in the "media" bucket
  url         text,                       -- public URL (or a bundled clip like media/box.mp4)
  clip        text check (clip ~ '^[a-z]{2,20}$'),
  created_by  uuid references auth.users(id) on delete set null,
  author      text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists public.media_folders (
  id    text primary key check (id ~ '^[A-Za-z0-9_-]{2,64}$'),
  name  text not null check (length(name) between 1 and 80)
);

alter table public.media         enable row level security;
alter table public.media_folders enable row level security;

drop policy if exists media_public_read on public.media;
create policy media_public_read on public.media for select to anon, authenticated using (true);
drop policy if exists media_edit on public.media;
create policy media_edit on public.media for insert to authenticated
  with check (public.has_role(array['owner','manager','editor']::public.app_role[]));
drop policy if exists media_update on public.media;
create policy media_update on public.media for update to authenticated
  using (public.has_role(array['owner','manager','editor']::public.app_role[]));
drop policy if exists media_delete on public.media;
create policy media_delete on public.media for delete to authenticated
  using (public.has_role(array['owner','manager']::public.app_role[]));

drop policy if exists folders_read on public.media_folders;
create policy folders_read on public.media_folders for select to authenticated using (public.app_user_role() is not null);
drop policy if exists folders_write on public.media_folders;
create policy folders_write on public.media_folders for insert to authenticated
  with check (public.has_role(array['owner','manager','editor']::public.app_role[]));
drop policy if exists folders_delete on public.media_folders;
create policy folders_delete on public.media_folders for delete to authenticated
  using (public.has_role(array['owner','manager']::public.app_role[]));

-- the five background clips that ship with the site
insert into public.media (id, name, title, kind, ext, size, folder, url, clip, author) values
  ('m-clip-dieline',  'dieline.mp4',  'رسم الفرد',        'video', 'mp4', 214078,  'video', 'media/dieline.mp4',  'dieline',  'النظام'),
  ('m-clip-box',      'box.mp4',      'علبة تدور',         'video', 'mp4', 192082,  'video', 'media/box.mp4',      'box',      'النظام'),
  ('m-clip-halftone', 'halftone.mp4', 'شبكة CMYK',         'video', 'mp4', 1960004, 'video', 'media/halftone.mp4', 'halftone', 'النظام'),
  ('m-clip-flute',    'flute.mp4',    'الكرتون المموج',    'video', 'mp4', 400644,  'video', 'media/flute.mp4',    'flute',    'النظام'),
  ('m-clip-sheet',    'sheet.mp4',    'فرخ المطبعة',       'video', 'mp4', 406562,  'video', 'media/sheet.mp4',    'sheet',    'النظام')
on conflict (id) do nothing;

-- ───────────────────────────────────────────── contact-form leads
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  status      text not null default 'new' check (status in ('new', 'progress', 'done', 'spam')),
  name        text not null check (length(btrim(name)) between 1 and 120),
  company     text check (length(company) <= 120),
  email       text not null check (length(email) <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone       text check (length(phone) <= 40),
  type        text check (length(type) <= 80),
  budget      text check (length(budget) <= 80),
  msg         text not null check (length(btrim(msg)) between 1 and 5000),
  lang        text check (lang in ('ar', 'en')),
  files       jsonb not null default '[]' check (jsonb_typeof(files) = 'array' and jsonb_array_length(files) <= 5)
);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (lower(email), created_at desc);

-- rate limit: 3 requests per email per hour, 30 per minute overall
create or replace function public.leads_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then new.status := 'new'; end if;
  if (select count(*) from public.leads where lower(email) = lower(new.email) and created_at > now() - interval '1 hour') >= 3
     or (select count(*) from public.leads where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'rate_limited' using errcode = '54000';
  end if;
  return new;
end $$;
drop trigger if exists leads_rate_limit on public.leads;
create trigger leads_rate_limit before insert on public.leads
  for each row execute function public.leads_guard();

alter table public.leads enable row level security;
drop policy if exists leads_submit on public.leads;
create policy leads_submit on public.leads for insert to anon, authenticated with check (status = 'new');
drop policy if exists leads_staff_read on public.leads;
create policy leads_staff_read on public.leads for select to authenticated using (public.app_user_role() is not null);
drop policy if exists leads_staff_update on public.leads;
create policy leads_staff_update on public.leads for update to authenticated
  using (public.has_role(array['owner','manager','editor']::public.app_role[]));
drop policy if exists leads_delete on public.leads;
create policy leads_delete on public.leads for delete to authenticated
  using (public.has_role(array['owner','manager']::public.app_role[]));

-- ───────────────────────────────────────────── activity feed
create table if not exists public.activity (
  id        bigserial primary key,
  at        timestamptz not null default now(),
  user_id   uuid references auth.users(id) on delete set null default auth.uid(),
  author    text not null default '',
  text      text not null check (length(text) between 1 and 300)
);
alter table public.activity enable row level security;
drop policy if exists activity_read on public.activity;
create policy activity_read on public.activity for select to authenticated using (public.app_user_role() is not null);
drop policy if exists activity_write on public.activity;
create policy activity_write on public.activity for insert to authenticated
  with check (user_id = auth.uid() and public.app_user_role() is not null);

-- ───────────────────────────────────────────── file storage
-- media: public files for the website (size and type limits enforced by Storage)
-- lead-files: private attachments from the contact form, readable by staff only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('media', 'media', true, 209715200, array[
    'image/jpeg','image/png','image/webp','image/svg+xml',
    'video/mp4','video/webm','video/quicktime',
    'application/pdf','application/postscript','application/illustrator','image/vnd.adobe.photoshop',
    'application/zip','application/x-zip-compressed','application/octet-stream']),
  ('lead-files', 'lead-files', false, 26214400, array[
    'application/pdf','application/postscript','application/illustrator','image/vnd.adobe.photoshop',
    'application/zip','application/x-zip-compressed','application/octet-stream',
    'image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists media_files_write on storage.objects;
create policy media_files_write on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.has_role(array['owner','manager','editor']::public.app_role[]));
drop policy if exists media_files_update on storage.objects;
create policy media_files_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.has_role(array['owner','manager','editor']::public.app_role[]));
drop policy if exists media_files_delete on storage.objects;
create policy media_files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.has_role(array['owner','manager']::public.app_role[]));

-- visitors may only add files under incoming/<uuid>/…, never list, read or overwrite them
drop policy if exists lead_files_upload on storage.objects;
create policy lead_files_upload on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'lead-files' and (storage.foldername(name))[1] = 'incoming'
              and (storage.foldername(name))[2] ~ '^[0-9a-f-]{36}$');
drop policy if exists lead_files_staff_read on storage.objects;
create policy lead_files_staff_read on storage.objects for select to authenticated
  using (bucket_id = 'lead-files' and public.app_user_role() is not null);

grant execute on function public.has_owner() to anon, authenticated;
grant execute on function public.app_user_role(), public.has_role(public.app_role[]) to anon, authenticated;
revoke execute on function public.publish(text, jsonb), public.restore_version(integer),
  public.set_user_access(uuid, public.app_role, boolean) from public, anon;
grant execute on function public.publish(text, jsonb), public.restore_version(integer),
  public.set_user_access(uuid, public.app_role, boolean) to authenticated;
