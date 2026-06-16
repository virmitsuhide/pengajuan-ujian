'use client'

import { Fragment, useState } from 'react'
import type { TahfidzSubmission, TahsinSubmission, Unit } from '@/lib/types'
import { EditTahfidzModal } from './EditTahfidzModal'
import { EditTahsinModal } from './EditTahsinModal'
import { Badge } from '@/components/ui/Badge'
import {
  getStatusColor,
  getStatusLabel,
  getPredikatLabel,
  getPredikatColor,
  getTahfidzLabel,
  cn,
} from '@/lib/utils'
import { ChevronDown, ChevronUp, Users, BookOpen, Clipboard, Settings2 } from 'lucide-react'

interface Props {
  tahfidz: TahfidzSubmission[]
  tahsin: TahsinSubmission[]
  unit: Unit
  canEdit: boolean
  creatorMap: Record<string, string>
  pengujiOptions: string[]
}

type FilterStatus = 'semua' | 'diajukan' | 'dijadwalkan' | 'selesai'
type TahfidzTipeFilter = 'semua' | '1_juz' | '3_juz' | '5_juz'

const TAHSIN_LEVELS: Record<Unit, string[]> = {
  SD: ['Jilid 1', 'Jilid 2', 'Jilid 3', 'Jilid 4', 'Jilid 5', 'Jilid 6', 'Al-Qur\'an', 'Gharib', 'Tajwid'],
  SMP: ['Jilid 1', 'Jilid 2', 'Jilid 3', 'Jilid 4', 'Jilid 5'],
}

function formatDateOnly(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })
}

function formatJadwalShort(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  })
}

