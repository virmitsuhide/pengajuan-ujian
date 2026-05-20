alter table public.tahfidz_submissions
  add column if not exists is_quls boolean not null default false;
