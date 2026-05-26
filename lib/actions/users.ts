'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getUserProfile } from '@/lib/actions/auth'
import { usernameToEmail } from '@/lib/utils'
import type { GuruAccount, KoordinatorAccount, Unit } from '@/lib/types'

async function requireKoordinatorOrAdmin() {
  const profile = await getUserProfile()
  if (!profile || (profile.role !== 'koordinator' && profile.role !== 'admin')) {
    throw new Error('Akses ditolak')
  }
  return profile
}

async function requireAdmin() {
  const profile = await getUserProfile()
  if (!profile || profile.role !== 'admin') {
    throw new Error('Akses ditolak: hanya admin')
  }
  return profile
}

export async function listGuru(): Promise<GuruAccount[]> {
  const profile = await requireKoordinatorOrAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.listUsers()
  if (error) return []

  return data.users
    .filter((u) => {
      if (u.app_metadata?.role !== 'guru') return false
      if (profile.role === 'admin') return true
      return u.app_metadata?.unit === profile.unit
    })
    .map((u) => ({
      id: u.id,
      username: u.app_metadata?.username as string,
      unit: u.app_metadata?.unit as 'SD' | 'SMP',
      created_at: u.created_at,
    }))
    .sort((a, b) => a.username.localeCompare(b.username))
}

export async function createGuru(data: {
  username: string
  password: string
  unit?: Unit
}): Promise<{ error?: string }> {
  const profile = await requireKoordinatorOrAdmin()
  const admin = createAdminClient()

  const targetUnit = profile.role === 'admin' ? data.unit : profile.unit
  if (!targetUnit) return { error: 'Unit harus dipilih' }

  const email = usernameToEmail(data.username)

  const { error } = await admin.auth.admin.createUser({
    email,
    password: data.password,
    email_confirm: true,
    app_metadata: {
      username: data.username,
      unit: targetUnit,
      role: 'guru',
    },
  })

  if (error) {
    if (error.message.includes('already been registered')) {
      return { error: 'Username sudah digunakan' }
    }
    return { error: error.message }
  }

  return {}
}

export async function getCreatorMap(): Promise<Record<string, string>> {
  const profile = await requireKoordinatorOrAdmin()
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.listUsers()
  if (error) return {}

  const map: Record<string, string> = {}
  data.users
    .filter((u) => profile.role === 'admin' || u.app_metadata?.unit === profile.unit)
    .forEach((u) => {
      if (u.app_metadata?.username) {
        map[u.id] = u.app_metadata.username as string
      }
    })
  return map
}

export async function deleteGuru(userId: string): Promise<{ error?: string }> {
  await requireKoordinatorOrAdmin()
  const admin = createAdminClient()

  const { data: target } = await admin.auth.admin.getUserById(userId)
  if (!target.user || target.user.app_metadata?.role !== 'guru') {
    return { error: 'User tidak ditemukan atau bukan guru' }
  }

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }

  return {}
}

// ─── Fungsi admin: kelola akun koordinator ───────────────────────────────────

export async function listKoordinator(): Promise<KoordinatorAccount[]> {
  await requireAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.listUsers()
  if (error) return []

  return data.users
    .filter((u) => u.app_metadata?.role === 'koordinator')
    .map((u) => ({
      id: u.id,
      username: u.app_metadata?.username as string,
      unit: u.app_metadata?.unit as Unit,
      created_at: u.created_at,
    }))
    .sort((a, b) => a.username.localeCompare(b.username))
}

export async function createKoordinator(data: {
  username: string
  password: string
  unit: Unit
}): Promise<{ error?: string }> {
  await requireAdmin()
  const admin = createAdminClient()

  const email = usernameToEmail(data.username)

  const { error } = await admin.auth.admin.createUser({
    email,
    password: data.password,
    email_confirm: true,
    app_metadata: {
      username: data.username,
      unit: data.unit,
      role: 'koordinator',
    },
  })

  if (error) {
    if (error.message.includes('already been registered')) {
      return { error: 'Username sudah digunakan' }
    }
    return { error: error.message }
  }

  return {}
}

export async function updateKoordinatorPassword(
  userId: string,
  newPassword: string
): Promise<{ error?: string }> {
  await requireAdmin()
  const admin = createAdminClient()

  const { data: target } = await admin.auth.admin.getUserById(userId)
  if (!target.user || target.user.app_metadata?.role !== 'koordinator') {
    return { error: 'User tidak ditemukan atau bukan koordinator' }
  }

  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword })
  if (error) return { error: error.message }

  return {}
}

export async function deleteKoordinator(userId: string): Promise<{ error?: string }> {
  await requireAdmin()
  const admin = createAdminClient()

  const { data: target } = await admin.auth.admin.getUserById(userId)
  if (!target.user || target.user.app_metadata?.role !== 'koordinator') {
    return { error: 'User tidak ditemukan atau bukan koordinator' }
  }

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }

  return {}
}
