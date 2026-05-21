'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from './auth'

export async function getUnseenCount(): Promise<number> {
  const supabase = await createClient()
  const profile = await getUserProfile()
  if (!profile || profile.role !== 'koordinator') return 0

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const lastSeen = user?.user_metadata?.last_seen_submissions_at as string | undefined

  // Belum pernah buka halaman Kelola → mulai track dari sekarang, tampilkan 0
  if (!lastSeen) return 0

  const [{ count: tfCount }, { count: tsCount }] = await Promise.all([
    supabase
      .from('tahfidz_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('unit', profile.unit)
      .gt('created_at', lastSeen),
    supabase
      .from('tahsin_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('unit', profile.unit)
      .gt('created_at', lastSeen),
  ])

  return (tfCount ?? 0) + (tsCount ?? 0)
}

export async function markSubmissionsSeen(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.updateUser({
    data: { last_seen_submissions_at: new Date().toISOString() },
  })
}
