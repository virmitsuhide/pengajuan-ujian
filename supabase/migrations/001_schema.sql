-- ============================================================
-- Tabel: tahfidz_submissions
-- ============================================================
create table if not exists public.tahfidz_submissions (
  id          uuid primary key default gen_random_uuid(),
  unit        text not null check (unit in ('SD', 'SMP')),
  tipe        text not null check (tipe in ('1_juz', '3_juz', '5_juz')),
  juz         text not null,
  nama_siswa  text not null,
  nama_ayah   text not null,
  kelas       text not null,
  jadwal      timestamptz,
  penguji     text,
  predikat    text check (predikat in ('mumtaz', 'jayyid_jiddan', 'jayyid', 'maqbul', 'mengulang')),
  catatan     text,
  status      text not null default 'diajukan'
                check (status in ('diajukan', 'dijadwalkan', 'selesai')),
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- Tabel: tahsin_submissions
-- ============================================================
create table if not exists public.tahsin_submissions (
  id             uuid primary key default gen_random_uuid(),
  unit           text not null check (unit in ('SD', 'SMP')),
  nama_kelompok  text not null,
  sesi           text not null,
  level          text not null,
  siswa          jsonb not null default '[]'::jsonb,
  jadwal         timestamptz,
  penguji        text,
  catatan        text,
  status         text not null default 'diajukan'
                   check (status in ('diajukan', 'dijadwalkan', 'selesai')),
  created_by     uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tahfidz_set_updated_at
  before update on public.tahfidz_submissions
  for each row execute function public.set_updated_at();

create trigger tahsin_set_updated_at
  before update on public.tahsin_submissions
  for each row execute function public.set_updated_at();

-- ============================================================
-- Enable RLS
-- ============================================================
alter table public.tahfidz_submissions enable row level security;
alter table public.tahsin_submissions enable row level security;

-- ============================================================
-- Grant table access to anon (public read) and authenticated
-- ============================================================
grant select on public.tahfidz_submissions to anon;
grant select on public.tahsin_submissions to anon;

grant select, insert, update, delete on public.tahfidz_submissions to authenticated;
grant select, insert, update, delete on public.tahsin_submissions to authenticated;

-- ============================================================
-- RLS Policies
-- ============================================================

-- Public can read all (for antrian page)
create policy "public_read_tahfidz"
  on public.tahfidz_submissions for select
  to anon
  using (true);

create policy "public_read_tahsin"
  on public.tahsin_submissions for select
  to anon
  using (true);

-- Authenticated: SELECT all (coordinator can see all for reference)
create policy "auth_read_tahfidz"
  on public.tahfidz_submissions for select
  to authenticated
  using (true);

create policy "auth_read_tahsin"
  on public.tahsin_submissions for select
  to authenticated
  using (true);

-- Authenticated: INSERT only their own unit
-- unit check uses app_metadata (not user-editable)
create policy "auth_insert_tahfidz"
  on public.tahfidz_submissions for insert
  to authenticated
  with check (
    unit = (auth.jwt() -> 'app_metadata' ->> 'unit')
  );

create policy "auth_insert_tahsin"
  on public.tahsin_submissions for insert
  to authenticated
  with check (
    unit = (auth.jwt() -> 'app_metadata' ->> 'unit')
  );

-- Authenticated: UPDATE only their own unit
create policy "auth_update_tahfidz"
  on public.tahfidz_submissions for update
  to authenticated
  using (unit = (auth.jwt() -> 'app_metadata' ->> 'unit'))
  with check (unit = (auth.jwt() -> 'app_metadata' ->> 'unit'));

create policy "auth_update_tahsin"
  on public.tahsin_submissions for update
  to authenticated
  using (unit = (auth.jwt() -> 'app_metadata' ->> 'unit'))
  with check (unit = (auth.jwt() -> 'app_metadata' ->> 'unit'));

-- Authenticated: DELETE only their own unit
create policy "auth_delete_tahfidz"
  on public.tahfidz_submissions for delete
  to authenticated
  using (unit = (auth.jwt() -> 'app_metadata' ->> 'unit'));

create policy "auth_delete_tahsin"
  on public.tahsin_submissions for delete
  to authenticated
  using (unit = (auth.jwt() -> 'app_metadata' ->> 'unit'));
