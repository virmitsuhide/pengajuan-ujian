import { createClient } from '@/lib/supabase/server'
import { PublicHeader } from '@/components/public/PublicHeader'
import { RekapClient } from '@/components/public/RekapClient'
import type { TahfidzSubmission, TahsinSubmission } from '@/lib/types'

export const revalidate = 60

interface Props {
  searchParams: Promise<{ bulan?: string; tahun?: string }>
}

export default async function RekapPage({ searchParams }: Props) {
  const params = await searchParams
  const now = new Date()
  const month = Number(params.bulan ?? now.getMonth() + 1)
  const year = Number(params.tahun ?? now.getFullYear())

  // Date range for the selected month
  const from = new Date(year, month - 1, 1).toISOString()
  const to = new Date(year, month, 1).toISOString() // exclusive upper bound

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: tahfidzData }, { data: tahsinData }] = await Promise.all([
    supabase
      .from('tahfidz_submissions')
      .select('*')
      .eq('status', 'selesai')
      .gte('jadwal', from)
      .lt('jadwal', to)
      .order('jadwal', { ascending: true }),
    supabase
      .from('tahsin_submissions')
      .select('*')
      .eq('status', 'selesai')
      .gte('jadwal', from)
      .lt('jadwal', to)
      .order('jadwal', { ascending: true }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader isLoggedIn={!!user} />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <RekapClient
          tahfidz={(tahfidzData ?? []) as TahfidzSubmission[]}
          tahsin={(tahsinData ?? []) as TahsinSubmission[]}
          month={month}
          year={year}
        />
      </main>

      <footer className="text-center text-xs text-gray-400 pb-8 mt-4">
        Sistem Manajemen Ujian Tahsin & Tahfidz
      </footer>
    </div>
  )
}
