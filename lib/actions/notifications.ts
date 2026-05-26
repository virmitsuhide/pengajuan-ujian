'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from './auth'

export async function getUnseenCount(): Promise<number> {
  const supabase = await createClient()
  const profile = await getUserProfile()
  if (!profile || (profile.role !== 'koordinator' && profile.role !== 'admin')) return 0

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const lastSeen = user?.user_metadata?.last_seen_submissions_at as string | undefined

  // Belum pernah buka halaman Kelola → mulai track dari sekarang, tampilkan 0
  if (!lastSeen) return 0

  const tfQuery = supabase
    .from('tahfidz_submissions')
    .select('*', { count: 'exact', head: true })
    .gt('created_at', lastSeen)
  const tsQuery = supabase
    .from('tahsin_submissions')
    .select('*', { count: 'exact', head: true })
    .gt('created_at', lastSeen)

  if (profile.unit) {
    tfQuery.eq('unit', profile.unit)
    tsQuery.eq('unit', profile.unit)
  }

  const [{ count: tfCount }, { count: tsCount }] = await Promise.all([tfQuery, tsQuery])

  return (tfCount ?? 0) + (tsCount ?? 0)
}

export async function markSubmissionsSeen(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.updateUser({
    data: { last_seen_submissions_at: new Date().toISOString() },
  })
}
