'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  createGuru,
  deleteGuru,
  updateGuru,
  getGuruSubmissionHistory,
} from '@/lib/actions/users'
import type {
  GuruAccount,
  Penguji,
  TahfidzSubmission,
  TahsinSubmission,
  Unit,
} from '@/lib/types'
import { PengujiManager } from './PengujiManager'
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  getTahfidzLabel,
  formatTahsinLevels,
} from '@/lib/utils'
import {
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  X,
  Pencil,
  History,
  KeyRound,
  BookOpen,
  Clipboard,
  Users,
  ClipboardCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useRouter } from 'next/navigation'

interface Props {
  guruList: GuruAccount[]
  pengujis: Penguji[]
  unit: Unit | null
  isAdmin?: boolean
}

export function GuruClient({ guruList: initial, pengujis, unit, isAdmin }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'guru' | 'penguji'>('guru')
  const [guruList, setGuruList] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedUnit, setSelectedUnit] = useState<Unit>(unit ?? 'SD')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<GuruAccount | null>(null)
  const [editTarget, setEditTarget] = useState<GuruAccount | null>(null)
  const [historyTarget, setHistoryTarget] = useState<GuruAccount | null>(null)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  function toggleReveal(id: string) {
    setRevealed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function resetForm() {
    setUsername('')
    setPassword('')
    setSelectedUnit(unit ?? 'SD')
    setError('')
    setShowForm(false)
    setShowPassword(false)
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (username.trim().length < 3) {
      setError('Username minimal 3 karakter')
      return
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    startTransition(async () => {
      const result = await createGuru({ username: username.trim(), password, unit: selectedUnit })
      if (result.error) {
        setError(result.error)
        return
      }
      resetForm()
      router.refresh()
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      await deleteGuru(deleteTarget.id)
      setGuruList((prev) => prev.filter((g) => g.id !== deleteTarget.id))
      setDeleteTarget(null)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tab switch */}
      <div className="flex gap-2">
        {([
          { value: 'guru', label: 'Akun Guru', icon: Users },
          { value: 'penguji', label: 'Daftar Penguji', icon: ClipboardCheck },
        ] as const).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={
              'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all ' +
              (activeTab === tab.value
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300')
            }
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'penguji' ? (
        <PengujiManager pengujis={pengujis} />
      ) : (
        <>
      {/* Tombol tambah */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-violet-600 text-white rounded-2xl px-4 py-3 text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm w-full justify-center"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Akun Guru
        </button>
      )}

      {/* Form tambah guru */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-gray-900">Akun Guru Baru</p>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            {isAdmin && (
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Unit</label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value as Unit)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="SD">SD (SDIT LHI)</option>
                  <option value="SMP">SMP (SMPIT LHI)</option>
                </select>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: ustadz_budi"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Unit {isAdmin ? selectedUnit : unit} · login dengan username ini</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="bg-violet-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Menyimpan...' : 'Buat Akun'}
            </button>
          </form>
        </div>
      )}

      {/* Daftar guru */}
      {guruList.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">👨‍🏫</p>
          <p className="text-sm">Belum ada akun guru</p>
          <p className="text-xs mt-1">Tambah akun agar guru bisa mengajukan ujian</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {guruList.map((guru) => {
            const isRevealed = revealed.has(guru.id)
            return (
              <div
                key={guru.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm truncate">{guru.username}</p>
                      {isAdmin && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          guru.unit === 'SD'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {guru.unit}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Dibuat {formatDate(guru.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setHistoryTarget(guru)}
                      title="Riwayat pengajuan"
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditTarget(guru)}
                      title="Edit nama / password"
                      className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(guru)}
                      title="Hapus"
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                  <KeyRound className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  {guru.password ? (
                    <>
                      <span className="text-sm font-mono text-gray-700 flex-1 truncate">
                        {isRevealed ? guru.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => toggleReveal(guru.id)}
                        className="text-gray-400 hover:text-gray-600"
                        title={isRevealed ? 'Sembunyikan' : 'Lihat password'}
                      >
                        {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 flex-1">
                      Password belum tersimpan — ubah password untuk menyimpannya
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal edit guru */}
      {editTarget && (
        <EditGuruModal
          guru={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null)
            router.refresh()
          }}
        />
      )}

      {/* Modal riwayat pengajuan */}
      {historyTarget && (
        <GuruHistoryModal guru={historyTarget} onClose={() => setHistoryTarget(null)} />
      )}

      {/* Konfirmasi hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
            <h3 className="font-bold text-gray-900 mb-1">Hapus Akun Guru?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Akun <span className="font-semibold text-gray-800">{deleteTarget.username}</span> akan
              dihapus permanen. Pengajuan yang sudah dibuat tidak ikut terhapus.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
        </>
      )}
    </div>
  )
}

// ─── Modal edit nama & password ───────────────────────────────────────────────

function EditGuruModal({
  guru,
  onClose,
  onSaved,
}: {
  guru: GuruAccount
  onClose: () => void
  onSaved: () => void
}) {
  const [username, setUsername] = useState(guru.username)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmed = username.trim()
    const usernameChanged = trimmed !== guru.username
    const passwordChanged = password.length > 0

    if (usernameChanged && trimmed.length < 3) {
      setError('Username minimal 3 karakter')
      return
    }
    if (passwordChanged && password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }
    if (!usernameChanged && !passwordChanged) {
      setError('Tidak ada perubahan')
      return
    }

    startTransition(async () => {
      const result = await updateGuru(guru.id, {
        username: usernameChanged ? trimmed : undefined,
        password: passwordChanged ? password : undefined,
      })
      if (result.error) {
        setError(result.error)
        return
      }
      onSaved()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Edit Akun Guru</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Password baru</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kosongkan jika tidak diubah"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modal riwayat pengajuan guru ─────────────────────────────────────────────

function GuruHistoryModal({ guru, onClose }: { guru: GuruAccount; onClose: () => void }) {
  const [loading, setLoading] = useState(true)
  const [tahfidz, setTahfidz] = useState<TahfidzSubmission[]>([])
  const [tahsin, setTahsin] = useState<TahsinSubmission[]>([])

  // Muat riwayat saat modal dibuka.
  useEffect(() => {
    let active = true
    getGuruSubmissionHistory(guru.id).then((data) => {
      if (!active) return
      setTahfidz(data.tahfidz)
      setTahsin(data.tahsin)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [guru.id])

  const total = tahfidz.length + tahsin.length

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-gray-900">Riwayat Pengajuan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          <span className="font-semibold text-gray-800">{guru.username}</span>
          {!loading && ` · ${total} pengajuan`}
        </p>

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-10">Memuat...</p>
        ) : total === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Belum ada pengajuan</p>
        ) : (
          <div className="flex flex-col gap-4">
            {tahfidz.length > 0 && (
              <section>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Tahfidz ({tahfidz.length})
                </p>
                <div className="flex flex-col gap-2">
                  {tahfidz.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-100 rounded-xl px-3 py-2 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.nama_siswa}</p>
                        <p className="text-xs text-gray-400">
                          {getTahfidzLabel(item.tipe, item.juz)} · Kelas {item.kelas}
                        </p>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tahsin.length > 0 && (
              <section>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Clipboard className="w-3.5 h-3.5" /> Tahsin ({tahsin.length})
                </p>
                <div className="flex flex-col gap-2">
                  {tahsin.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-100 rounded-xl px-3 py-2 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.nama_kelompok}</p>
                        <p className="text-xs text-gray-400">
                          {formatTahsinLevels(item)} · {item.siswa.length} siswa
                        </p>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
