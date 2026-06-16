'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/actions/auth'
import { revalidatePath } from 'next/cache'
import type { Penguji } from '@/lib/types'

async function requireKoordinatorOrAdmin() {
  const profile = await getUserProfile()
  if (!profile || (profile.role !== 'koordinator' && profile.role !== 'admin')) {
    throw new Error('Akses ditolak')
  }
  return profile
}

/** Daftar semua penguji (bersama untuk SD & SMP), urut nama. */
export async function listPengujis(): Promise<Penguji[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pengujis')
    .select('*')
    .order('nama', { ascending: true })

  if (error) return []
  return (data ?? []) as Penguji[]
}

export async function createPenguji(nama: string): Promise<{ error?: string }> {
  await requireKoordinatorOrAdmin()

  const trimmed = nama.trim()
  if (trimmed.length < 2) return { error: 'Nama penguji minimal 2 karakter' }

  const admin = createAdminClient()
  const { error } = await admin.from('pengujis').insert({ nama: trimmed })

  if (error) {
    // 23505 = unique_violation
    if (error.code === '23505' || error.message.includes('duplicate')) {
      return { error: 'Nama penguji sudah ada' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard/guru')
  revalidatePath('/dashboard/submissions')
  revalidatePath('/dashboard/riwayat')
  return {}
}

export async function deletePenguji(id: string): Promise<{ error?: string }> {
  await requireKoordinatorOrAdmin()

  const admin = createAdminClient()
  const { error } = await admin.from('pengujis').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/guru')
  revalidatePath('/dashboard/submissions')
  revalidatePath('/dashboard/riwayat')
  return {}
}
