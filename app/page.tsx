import { createClient } from '@/lib/supabase/server'
import { QueueTabs } from '@/components/public/QueueTabs'
import { PublicHeader } from '@/components/public/PublicHeader'
import type { TahfidzSubmission, TahsinSubmission } from '@/lib/types'

export const revalidate = 60

export default async function PublicQueuePage() {
  const supabase = await createClient()

  const [{ data: tahfidzData }, { data: tahsinData }] = await Promise.all([
    supabase
      .from('tahfidz_submissions')
      .select('*')
      .in('status', ['diajukan', 'dijadwalkan'])
      .order('created_at', { ascending: true }),
    supabase
      .from('tahsin_submissions')
      .select('*')
      .in('status', ['diajukan', 'dijadwalkan'])
      .order('created_at', { ascending: true }),
  ])

  const tahfidz = (tahfidzData ?? []) as TahfidzSubmission[]
  const tahsin = (tahsinData ?? []) as TahsinSubmission[]

  function partitionBySchedule<T extends { status: string; unit: string }>(
    items: T[],
    unit: 'SD' | 'SMP'
  ) {
    const unitItems = items.filter((i) => i.unit === unit)
    return {
      unscheduled: unitItems.filter((i) => i.status === 'diajukan'),
      scheduled: unitItems.filter((i) => i.status === 'dijadwalkan'),
    }
  }

  const queueData = {
    tahfidz: {
      sd: partitionBySchedule(tahfidz, 'SD'),
      smp: partitionBySchedule(tahfidz, 'SMP'),
    },
    tahsin: {
      sd: partitionBySchedule(tahsin, 'SD'),
      smp: partitionBySchedule(tahsin, 'SMP'),
    },
  }

  const totalAntrian = tahfidz.length + tahsin.length

  const badge = (
    <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
      {totalAntrian} antrian aktif
    </span>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader badge={badge} />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <QueueTabs {...queueData} />
      </main>

      <footer className="text-center text-xs text-gray-400 pb-8 mt-4">
        Sistem Manajemen Ujian Tahsin & Tahfidz
      </footer>
    </div>
  )
}
