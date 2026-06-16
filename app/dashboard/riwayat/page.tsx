import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/actions/auth'
import { RiwayatClient } from '@/components/dashboard/RiwayatClient'
import type { TahfidzSubmission, TahsinSubmission } from '@/lib/types'
import { redirect } from 'next/navigation'

interface Props {
  searchParams: Promise<{ bulan?: string; tahun?: string }>
}

export default async function RiwayatPage({ searchParams }: Props) {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')
  if (profile.role !== 'koordinator' && profile.role !== 'admin') redirect('/dashboard')

  const params = await searchParams
  const now = new Date()
  const month = Number(params.bulan ?? now.getMonth() + 1)
  const year = Number(params.tahun ?? now.getFullYear())

  // Rentang bulan terpilih (pola sama dengan halaman /rekap)
  const from = new Date(year, month - 1, 1).toISOString()
  const to = new Date(year, month, 1).toISOString() // batas atas eksklusif

  const supabase = await createClient()

  const tfQuery = supabase
    .from('tahfidz_submissions')
    .select('*')
    .eq('status', 'selesai')
    .gte('jadwal', from)
    .lt('jadwal', to)
    .order('jadwal', { ascending: true })
  const tsQuery = supabase
    .from('tahsin_submissions')
    .select('*')
    .eq('status', 'selesai')
    .gte('jadwal', from)
    .lt('jadwal', to)
    .order('jadwal', { ascending: true })
  if (profile.unit) {
    tfQuery.eq('unit', profile.unit)
    tsQuery.eq('unit', profile.unit)
  }

  const [{ data: tfData }, { data: tsData }] = await Promise.all([tfQuery, tsQuery])

  return (
    <div className="pb-24 sm:pb-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Riwayat Ujian</h1>
        <p className="text-sm text-gray-500 mt-1">
          {profile.unit ? `Unit ${profile.unit} · ` : 'Semua Unit · '}Ujian selesai per bulan & penguji
        </p>
      </div>

      <RiwayatClient
        tahfidz={(tfData ?? []) as TahfidzSubmission[]}
        tahsin={(tsData ?? []) as TahsinSubmission[]}
        month={month}
        year={year}
      />
    </div>
  )
}
