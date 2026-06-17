'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { TahfidzSubmission, TahsinSubmission, Unit } from '@/lib/types'
import { EditTahfidzModal } from './EditTahfidzModal'
import { EditTahsinModal } from './EditTahsinModal'
import { deleteTahfidzSubmission, deleteTahsinSubmission } from '@/lib/actions/submissions'
import { Badge } from '@/components/ui/Badge'
import {
  getStatusColor,
  getStatusLabel,
  getPredikatLabel,
  getPredikatColor,
  getTahfidzLabel,
  cn,
} from '@/lib/utils'
import {
  ChevronDown,
  ChevronUp,
  Users,
  BookOpen,
  Clipboard,
  Settings2,
  Trash2,
  CalendarClock,
  UserCheck,
  Award,
} from 'lucide-react'

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
type DeleteTarget =
  | { jenis: 'tahfidz'; item: TahfidzSubmission }
  | { jenis: 'tahsin'; item: TahsinSubmission }

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
  if (!date) return 'Belum dijadwalkan'
  return new Date(date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  })
}

export function SubmissionsClient({ tahfidz, tahsin, unit, canEdit, creatorMap, pengujiOptions }: Props) {
  const router = useRouter()
  const [editingTahfidz, setEditingTahfidz] = useState<TahfidzSubmission | null>(null)
  const [editingTahsin, setEditingTahsin] = useState<TahsinSubmission | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('semua')
  const [filterTahfidz, setFilterTahfidz] = useState<TahfidzTipeFilter>('semua')
  const [filterTahsin, setFilterTahsin] = useState<string>('semua')
  const [expandedTahsin, setExpandedTahsin] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  function toggleExpand(id: string) {
    setExpandedTahsin((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      if (deleteTarget.jenis === 'tahfidz') {
        await deleteTahfidzSubmission(deleteTarget.item.id)
      } else {
        await deleteTahsinSubmission(deleteTarget.item.id)
      }
      setDeleteTarget(null)
      router.refresh()
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
            <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-2xl border border-gray-100">
              Tidak ada data
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {filteredTahfidz.map((item, i) => (
                <li
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5"
                >
                  {/* Baris atas: identitas + status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="text-xs font-semibold text-gray-400 mt-0.5 shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
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
                        {canEdit && creatorMap[item.created_by] && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            oleh {creatorMap[item.created_by]}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={cn('shrink-0', getStatusColor(item.status))}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </div>

                  {/* Detail: jadwal · penguji · nilai */}
                  <div className="mt-2.5 grid grid-cols-3 gap-2 border-t border-gray-50 pt-2.5 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <CalendarClock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <span className={cn('truncate', item.jadwal ? 'text-blue-600 font-medium' : 'text-gray-400')}>
                        {formatJadwalShort(item.jadwal)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <UserCheck className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <span className={cn('truncate', item.penguji ? 'text-gray-600' : 'text-gray-400')}>
                        {item.penguji || 'Penguji —'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Award className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      {item.predikat ? (
                        <span className={cn('truncate', getPredikatColor(item.predikat))}>
                          {getPredikatLabel(item.predikat)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Nilai —</span>
                      )}
                    </div>
                  </div>

                  {/* Footer: tanggal + aksi */}
                  <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-gray-50 pt-2.5">
                    <span className="text-xs text-gray-400">
                      Diajukan {formatDateOnly(item.created_at)}
                    </span>
                    {canEdit && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingTahfidz(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                          Kelola
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ jenis: 'tahfidz', item })}
                          title="Hapus pengajuan"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
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
            <ul className="flex flex-col gap-2">
              {filteredTahsin.map((item, i) => {
                const isExpanded = expandedTahsin.has(item.id)
                const lulusCount = item.siswa.filter((s) => s.predikat === 'lulus').length
                return (
                  <li
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5"
                  >
                    {/* Baris atas: identitas + status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-xs font-semibold text-gray-400 mt-0.5 shrink-0">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{item.nama_kelompok}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.level} · {item.siswa.length} siswa · Sesi {item.sesi}
                          </p>
                          {canEdit && creatorMap[item.created_by] && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              oleh {creatorMap[item.created_by]}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge className={cn('shrink-0', getStatusColor(item.status))}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </div>

                    {/* Detail: jadwal · penguji · hasil */}
                    <div className="mt-2.5 grid grid-cols-3 gap-2 border-t border-gray-50 pt-2.5 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CalendarClock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        <span className={cn('truncate', item.jadwal ? 'text-blue-600 font-medium' : 'text-gray-400')}>
                          {formatJadwalShort(item.jadwal)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <UserCheck className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        <span className={cn('truncate', item.penguji ? 'text-gray-600' : 'text-gray-400')}>
                          {item.penguji || 'Penguji —'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Award className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        {item.status === 'selesai' ? (
                          <span className="truncate text-emerald-700 font-semibold">
                            {lulusCount}/{item.siswa.length} lulus
                          </span>
                        ) : (
                          <span className="text-gray-400">Hasil —</span>
                        )}
                      </div>
                    </div>

                    {/* Daftar anggota (expand) */}
                    {isExpanded && (
                      <div className="mt-2.5 border-t border-gray-50 pt-2.5">
                        <p className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {item.siswa.length} Siswa
                        </p>
                        <div className="grid gap-1.5 sm:grid-cols-2">
                          {item.siswa.map((s, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-sm bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5"
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
                      </div>
                    )}

                    {/* Footer: tanggal + aksi */}
                    <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-gray-50 pt-2.5">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        {isExpanded ? 'Sembunyikan anggota' : 'Lihat anggota'}
                      </button>
                      {canEdit && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingTahsin(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                            Kelola
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ jenis: 'tahsin', item })}
                            title="Hapus pengajuan"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
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

      {/* Konfirmasi hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
            <h3 className="font-bold text-gray-900 mb-1">Hapus Pengajuan?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Pengajuan{' '}
              <span className="font-semibold text-gray-800">
                {deleteTarget.jenis === 'tahfidz'
                  ? deleteTarget.item.nama_siswa
                  : deleteTarget.item.nama_kelompok}
              </span>{' '}
              akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
