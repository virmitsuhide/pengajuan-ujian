'use client'

import { useState } from 'react'
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
  formatDate,
  cn,
} from '@/lib/utils'
import { Pencil, ChevronDown, ChevronUp, Users, BookOpen, Clipboard } from 'lucide-react'

interface Props {
  tahfidz: TahfidzSubmission[]
  tahsin: TahsinSubmission[]
  unit: Unit
  canEdit: boolean
  creatorMap: Record<string, string>
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
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })
}

export function SubmissionsClient({ tahfidz, tahsin, unit, canEdit, creatorMap }: Props) {
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
            <p className="text-sm text-gray-400 text-center py-6">Tidak ada data</p>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredTahfidz.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                        {item.predikat && (
                          <span className={cn('text-xs', getPredikatColor(item.predikat))}>
                            {getPredikatLabel(item.predikat)}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 truncate">{item.nama_siswa}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {getTahfidzLabel(item.tipe, item.juz)} · Kelas {item.kelas}
                      </p>
                      {item.jadwal && (
                        <p className="text-xs text-blue-600 mt-1">
                          {formatDate(item.jadwal)}
                          {item.penguji && ` · ${item.penguji}`}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {canEdit && creatorMap[item.created_by]
                          ? `${creatorMap[item.created_by]} · `
                          : ''}
                        {formatDateOnly(item.created_at)}
                      </p>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => setEditingTahfidz(item)}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors flex-shrink-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
            <p className="text-sm text-gray-400 text-center py-6">Tidak ada data</p>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredTahsin.map((item) => {
                const isExpanded = expandedTahsin.has(item.id)
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge className={getStatusColor(item.status)}>
                            {getStatusLabel(item.status)}
                          </Badge>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                            {item.level}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 truncate">{item.nama_kelompok}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Sesi {item.sesi}</p>
                        {item.jadwal && (
                          <p className="text-xs text-blue-600 mt-1">
                            {formatDate(item.jadwal)}
                            {item.penguji && ` · ${item.penguji}`}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {canEdit && creatorMap[item.created_by]
                            ? `${creatorMap[item.created_by]} · `
                            : ''}
                          {formatDateOnly(item.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
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
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 border-t border-gray-50 pt-3">
                        <p className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {item.siswa.length} Siswa
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {item.siswa.map((s, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
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
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {editingTahfidz && (
        <EditTahfidzModal item={editingTahfidz} onClose={() => setEditingTahfidz(null)} />
      )}
      {editingTahsin && (
        <EditTahsinModal item={editingTahsin} onClose={() => setEditingTahsin(null)} />
      )}
    </div>
  )
}
