'use client'

import { useMemo, useState } from 'react'
import type { TahfidzSubmission, TahsinSubmission } from '@/lib/types'
import { getTahfidzLabel, cn } from '@/lib/utils'
import { ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react'

interface QueueTabsProps {
  tahfidz: {
    sd: TahfidzSubmission[]
    smp: TahfidzSubmission[]
  }
  tahsin: {
    sd: TahsinSubmission[]
    smp: TahsinSubmission[]
  }
}

type ActiveUnit = 'SD' | 'SMP'
type SortDir = 'asc' | 'desc'

function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })
}

function formatJadwal(date: string | null): string {
  if (!date) return 'Belum dijadwalkan'
  return new Date(date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  })
}

/** Beri nomor antrian berdasarkan urutan pengajuan (terlama = 1), apa pun arah sortir tampilan. */
function withQueueNumber<T extends { id: string; created_at: string }>(items: T[]) {
  const order = [...items].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  const numberOf = new Map(order.map((it, i) => [it.id, i + 1]))
  return numberOf
}

function sortByDate<T extends { created_at: string }>(items: T[], dir: SortDir) {
  return [...items].sort((a, b) => {
    const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return dir === 'asc' ? diff : -diff
  })
}

export function QueueTabs({ tahfidz, tahsin }: QueueTabsProps) {
  const [activeUnit, setActiveUnit] = useState<ActiveUnit>('SD')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const tfItems = activeUnit === 'SD' ? tahfidz.sd : tahfidz.smp
  const tsItems = activeUnit === 'SD' ? tahsin.sd : tahsin.smp

  const tfNumbers = useMemo(() => withQueueNumber(tfItems), [tfItems])
  const tsNumbers = useMemo(() => withQueueNumber(tsItems), [tsItems])

  const tfSorted = useMemo(() => sortByDate(tfItems, sortDir), [tfItems, sortDir])
  const tsSorted = useMemo(() => sortByDate(tsItems, sortDir), [tsItems, sortDir])

  const totalAntrian = tfItems.length + tsItems.length

  const headerCell = 'px-3 py-2 text-left font-semibold text-gray-500 whitespace-nowrap'
  const bodyCell = 'px-3 py-2.5 align-top text-gray-700'

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-2 mb-4">
        {(['SD', 'SMP'] as ActiveUnit[]).map((unit) => (
          <button
            key={unit}
            onClick={() => setActiveUnit(unit)}
            className={cn(
              'flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all',
              activeUnit === unit
                ? unit === 'SD'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
            )}
          >
            {unit}
          </button>
        ))}
      </div>

      {/* Sort toggle */}
      {totalAntrian > 0 && (
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300 transition-colors"
          >
            {sortDir === 'asc' ? (
              <ArrowUpNarrowWide className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownNarrowWide className="w-3.5 h-3.5" />
            )}
            Tanggal pengajuan: {sortDir === 'asc' ? 'Terlama dahulu' : 'Terbaru dahulu'}
          </button>
        </div>
      )}

      {totalAntrian === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">Belum ada antrian untuk unit {activeUnit}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── Tahfidz ── */}
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Antrian Tahfidz ({tfItems.length})
            </h2>

            {tfItems.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center bg-white rounded-2xl border border-gray-100">
                Belum ada pengajuan Tahfidz
              </p>
            ) : (
              <>
              {/* Mobile: kartu */}
              <ul className="space-y-2 sm:hidden">
                {tfSorted.map((item) => (
                  <li
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-xs font-semibold text-gray-400 mt-0.5 shrink-0">
                          #{tfNumbers.get(item.id)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {item.nama_siswa}
                            {item.is_quls && (
                              <span className="ml-1.5 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1 py-0.5">
                                QULS
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Kelas {item.kelas} · {getTahfidzLabel(item.tipe, item.juz)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap',
                          item.jadwal
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-amber-50 text-amber-600'
                        )}
                      >
                        {formatJadwal(item.jadwal)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs border-t border-gray-50 pt-2">
                      <span className="text-gray-400">
                        Diajukan {formatDateShort(item.created_at)}
                      </span>
                      <span className={item.penguji ? 'text-gray-600 font-medium' : 'text-gray-400'}>
                        {item.penguji || 'Penguji belum ditentukan'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Desktop: tabel */}
              <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs">
                      <th className={cn(headerCell, 'w-10')}>#</th>
                      <th className={headerCell}>Tgl Pengajuan</th>
                      <th className={headerCell}>Nama Lengkap</th>
                      <th className={headerCell}>Kelas</th>
                      <th className={headerCell}>Juz</th>
                      <th className={headerCell}>Jadwal</th>
                      <th className={headerCell}>Penguji</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tfSorted.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/60">
                        <td className={cn(bodyCell, 'text-gray-400 font-medium')}>
                          {tfNumbers.get(item.id)}
                        </td>
                        <td className={cn(bodyCell, 'whitespace-nowrap text-gray-500')}>
                          {formatDateShort(item.created_at)}
                        </td>
                        <td className={cn(bodyCell, 'font-semibold text-gray-900')}>
                          {item.nama_siswa}
                          {item.is_quls && (
                            <span className="ml-1.5 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1 py-0.5">
                              QULS
                            </span>
                          )}
                        </td>
                        <td className={cn(bodyCell, 'whitespace-nowrap')}>{item.kelas}</td>
                        <td className={cn(bodyCell, 'whitespace-nowrap')}>
                          {getTahfidzLabel(item.tipe, item.juz)}
                        </td>
                        <td
                          className={cn(
                            bodyCell,
                            'whitespace-nowrap',
                            item.jadwal ? 'text-blue-600' : 'text-amber-600'
                          )}
                        >
                          {formatJadwal(item.jadwal)}
                        </td>
                        <td className={cn(bodyCell, item.penguji ? '' : 'text-gray-400')}>
                          {item.penguji || 'Belum ditentukan'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </section>

          {/* ── Tahsin ── */}
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              Antrian Tahsin ({tsItems.length})
            </h2>

            {tsItems.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center bg-white rounded-2xl border border-gray-100">
                Belum ada pengajuan Tahsin
              </p>
            ) : (
              <>
              {/* Mobile: kartu */}
              <ul className="space-y-2 sm:hidden">
                {tsSorted.map((item) => (
                  <li
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-xs font-semibold text-gray-400 mt-0.5 shrink-0">
                          #{tsNumbers.get(item.id)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {item.nama_kelompok}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Jilid {item.level} · {item.siswa.length} siswa · Sesi {item.sesi}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap',
                          item.jadwal
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-amber-50 text-amber-600'
                        )}
                      >
                        {formatJadwal(item.jadwal)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs border-t border-gray-50 pt-2">
                      <span className="text-gray-400">
                        Diajukan {formatDateShort(item.created_at)}
                      </span>
                      <span className={item.penguji ? 'text-gray-600 font-medium' : 'text-gray-400'}>
                        {item.penguji || 'Penguji belum ditentukan'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Desktop: tabel */}
              <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs">
                      <th className={cn(headerCell, 'w-10')}>#</th>
                      <th className={headerCell}>Tgl Pengajuan</th>
                      <th className={headerCell}>Nama Kelompok</th>
                      <th className={headerCell}>Jilid</th>
                      <th className={headerCell}>Jadwal</th>
                      <th className={headerCell}>Penguji</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tsSorted.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/60">
                        <td className={cn(bodyCell, 'text-gray-400 font-medium')}>
                          {tsNumbers.get(item.id)}
                        </td>
                        <td className={cn(bodyCell, 'whitespace-nowrap text-gray-500')}>
                          {formatDateShort(item.created_at)}
                        </td>
                        <td className={cn(bodyCell, 'font-semibold text-gray-900')}>
                          {item.nama_kelompok}
                          <span className="block text-xs font-normal text-gray-400">
                            {item.siswa.length} siswa · Sesi {item.sesi}
                          </span>
                        </td>
                        <td className={cn(bodyCell, 'whitespace-nowrap')}>{item.level}</td>
                        <td
                          className={cn(
                            bodyCell,
                            'whitespace-nowrap',
                            item.jadwal ? 'text-blue-600' : 'text-amber-600'
                          )}
                        >
                          {formatJadwal(item.jadwal)}
                        </td>
                        <td className={cn(bodyCell, item.penguji ? '' : 'text-gray-400')}>
                          {item.penguji || 'Belum ditentukan'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