export function SubmissionsClient({ tahfidz, tahsin, unit, canEdit, creatorMap, pengujiOptions }: Props) {
  const [editingTahfidz, setEditingTahfidz] = useState<TahfidzSubmission | null>(null)
  const [editingTahsin, setEditingTahsin] = useState<TahsinSubmission | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('semua')
  const [filterTahfidz, setFilterTahfidz] = useState<TahfidzTipeFilter>('semua')
  const [filterTahsin, setFilterTahsin] = useState<string>('semua')
  const [expandedTahsin, setExpandedTahsin] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpandedTahsin((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const statusButtons: { value: FilterStatus; label: string }[] = [
    { value: 'semua', label: 'Semua' },
    { value: 'diajukan', label: 'Diajukan' },
    { value: 'dijadwalkan', label: 'Dijadwalkan' },
    { value: 'selesai', label: 'Selesai' },
  ]

  const tahfidzTabs: { value: TahfidzTipeFilter; label: string }[] = [
    { value: 'semua', label: 'Semua' },
    { value: '1_juz', label: '1 Juz' },
    { value: '3_juz', label: '3 Juz' },
    { value: '5_juz', label: '5 Juz' },
  ]

  const validLevels = TAHSIN_LEVELS[unit]
  const tahsinLevelTabs = ['semua', ...validLevels, 'lainnya']

  const byStatus = <T extends { status: string }>(items: T[]) =>
    filterStatus === 'semua' ? items : items.filter((t) => t.status === filterStatus)

  const filteredTahfidz = byStatus(
    filterTahfidz === 'semua' ? tahfidz : tahfidz.filter((t) => t.tipe === filterTahfidz)
  )

  const filteredTahsin = byStatus(
    filterTahsin === 'semua'
      ? tahsin
      : filterTahsin === 'lainnya'
      ? tahsin.filter((t) => !validLevels.includes(t.level))
      : tahsin.filter((t) => t.level === filterTahsin)
  )

  const lainnyaCount = tahsin.filter((t) => !validLevels.includes(t.level)).length

  const headerCell = 'px-3 py-2 text-left font-semibold text-gray-500 whitespace-nowrap'
  const bodyCell = 'px-3 py-2.5 align-top text-gray-700'

  return (
    <div className="flex flex-col gap-5">
      {/* Filter status */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusButtons.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilterStatus(value)}
            className={cn(
              'flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all',
              filterStatus === value
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Tahfidz ── */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" />
            Tahfidz ({filteredTahfidz.length})
          </h2>

          {/* Sub-tab tipe */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3">
            {tahfidzTabs.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilterTahfidz(value)}
                className={cn(
                  'flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                  filterTahfidz === value
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-gray-300'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredTahfidz.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-2xl border border-gray-100">
              Tidak ada data
            </p>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-gray-100 text-xs">
                    <th className={cn(headerCell, 'w-10')}>#</th>
                    <th className={headerCell}>Tgl Pengajuan</th>
                    <th className={headerCell}>Nama</th>
                    <th className={headerCell}>Kelas</th>
                    <th className={headerCell}>Juz</th>
                    <th className={headerCell}>Jadwal</th>
                    <th className={headerCell}>Penguji</th>
                    <th className={headerCell}>Nilai</th>
                    <th className={headerCell}>Status</th>
                    {canEdit && <th className={cn(headerCell, 'text-right')}>Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTahfidz.map((item, i) => (
                    <tr key={item.id} className="hover:bg-gray-50/60">
                      <td className={cn(bodyCell, 'text-gray-400 font-medium')}>{i + 1}</td>
                      <td className={cn(bodyCell, 'whitespace-nowrap text-gray-500')}>
                        {formatDateOnly(item.created_at)}
                      </td>
                      <td className={bodyCell}>
                        <span className="font-semibold text-gray-900">{item.nama_siswa}</span>
                        {item.is_quls && (
                          <span className="ml-1.5 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1 py-0.5">
                            QULS
                          </span>
                        )}
                        {canEdit && creatorMap[item.created_by] && (
                          <span className="block text-xs text-gray-400">
                            oleh {creatorMap[item.created_by]}
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
                          item.jadwal ? 'text-blue-600' : 'text-gray-400'
                        )}
                      >
                        {formatJadwalShort(item.jadwal)}
                      </td>
                      <td className={cn(bodyCell, item.penguji ? '' : 'text-gray-400')}>
                        {item.penguji || '—'}
                      </td>
                      <td className={cn(bodyCell, 'whitespace-nowrap text-xs')}>
                        {item.predikat ? (
                          <span className={getPredikatColor(item.predikat)}>
                            {getPredikatLabel(item.predikat)}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className={cn(bodyCell, 'whitespace-nowrap')}>
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </td>
                      {canEdit && (
                        <td className={cn(bodyCell, 'text-right whitespace-nowrap')}>
                          <button
                            onClick={() => setEditingTahfidz(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                            Kelola
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Tahsin ── */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Clipboard className="w-3.5 h-3.5" />
            Tahsin ({filteredTahsin.length})
          </h2>

          {/* Sub-tab level */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3">
            {tahsinLevelTabs.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterTahsin(lvl)}
                className={cn(
                  'flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all whitespace-nowrap',
                  filterTahsin === lvl
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-gray-300'
                )}
              >
                {lvl === 'semua' ? 'Semua' : lvl === 'lainnya' ? `Lainnya${lainnyaCount > 0 ? ` (${lainnyaCount})` : ''}` : lvl}
              </button>
            ))}
          </div>

          {filteredTahsin.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-2xl border border-gray-100">
              Tidak ada data
            </p>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-gray-100 text-xs">
                    <th className={cn(headerCell, 'w-10')}>#</th>
                    <th className={headerCell}>Tgl Pengajuan</th>
                    <th className={headerCell}>Kelompok</th>
                    <th className={headerCell}>Jilid</th>
                    <th className={headerCell}>Jadwal</th>
                    <th className={headerCell}>Penguji</th>
                    <th className={headerCell}>Hasil</th>
                    <th className={headerCell}>Status</th>
                    <th className={cn(headerCell, 'text-right')}>Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTahsin.map((item, i) => {
                    const isExpanded = expandedTahsin.has(item.id)
                    const lulusCount = item.siswa.filter((s) => s.predikat === 'lulus').length
                    const totalCols = 9
                    return (
                      <Fragment key={item.id}>
                        <tr className="hover:bg-gray-50/60">
                          <td className={cn(bodyCell, 'text-gray-400 font-medium')}>{i + 1}</td>
                          <td className={cn(bodyCell, 'whitespace-nowrap text-gray-500')}>
                            {formatDateOnly(item.created_at)}
                          </td>
                          <td className={bodyCell}>
                            <span className="font-semibold text-gray-900">{item.nama_kelompok}</span>
                            <span className="block text-xs text-gray-400">
                              {item.siswa.length} siswa · Sesi {item.sesi}
                              {canEdit && creatorMap[item.created_by]
                                ? ` · oleh ${creatorMap[item.created_by]}`
                                : ''}
                            </span>
                          </td>
                          <td className={cn(bodyCell, 'whitespace-nowrap')}>{item.level}</td>
                          <td
                            className={cn(
                              bodyCell,
                              'whitespace-nowrap',
                              item.jadwal ? 'text-blue-600' : 'text-gray-400'
                            )}
                          >
                            {formatJadwalShort(item.jadwal)}
                          </td>
                          <td className={cn(bodyCell, item.penguji ? '' : 'text-gray-400')}>
                            {item.penguji || '—'}
                          </td>
                          <td className={cn(bodyCell, 'whitespace-nowrap text-xs')}>
                            {item.status === 'selesai' ? (
                              <span className="text-emerald-700 font-semibold">
                                {lulusCount}/{item.siswa.length} lulus
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className={cn(bodyCell, 'whitespace-nowrap')}>
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusLabel(item.status)}
                            </Badge>
                          </td>
                          <td className={cn(bodyCell, 'text-right whitespace-nowrap')}>
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => toggleExpand(item.id)}
                                title="Lihat anggota"
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                              {canEdit && (
                                <button
                                  onClick={() => setEditingTahsin(item)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                                >
                                  <Settings2 className="w-3.5 h-3.5" />
                                  Kelola
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-gray-50/40">
                            <td colSpan={totalCols} className="px-3 py-3">
                              <p className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                {item.siswa.length} Siswa
                              </p>
                              <div className="grid gap-1.5 sm:grid-cols-2">
                                {item.siswa.map((s, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-sm bg-white border border-gray-100 rounded-lg px-3 py-1.5"
                                  >
                                    <span className="text-gray-700">{s.nama}</span>
                                    {s.predikat ? (
                                      <span
                                        className={cn(
                                          'text-xs font-medium',
                                          s.predikat === 'lulus' ? 'text-emerald-700' : 'text-red-600'
                                        )}
                                      >
                                        {s.predikat === 'lulus' ? 'Lulus' : 'Mengulang'}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-gray-400">Belum</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {editingTahfidz && (
        <EditTahfidzModal
          item={editingTahfidz}
          pengujiOptions={pengujiOptions}
          onClose={() => setEditingTahfidz(null)}
        />
      )}
      {editingTahsin && (
        <EditTahsinModal
          item={editingTahsin}
          pengujiOptions={pengujiOptions}
          onClose={() => setEditingTahsin(null)}
        />
      )}
    </div>
  )
}
