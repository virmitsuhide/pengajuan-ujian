import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/actions/auth'
import Link from 'next/link'
import { getStatusColor, getStatusLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { PlusCircle, ListChecks, ExternalLink, CheckCircle2, Clock, Calendar } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const profile = await getUserProfile()
  if (!profile) return null

  const [{ data: tfData }, { data: tsData }] = await Promise.all([
    supabase
      .from('tahfidz_submissions')
      .select('id, nama_siswa, status, created_at')
      .eq('unit', profile.unit)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('tahsin_submissions')
      .select('id, nama_kelompok, status, created_at')
      .eq('unit', profile.unit)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const [{ count: tfTotal }, { count: tsTotal }, { count: tfDone }, { count: tsDone }, { count: tfScheduled }, { count: tsScheduled }] =
    await Promise.all([
      supabase.from('tahfidz_submissions').select('*', { count: 'exact', head: true }).eq('unit', profile.unit),
      supabase.from('tahsin_submissions').select('*', { count: 'exact', head: true }).eq('unit', profile.unit),
      supabase.from('tahfidz_submissions').select('*', { count: 'exact', head: true }).eq('unit', profile.unit).eq('status', 'selesai'),
      supabase.from('tahsin_submissions').select('*', { count: 'exact', head: true }).eq('unit', profile.unit).eq('status', 'selesai'),
      supabase.from('tahfidz_submissions').select('*', { count: 'exact', head: true }).eq('unit', profile.unit).eq('status', 'dijadwalkan'),
      supabase.from('tahsin_submissions').select('*', { count: 'exact', head: true }).eq('unit', profile.unit).eq('status', 'dijadwalkan'),
    ])

  const stats = [
    {
      label: 'Total Pengajuan',
      value: (tfTotal ?? 0) + (tsTotal ?? 0),
      icon: ListChecks,
      color: 'text-gray-700',
      bg: 'bg-gray-100',
    },
    {
      label: 'Dijadwalkan',
      value: (tfScheduled ?? 0) + (tsScheduled ?? 0),
      icon: Calendar,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
    },
    {
      label: 'Selesai',
      value: (tfDone ?? 0) + (tsDone ?? 0),
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Menunggu',
      value: (tfTotal ?? 0) + (tsTotal ?? 0) - (tfDone ?? 0) - (tsDone ?? 0) - (tfScheduled ?? 0) - (tsScheduled ?? 0),
      icon: Clock,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div className="pb-24 sm:pb-6 flex flex-col gap-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white">
        <p className="text-emerald-100 text-sm">Selamat datang,</p>
        <h1 className="text-xl font-bold mt-0.5">Koordinator {profile.unit}</h1>
        <p className="text-emerald-100 text-sm mt-3">
          Kelola pengajuan ujian Tahsin & Tahfidz untuk unit {profile.unit}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/dashboard/submit"
          className="bg-emerald-600 text-white rounded-2xl p-4 flex flex-col gap-2 hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <PlusCircle className="w-6 h-6" />
          <p className="font-semibold">Ajukan Baru</p>
          <p className="text-xs text-emerald-100">Tahsin atau Tahfidz</p>
        </Link>
        <Link
          href="/dashboard/submissions"
          className="bg-white border border-gray-200 text-gray-700 rounded-2xl p-4 flex flex-col gap-2 hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ListChecks className="w-6 h-6 text-gray-500" />
          <p className="font-semibold">Kelola</p>
          <p className="text-xs text-gray-400">Semua pengajuan</p>
        </Link>
      </div>

      {/* Recent Tahfidz */}
      {(tfData?.length ?? 0) > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800">Tahfidz Terbaru</h2>
            <Link href="/dashboard/submissions" className="text-xs text-emerald-600 flex items-center gap-1">
              Lihat semua <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {tfData!.map((item) => (
              <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-2">
                <p className="text-sm text-gray-800 font-medium truncate">{item.nama_siswa}</p>
                <Badge className={getStatusColor(item.status as any)}>
                  {getStatusLabel(item.status as any)}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Tahsin */}
      {(tsData?.length ?? 0) > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800">Tahsin Terbaru</h2>
            <Link href="/dashboard/submissions" className="text-xs text-emerald-600 flex items-center gap-1">
              Lihat semua <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {tsData!.map((item) => (
              <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-2">
                <p className="text-sm text-gray-800 font-medium truncate">{item.nama_kelompok}</p>
                <Badge className={getStatusColor(item.status as any)}>
                  {getStatusLabel(item.status as any)}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* View public queue */}
      <Link
        href="/"
        className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 py-2"
      >
        <ExternalLink className="w-4 h-4" />
        Lihat antrian publik
      </Link>
    </div>
  )
}
