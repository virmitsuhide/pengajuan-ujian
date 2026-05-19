'use client'

import { useState } from 'react'
import type { TahfidzSubmission, TahsinSubmission } from '@/lib/types'
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
}

type FilterStatus = 'semua' | 'diajukan' | 'dijadwalkan' | 'selesai'

export function SubmissionsClient({ tahfidz, tahsin }: Props) {
  const [editingTahfidz, setEditingTahfidz] = useState<TahfidzSubmission | null>(null)
  const [editingTahsin, setEditingTahsin] = useState<TahsinSubmission | null>(null)
  const [filter, setFilter] = useState<FilterStatus>('semua')
  const [expandedTahsin, setExpandedTahsin] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpandedTahsin((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filterButtons: { value: FilterStatus; label: string }[] = [
    { value: 'semua', label: 'Semua' },
    { value: 'diajukan', label: 'Diajukan' },
    { value: 'dijadwalkan', label: 'Dijadwalkan' },
    { value: 'selesai', label: 'Selesai' },
  ]

  const filteredTahfidz = filter === 'semua'
    ? tahfidz
    : tahfidz.filter((t) => t.status === filter)

  const filteredTahsin = filter === 'semua'
    ? tahsin
    : tahsin.filter((t) => t.status === filter)

  const total = filteredTahfidz.length + filteredTahsin.length

  return (
    <div className="flex flex-col gap-5">
      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterButtons.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              'flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all',
              filter === value
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {total === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>Belum ada pengajuan</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Tahfidz list */}
          {filteredTahfidz.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                Tahfidz ({filteredTahfidz.length})
              </h2>
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
                        <p className="font-semibold text-gray-900 truncate">
                          {item.nama_siswa}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {getTahfidzLabel(item.tipe, item.juz)} · Kelas {item.kelas}
                        </p>
                        {item.jadwal && (
                          <p className="text-xs text-blue-600 mt-1">
                            {formatDate(item.jadwal)}
                            {item.penguji && ` · ${item.penguji}`}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setEditingTahfidz(item)}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors flex-shrink-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tahsin list */}
          {filteredTahsin.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clipboard className="w-3.5 h-3.5" />
                Tahsin ({filteredTahsin.length})
              </h2>
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
                          </div>
                          <p className="font-semibold text-gray-900 truncate">
                            {item.nama_kelompok}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.level} · Sesi {item.sesi}
                          </p>
                          {item.jadwal && (
                            <p className="text-xs text-blue-600 mt-1">
                              {formatDate(item.jadwal)}
                              {item.penguji && ` · ${item.penguji}`}
                            </p>
                          )}
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
                          <button
                            onClick={() => setEditingTahsin(item)}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Siswa list */}
                      {isExpanded && (
                        <div className="mt-3 border-t border-gray-50 pt-3">
                          <p className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {item.siswa.length} Siswa
                          </p>
                          <div className="flex flex-col gap-1.5">
                            {item.siswa.map((s, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-gray-700">{s.nama}</span>
                                {s.predikat ? (
                                  <span
                                    className={cn(
                                      'text-xs font-medium',
                                      s.predikat === 'lulus'
                                        ? 'text-emerald-700'
                                        : 'text-red-600'
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
            </section>
          )}
        </div>
      )}

      {/* Modals */}
      {editingTahfidz && (
        <EditTahfidzModal
          item={editingTahfidz}
          onClose={() => setEditingTahfidz(null)}
        />
      )}
      {editingTahsin && (
        <EditTahsinModal
          item={editingTahsin}
          onClose={() => setEditingTahsin(null)}
        />
      )}
    </div>
  )
}
