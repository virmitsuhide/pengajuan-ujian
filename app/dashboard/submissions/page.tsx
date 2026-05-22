import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/actions/auth'
import { getCreatorMap } from '@/lib/actions/users'
import { SubmissionsClient } from '@/components/dashboard/SubmissionsClient'
import { MarkSeen } from '@/components/dashboard/MarkSeen'
import type { TahfidzSubmission, TahsinSubmission } from '@/lib/types'
import { redirect } from 'next/navigation'

export default async function SubmissionsPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  const [{ data: tahfidzData }, { data: tahsinData }] = await Promise.all([
    supabase
      .from('tahfidz_submissions')
      .select('*')
      .eq('unit', profile.unit)
      .order('created_at', { ascending: false }),
    supabase
      .from('tahsin_submissions')
      .select('*')
      .eq('unit', profile.unit)
      .order('created_at', { ascending: false }),
  ])

  const creatorMap = profile.role === 'koordinator' ? await getCreatorMap() : {}

  return (
    <div className="pb-24 sm:pb-6">
      {profile.role === 'koordinator' && <MarkSeen />}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Kelola Pengajuan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Unit {profile.unit} · {(tahfidzData?.length ?? 0) + (tahsinData?.length ?? 0)} total
        </p>
      </div>

      <SubmissionsClient
        tahfidz={(tahfidzData ?? []) as TahfidzSubmission[]}
        tahsin={(tahsinData ?? []) as TahsinSubmission[]}
        unit={profile.unit}
        canEdit={profile.role === 'koordinator'}
        creatorMap={creatorMap}
      />
    </div>
  )
}
