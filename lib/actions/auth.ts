'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserUnit(): Promise<'SD' | 'SMP' | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null
  // unit is stored in app_metadata (set by admin/seed, not user-editable)
  return (user.app_metadata?.unit as 'SD' | 'SMP') ?? null
}

export async function getUserProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return {
    id: user.id,
    username: user.app_metadata?.username as string,
    unit: user.app_metadata?.unit as 'SD' | 'SMP',
    role: (user.app_metadata?.role ?? 'koordinator') as 'koordinator' | 'guru',
  }
}
