import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/actions/auth'
import { getUnseenCount } from '@/lib/actions/notifications'
import Link from 'next/link'
import { getStatusColor, getStatusLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { ExamCalendar, type CalendarEvent } from '@/components/dashboard/ExamCalendar'
import { PlusCircle, ListChecks, ExternalLink, CheckCircle2, Clock, Calendar, Users } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const profile = await getUserProfile()
  if (!profile) return null

  const unseenCount = profile.role === 'koordinator' ? await getUnseenCount() : 0

  // Compute current month in WIB (UTC+7) for calendar
  const wibFmt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' })
  const todayWIB = wibFmt.format(new Date())  // YYYY-MM-DD
  const [wibYear, wibMonthNum] = todayWIB.split('-').map(Number)
  const calYear = wibYear
  const calMonth = wibMonthNum - 1  // 0-indexed

  const nextCalYear = calMonth === 11 ? calYear + 1 : calYear
  const nextCalMonthNum = calMonth === 11 ? 1 : wibMonthNum + 1
  const monthStart = `${wibYear}-${String(wibMonthNum).padStart(2, '0')}-01T00:00:00+07:00`
  const monthEnd = `${nextCalYear}-${String(nextCalMonthNum).padStart(2, '0')}-01T00:00:00+07:00`

  const tfRecentQuery = supabase
    .from('tahfidz_submissions')
    .select('id, nama_siswa, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  const tsRecentQuery = supabase
    .from('tahsin_submissions')
    .select('id, nama_kelompok, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  if (profile.unit) {
    tfRecentQuery.eq('unit', profile.unit)
    tsRecentQuery.eq('unit', profile.unit)
  }

  const [{ data: tfData }, { data: tsData }] = await Promise.all([tfRecentQuery, tsRecentQuery])

  const calTfQuery = supabase
    .from('tahfidz_submissions')
    .select('jadwal, nama_siswa')
    .eq('status', 'dijadwalkan')
    .gte('jadwal', monthStart)
    .lt('jadwal', monthEnd)
  const calTsQuery = supabase
    .from('tahsin_submissions')
    .select('jadwal, nama_kelompok')
    .eq('status', 'dijadwalkan')
    .gte('jadwal', monthStart)
    .lt('jadwal', monthEnd)
  if (profile.unit) {
    calTfQuery.eq('unit', profile.unit)
    calTsQuery.eq('unit', profile.unit)
  }

  const [{ data: calTf }, { data: calTs }] = await Promise.all([calTfQuery, calTsQuery])

  const calendarEvents: CalendarEvent[] = [
    ...(calTf ?? []).filter(t => t.jadwal).map(t => ({
      date: wibFmt.format(new Date(t.jadwal!)),
      name: t.nama_siswa,
      type: 'tahfidz' as const,
    })),
    ...(calTs ?? []).filter(t => t.jadwal).map(t => ({
      date: wibFmt.format(new Date(t.jadwal!)),
      name: t.nama_kelompok,
      type: 'tahsin' as const,
    })),
  ]

  const unit = profile.unit

  const buildStatsQuery = (table: 'tahfidz_submissions' | 'tahsin_submissions', status?: string) => {
    const q = supabase.from(table).select('*', { count: 'exact', head: true })
    if (unit) q.eq('unit', unit)
    if (status) q.eq('status', status)
    return q
  }

  const [{ count: tfTotal }, { count: tsTotal }, { count: tfDone }, { count: tsDone }, { count: tfScheduled }, { count: tsScheduled }] =
    await Promise.all([
      buildStatsQuery('tahfidz_submissions'),
      buildStatsQuery('tahsin_submissions'),
      buildStatsQuery('tahfidz_submissions', 'selesai'),
      buildStatsQuery('tahsin_submissions', 'selesai'),
      buildStatsQuery('tahfidz_submissions', 'dijadwalkan'),
      buildStatsQuery('tahsin_submissions', 'dijadwalkan'),
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

  const isKoordinator = profile.role === 'koordinator'
  const isAdmin = profile.role === 'admin'

  return (
    <div className="pb-24 sm:pb-6 flex flex-col gap-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white">
        <p className="text-emerald-100 text-sm">Selamat datang,</p>
        <h1 className="text-xl font-bold mt-0.5">
          {isAdmin ? 'Administrator' : isKoordinator ? `Koordinator ${profile.unit}` : `Guru ${profile.unit}`}
        </h1>
        <p className="text-emerald-100 text-sm mt-3">
          {isAdmin
            ? 'Kelola semua pengajuan ujian Tahsin & Tahfidz SD dan SMP'
            : isKoordinator
            ? `Kelola pengajuan ujian Tahsin & Tahfidz untuk unit ${profile.unit}`
            : `Ajukan ujian Tahsin & Tahfidz untuk unit ${profile.unit}`}
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
      <div className={`grid gap-3 ${isKoordinator || isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
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
          className="bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl p-4 flex flex-col gap-2 hover:bg-blue-100 hover:border-blue-300 transition-colors shadow-sm relative"
        >
          <div className="flex items-center justify-between">
            <ListChecks className="w-6 h-6 text-blue-500" />
            {unseenCount > 0 && (
              <span className="min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                {unseenCount > 99 ? '99+' : unseenCount}
              </span>
            )}
          </div>
          <p className="font-semibold">Kelola</p>
          <p className="text-xs text-blue-400">Semua pengajuan</p>
        </Link>
        {(isKoordinator || isAdmin) && (
          <Link
            href="/dashboard/guru"
            className="bg-violet-50 border border-violet-200 text-violet-700 rounded-2xl p-4 flex flex-col gap-2 hover:bg-violet-100 hover:border-violet-300 transition-colors shadow-sm"
          >
            <Users className="w-6 h-6 text-violet-500" />
            <p className="font-semibold">Guru</p>
            <p className="text-xs text-violet-400">Kelola akun</p>
          </Link>
        )}
      </div>

      {/* Admin: shortcut ke kelola koordinator */}
      {isAdmin && (
        <Link
          href="/dashboard/koordinator"
          className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-center gap-3 hover:bg-red-100 hover:border-red-300 transition-colors shadow-sm"
        >
          <Users className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-semibold">Kelola Koordinator</p>
            <p className="text-xs text-red-400">Tambah, edit, atau hapus akun koordinator</p>
          </div>
        </Link>
      )}

      {/* Exam Calendar */}
      <ExamCalendar
        events={calendarEvents}
        year={calYear}
        month={calMonth}
        todayWIB={todayWIB}
      />

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
