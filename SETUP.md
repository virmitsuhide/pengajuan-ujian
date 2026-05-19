# Setup Guide — Pengajuan Ujian Tahsin & Tahfidz

## 1. Buat Supabase Project

1. Buka https://supabase.com dan buat project baru
2. Tunggu project selesai setup

## 2. Jalankan SQL Migration

Di Supabase Dashboard → SQL Editor, jalankan isi file:
`supabase/migrations/001_schema.sql`

## 3. Set Environment Variables

Copy `.env.local.example` ke `.env.local` dan isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Nilai-nilai ini ada di: Supabase Dashboard → Project Settings → API

## 4. Seed Akun Koordinator

```bash
npm run seed
```

Ini akan membuat 2 akun:
- `koorsd` / `bismillah` (Koordinator SD)
- `koorsmp` / `alhamdulillah` (Koordinator SMP)

## 5. Jalankan Development Server

```bash
npm run dev
```

Buka http://localhost:3000

## Deploy ke Vercel

1. Push project ke GitHub
2. Import di vercel.com
3. Set environment variables di Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (untuk seed, opsional setelah deploy)

## Struktur Halaman

| Halaman | Akses | Keterangan |
|---------|-------|------------|
| `/` | Publik | Antrian ujian aktif (SD & SMP) |
| `/login` | Publik | Login koordinator |
| `/dashboard` | Auth | Ringkasan + aksi cepat |
| `/dashboard/submit` | Auth | Form pengajuan baru |
| `/dashboard/submissions` | Auth | Kelola semua pengajuan |
