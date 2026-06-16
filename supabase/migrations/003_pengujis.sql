-- ============================================================
-- Tabel: pengujis (master data daftar penguji, satu daftar bersama SD & SMP)
-- ============================================================
create table if not exists public.pengujis (
  id         uuid primary key default gen_random_uuid(),
  nama       text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Enable RLS
-- ============================================================
alter table public.pengujis enable row level security;

-- ============================================================
-- Baca: semua user terautentikasi (untuk dropdown penjadwalan & halaman riwayat)
-- Tulis (insert/delete) dilakukan via service-role admin client di server action,
-- sehingga tidak perlu grant insert/delete ke role authenticated.
-- ============================================================
grant select on public.pengujis to authenticated;

create policy "auth_read_pengujis"
  on public.pengujis for select
  to authenticated
  using (true);
