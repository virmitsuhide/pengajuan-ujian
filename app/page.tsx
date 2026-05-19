import { createClient } from '@/lib/supabase/server'
import { QueueTabs } from '@/components/public/QueueTabs'
import type { TahfidzSubmission, TahsinSubmission } from '@/lib/types'
import Link from 'next/link'

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Antrian Ujian</h1>
            <p className="text-xs text-gray-500">Tahsin & Tahfidz</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {totalAntrian} antrian aktif
            </span>
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Koordinator
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <QueueTabs {...queueData} />
      </main>

      <footer className="text-center text-xs text-gray-400 pb-8 mt-4">
        Sistem Manajemen Ujian Tahsin & Tahfidz
      </footer>
    </div>
  )
}
