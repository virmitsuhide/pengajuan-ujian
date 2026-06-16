'use client'

import { useMemo, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { TahfidzSubmission, TahsinSubmission } from '@/lib/types'
import {
  getTahfidzLabel,
  getPredikatLabel,
  getPredikatColor,
  formatDateOnly,
  cn,
} from '@/lib/utils'
import { BookOpen, Clipboard, UserCheck, CalendarDays } from 'lucide-react'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const NO_PENGUJI = 'Tanpa penguji'

interface Props {
  tahfidz: TahfidzSubmission[]
  tahsin: TahsinSubmission[]
  month: number
  year: number
}

interface RiwayatRow {
  id: string
  penguji: string
  nama: string
  jadwal: string | null
  jenis: 'Tahfidz' | 'Tahsin'
  detail: string
  hasil: React.ReactNode
}

export function RiwayatClient({ tahfidz, tahsin, month, year }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [pengujiFilter, setPengujiFilter] = useState<string>('semua')

  function navigate(newMonth: number, newYear: number) {
    router.push(`${pathname}?bulan=${newMonth}&tahun=${newYear}`)
  }

  // Gabungkan tahfidz & tahsin jadi baris seragam
  const rows = useMemo<RiwayatRow[]>(() => {
    const tf: RiwayatRow[] = tahfidz.map((t) => ({
      id: `tf-${t.id}`,
      penguji: t.penguji?.trim() || NO_PENGUJI,
      nama: t.nama_siswa,
      jadwal: t.jadwal,
      jenis: 'Tahfidz',
      detail: `${getTahfidzLabel(t.tipe, t.juz)} · Kelas ${t.kelas}${t.is_quls ? ' · QULS' : ''}`,
      hasil: t.predikat ? (
        <span className={getPredikatColor(t.predikat)}>{getPredikatLabel(t.predikat)}</span>
      ) : (
        <span className="text-gray-300">—</span>
      ),
    }))

    const ts: RiwayatRow[] = tahsin.map((t) => {
      const lulus = t.siswa.filter((s) => s.predikat === 'lulus').length
      return {
        id: `ts-${t.id}`,
        penguji: t.penguji?.trim() || NO_PENGUJI,
        nama: t.nama_kelompok,
        jadwal: t.jadwal,
        jenis: 'Tahsin' as const,
        detail: `${t.level} · ${t.siswa.length} siswa · Sesi ${t.sesi}`,
        hasil: (
          <span className="text-emerald-700 font-semibold">
            {lulus}/{t.siswa.length} lulus
          </span>
        ),
      }
    })

    return [...tf, ...ts]
  }, [tahfidz, tahsin])

  // Daftar nama penguji yang muncul di bulan ini (untuk dropdown filter)
  const pengujiNames = useMemo(() => {
    const set = new Set(rows.map((r) => r.penguji))
    return Array.from(set).sort((a, b) => {
      if (a === NO_PENGUJI) return 1
      if (b === NO_PENGUJI) return -1
      return a.localeCompare(b)
    })
  }, [rows])

  const visibleRows =
    pengujiFilter === 'semua' ? rows : rows.filter((r) => r.penguji === pengujiFilter)

  // Kelompokkan per penguji
  const grouped = useMemo(() => {
    const map = new Map<string, RiwayatRow[]>()
    for (const r of visibleRows) {
      const arr = map.get(r.penguji) ?? []
      arr.push(r)
      map.set(r.penguji, arr)
    }
    return Array.from(map.entries()).sort((a, b) => {
      if (a[0] === NO_PENGUJI) return 1
      if (b[0] === NO_PENGUJI) return -1
      return a[0].localeCompare(b[0])
    })
  }, [visibleRows])

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="flex flex-col gap-5">
      {/* Periode */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" /> Periode
        </p>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => navigate(Number(e.target.value), year)}
            className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => navigate(month, Number(e.target.value))}
            className="w-28 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Filter penguji */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
            <UserCheck className="w-3.5 h-3.5" /> Penguji:
          </span>
          <select
            value={pengujiFilter}
            onChange={(e) => setPengujiFilter(e.target.value)}
            className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="semua">Semua penguji</option>
            {pengujiNames.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ringkasan */}
      <p className="text-sm text-gray-500">
        <span className="font-semibold text-gray-800">{visibleRows.length}</span> ujian selesai pada{' '}
        {MONTHS[month - 1]} {year}
      </p>

      {visibleRows.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🗂️</p>
          <p className="font-medium">Belum ada ujian selesai pada periode ini</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {grouped.map(([penguji, items]) => (
            <section key={penguji}>
              <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                {penguji}
                <span className="text-xs font-normal text-gray-400">({items.length} ujian)</span>
              </h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                {items.map((r) => (
                  <div key={r.id} className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {r.jenis === 'Tahfidz' ? (
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        ) : (
                          <Clipboard className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                        )}
                        <p className="font-semibold text-gray-900 truncate">{r.nama}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{r.detail}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Ujian {formatDateOnly(r.jadwal)}
                      </p>
                    </div>
                    <div className={cn('text-xs text-right whitespace-nowrap flex-shrink-0')}>
                      {r.hasil}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
