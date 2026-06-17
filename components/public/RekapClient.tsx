'use client'

import { useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { TahfidzSubmission, TahsinSubmission, Unit } from '@/lib/types'
import {
  getTahfidzLabel,
  getPredikatLabel,
  getPredikatColor,
  getUnitColor,
  formatDate,
  formatTahsinLevels,
  groupSiswaByLevel,
  cn,
} from '@/lib/utils'
import { exportRekapExcel } from '@/lib/export'
import { Badge } from '@/components/ui/Badge'
import { BookOpen, Clipboard, ChevronDown, ChevronUp, Users, Trophy, FileSpreadsheet } from 'lucide-react'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

interface Props {
  tahfidz: TahfidzSubmission[]
  tahsin: TahsinSubmission[]
  month: number
  year: number
}

type ActiveUnit = 'SD' | 'SMP' | 'Semua'

export function RekapClient({ tahfidz, tahsin, month, year }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeUnit, setActiveUnit] = useState<ActiveUnit>('Semua')
  const [expandedTahsin, setExpandedTahsin] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpandedTahsin((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function navigate(newMonth: number, newYear: number) {
    router.push(`${pathname}?bulan=${newMonth}&tahun=${newYear}`)
  }

  // Filter by unit
  const filteredTahfidz = activeUnit === 'Semua'
    ? tahfidz
    : tahfidz.filter((t) => t.unit === activeUnit)

  const filteredTahsin = activeUnit === 'Semua'
    ? tahsin
    : tahsin.filter((t) => t.unit === activeUnit)

  const totalSelesai = tahfidz.length + tahsin.length

  // Stats
  const predikatCount = useMemo(() => {
    const counts: Record<string, number> = {}
    tahfidz.forEach((t) => {
      if (t.predikat) counts[t.predikat] = (counts[t.predikat] ?? 0) + 1
    })
    return counts
  }, [tahfidz])

  const tahsinLulusCount = useMemo(() => {
    let lulus = 0
    tahsin.forEach((t) => {
      t.siswa.forEach((s) => { if (s.predikat === 'lulus') lulus++ })
    })
    return lulus
  }, [tahsin])

  // Year options (current year ± 2)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="flex flex-col gap-5">
      {/* Period selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pilih Periode</p>
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
      </div>

      {/* Export button */}
      {totalSelesai > 0 && (
        <button
          onClick={() => exportRekapExcel(tahfidz, tahsin, month, year)}
          className="flex items-center justify-center gap-2 w-full rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 text-sm font-semibold py-2.5 hover:bg-emerald-100 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export Excel
        </button>
      )}

      {/* Summary stats */}
      {totalSelesai > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-900">{tahfidz.length}</p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Tahfidz selesai
            </p>
            {Object.keys(predikatCount).length > 0 && (
              <div className="mt-2 flex flex-col gap-0.5">
                {Object.entries(predikatCount).map(([p, n]) => (
                  <p key={p} className={cn('text-xs', getPredikatColor(p as any))}>
                    {getPredikatLabel(p as any)}: {n}
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-900">{tahsin.length}</p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Clipboard className="w-3.5 h-3.5" /> Tahsin selesai
            </p>
            {tahsin.length > 0 && (
              <div className="mt-2 flex flex-col gap-0.5">
                <p className="text-xs text-emerald-700 font-medium">
                  Lulus: {tahsinLulusCount} siswa
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unit filter */}
      {totalSelesai > 0 && (
        <div className="flex gap-2">
          {(['Semua', 'SD', 'SMP'] as ActiveUnit[]).map((u) => (
            <button
              key={u}
              onClick={() => setActiveUnit(u)}
              className={cn(
                'flex-1 rounded-xl py-2 text-sm font-semibold transition-all',
                activeUnit === u
                  ? u === 'SD'
                    ? 'bg-green-600 text-white shadow-sm'
                    : u === 'SMP'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-700 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200'
              )}
            >
              {u}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {totalSelesai === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">Belum ada ujian selesai</p>
          <p className="text-sm mt-1">di {MONTHS[month - 1]} {year}</p>
        </div>
      )}

      {/* Tahfidz results */}
      {filteredTahfidz.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" />
            Tahfidz ({filteredTahfidz.length})
          </h2>
          <div className="flex flex-col gap-2">
            {filteredTahfidz.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge className={getUnitColor(item.unit)}>{item.unit}</Badge>
                      {item.predikat && (
                        <span className={cn('text-xs font-semibold', getPredikatColor(item.predikat))}>
                          {getPredikatLabel(item.predikat)}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900">{item.nama_siswa}</p>
                    <p className="text-xs text-gray-500">
                      {getTahfidzLabel(item.tipe, item.juz)} · Kelas {item.kelas}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Ayah: {item.nama_ayah}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{formatDate(item.jadwal)}</span>
                      {item.penguji && <span>· {item.penguji}</span>}
                    </div>
                    {item.catatan && (
                      <p className="text-xs text-gray-500 italic mt-1.5 bg-gray-50 rounded-lg px-2 py-1">
                        "{item.catatan}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tahsin results */}
      {filteredTahsin.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Clipboard className="w-3.5 h-3.5" />
            Tahsin ({filteredTahsin.length})
          </h2>
          <div className="flex flex-col gap-2">
            {filteredTahsin.map((item) => {
              const isExpanded = expandedTahsin.has(item.id)
              const lulusCount = item.siswa.filter((s) => s.predikat === 'lulus').length
              const mengulangCount = item.siswa.filter((s) => s.predikat === 'mengulang').length

              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={getUnitColor(item.unit)}>{item.unit}</Badge>
                        {lulusCount > 0 && (
                          <span className="text-xs text-emerald-700 font-semibold">
                            {lulusCount} Lulus
                          </span>
                        )}
                        {mengulangCount > 0 && (
                          <span className="text-xs text-red-600 font-semibold">
                            {mengulangCount} Mengulang
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">{item.nama_kelompok}</p>
                      <p className="text-xs text-gray-500">{formatTahsinLevels(item)} · Sesi {item.sesi}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span>{formatDate(item.jadwal)}</span>
                        {item.penguji && <span>· {item.penguji}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 border-t border-gray-50 pt-3">
                      <div className="flex flex-col gap-3">
                        {groupSiswaByLevel(item).map((group, gi) => (
                          <div key={gi}>
                            <p className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" /> {group.level} · {group.siswa.length} siswa
                            </p>
                            <div className="flex flex-col gap-1.5">
                              {group.siswa.map((s, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-700">{s.nama}</span>
                                  <span className={cn(
                                    'text-xs font-medium',
                                    s.predikat === 'lulus' ? 'text-emerald-700' :
                                    s.predikat === 'mengulang' ? 'text-red-600' : 'text-gray-400'
                                  )}>
                                    {s.predikat === 'lulus' ? 'Lulus' : s.predikat === 'mengulang' ? 'Mengulang' : '-'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      {item.catatan && (
                        <p className="text-xs text-gray-500 italic mt-2 bg-gray-50 rounded-lg px-2 py-1">
                          "{item.catatan}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
