'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getUserProfile } from './auth'
import type { SubmissionStatus, Predikat, TahfidzTipe, SiswaItem } from '@/lib/types'

// ─── Tahfidz Actions ──────────────────────────────────────────────────────────

export async function createTahfidzSubmission(data: {
  tipe: TahfidzTipe
  juz: string
  nama_siswa: string
  nama_ayah: string
  kelas: string
}) {
  const supabase = await createClient()
  const profile = await getUserProfile()
  if (!profile) return { error: 'Tidak terautentikasi' }

  const { error } = await supabase.from('tahfidz_submissions').insert({
    unit: profile.unit,
    tipe: data.tipe,
    juz: data.juz,
    nama_siswa: data.nama_siswa,
    nama_ayah: data.nama_ayah,
    kelas: data.kelas,
    status: 'diajukan',
    created_by: profile.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/dashboard/submissions')
  return { success: true }
}

export async function updateTahfidzSubmission(
  id: string,
  data: {
    jadwal?: string | null
    penguji?: string | null
    predikat?: Predikat | null
    catatan?: string | null
    status?: SubmissionStatus
  }
) {
  const supabase = await createClient()
  const profile = await getUserProfile()
  if (!profile) return { error: 'Tidak terautentikasi' }

  const { error } = await supabase
    .from('tahfidz_submissions')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('unit', profile.unit) // RLS: only own unit

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/dashboard/submissions')
  return { success: true }
}

export async function deleteTahfidzSubmission(id: string) {
  const supabase = await createClient()
  const profile = await getUserProfile()
  if (!profile) return { error: 'Tidak terautentikasi' }

  const { error } = await supabase
    .from('tahfidz_submissions')
    .delete()
    .eq('id', id)
    .eq('unit', profile.unit)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/dashboard/submissions')
  return { success: true }
}

// ─── Tahsin Actions ───────────────────────────────────────────────────────────

export async function createTahsinSubmission(data: {
  nama_kelompok: string
  sesi: string
  level: string
  siswa: SiswaItem[]
}) {
  const supabase = await createClient()
  const profile = await getUserProfile()
  if (!profile) return { error: 'Tidak terautentikasi' }

  const { error } = await supabase.from('tahsin_submissions').insert({
    unit: profile.unit,
    nama_kelompok: data.nama_kelompok,
    sesi: data.sesi,
    level: data.level,
    siswa: data.siswa,
    status: 'diajukan',
    created_by: profile.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/dashboard/submissions')
  return { success: true }
}

export async function updateTahsinSubmission(
  id: string,
  data: {
    jadwal?: string | null
    penguji?: string | null
    siswa?: SiswaItem[]
    catatan?: string | null
    status?: SubmissionStatus
  }
) {
  const supabase = await createClient()
  const profile = await getUserProfile()
  if (!profile) return { error: 'Tidak terautentikasi' }

  const { error } = await supabase
    .from('tahsin_submissions')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('unit', profile.unit)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/dashboard/submissions')
  return { success: true }
}

export async function deleteTahsinSubmission(id: string) {
  const supabase = await createClient()
  const profile = await getUserProfile()
  if (!profile) return { error: 'Tidak terautentikasi' }

  const { error } = await supabase
    .from('tahsin_submissions')
    .delete()
    .eq('id', id)
    .eq('unit', profile.unit)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/dashboard/submissions')
  return { success: true }
}
