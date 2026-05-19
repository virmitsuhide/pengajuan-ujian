/**
 * Seed koordinator accounts ke Supabase.
 * Jalankan dengan: npx tsx scripts/seed-users.ts
 *
 * Pastikan env vars sudah di-set:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local manually (tsx tidak auto-load file ini)
try {
  const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (key && !process.env[key]) process.env[key] = val
  }
} catch {
  // .env.local tidak ditemukan, lanjut dengan env vars yang ada
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('❌  Set NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY terlebih dahulu.')
  process.exit(1)
}

// Admin client — hanya digunakan di server/scripts, JANGAN expose ke frontend
const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const koordinators = [
  {
    username: 'koorsd',
    email: 'koorsd@tahfidz.internal',
    password: 'bismillah',
    unit: 'SD',
  },
  {
    username: 'koorsmp',
    email: 'koorsmp@tahfidz.internal',
    password: 'alhamdulillah',
    unit: 'SMP',
  },
]

async function seedUsers() {
  console.log('🌱  Memulai seed akun koordinator...\n')

  for (const koor of koordinators) {
    // Check if user already exists
    const { data: existing } = await supabase.auth.admin.listUsers()
    const alreadyExists = existing?.users?.some((u) => u.email === koor.email)

    if (alreadyExists) {
      console.log(`⏭️   ${koor.username} (${koor.unit}) sudah ada, skip.`)
      continue
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: koor.email,
      password: koor.password,
      email_confirm: true,
      // app_metadata is NOT user-editable — safe for RLS
      app_metadata: {
        username: koor.username,
        unit: koor.unit,
      },
    })

    if (error) {
      console.error(`❌  Gagal buat ${koor.username}: ${error.message}`)
    } else {
      console.log(`✅  ${koor.username} (${koor.unit}) — ID: ${data.user?.id}`)
    }
  }

  console.log('\n✨  Selesai!')
}

seedUsers()
