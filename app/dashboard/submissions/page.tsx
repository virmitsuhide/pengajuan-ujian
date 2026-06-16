import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/actions/auth'
import { getCreatorMap } from '@/lib/actions/users'
import { listPengujis } from '@/lib/actions/pengujis'
import { SubmissionsClient } from '@/components/dashboard/SubmissionsClient'
import { MarkSeen } from '@/components/dashboard/MarkSeen'
import type { TahfidzSubmission, TahsinSubmission } from '@/lib/types'
import { redirect } from 'next/navigation'

export default async function SubmissionsPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  const tfQuery = supabase.from('tahfidz_submissions').select('*').order('created_at', { ascending: false })
  const tsQuery = supabase.from('tahsin_submissions').select('*').order('created_at', { ascending: false })
  if (profile.unit) {
    tfQuery.eq('unit', profile.unit)
    tsQuery.eq('unit', profile.unit)
  }

  const [{ data: tahfidzData }, { data: tahsinData }] = await Promise.all([tfQuery, tsQuery])

  const creatorMap = (profile.role === 'koordinator' || profile.role === 'admin') ? await getCreatorMap() : {}
  const pengujis = await listPengujis()

  return (
    <div className="pb-24 sm:pb-6">
      {(profile.role === 'koordinator' || profile.role === 'admin') && <MarkSeen />}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Kelola Pengajuan</h1>
        <p className="text-sm text-gray-500 mt-1">
          {profile.unit ? `Unit ${profile.unit} · ` : 'Semua Unit · '}{(tahfidzData?.length ?? 0) + (tahsinData?.length ?? 0)} total
        </p>
      </div>

      <SubmissionsClient
        tahfidz={(tahfidzData ?? []) as TahfidzSubmission[]}
        tahsin={(tahsinData ?? []) as TahsinSubmission[]}
        unit={profile.unit ?? 'SD'}
        canEdit={profile.role === 'koordinator' || profile.role === 'admin'}
        creatorMap={creatorMap}
        pengujiOptions={pengujis.map((p) => p.nama)}
      />
    </div>
  )
}
