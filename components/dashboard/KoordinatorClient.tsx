'use client'

import { useState, useTransition } from 'react'
import {
  createKoordinator,
  deleteKoordinator,
  updateKoordinatorPassword,
} from '@/lib/actions/users'
import type { KoordinatorAccount, Unit } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { UserPlus, Trash2, Eye, EyeOff, X, KeyRound } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  koordinatorList: KoordinatorAccount[]
}

export function KoordinatorClient({ koordinatorList: initial }: Props) {
  const router = useRouter()
  const [list, setList] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [unit, setUnit] = useState<Unit>('SD')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<KoordinatorAccount | null>(null)
  const [editTarget, setEditTarget] = useState<KoordinatorAccount | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [editError, setEditError] = useState('')
  const [isPending, startTransition] = useTransition()

  function resetForm() {
    setUsername('')
    setPassword('')
    setUnit('SD')
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
      const result = await createKoordinator({ username: username.trim(), password, unit })
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
      await deleteKoordinator(deleteTarget.id)
      setList((prev) => prev.filter((k) => k.id !== deleteTarget.id))
      setDeleteTarget(null)
      router.refresh()
    })
  }

  function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setEditError('')

    if (!editTarget) return
    if (newPassword.length < 6) {
      setEditError('Password minimal 6 karakter')
      return
    }

    startTransition(async () => {
      const result = await updateKoordinatorPassword(editTarget.id, newPassword)
      if (result.error) {
        setEditError(result.error)
        return
      }
      setEditTarget(null)
      setNewPassword('')
      setShowNewPassword(false)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white rounded-2xl px-4 py-3 text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm w-full justify-center"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Koordinator
        </button>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-gray-900">Koordinator Baru</p>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="SD">SD (SDIT LHI)</option>
                <option value="SMP">SMP (SMPIT LHI)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: koorsd2"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              className="bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Menyimpan...' : 'Buat Koordinator'}
            </button>
          </form>
        </div>
      )}

      {list.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">👤</p>
          <p className="text-sm">Belum ada akun koordinator</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((koor) => (
            <div
              key={koor.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-sm">{koor.username}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    koor.unit === 'SD'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {koor.unit}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Dibuat {formatDate(koor.created_at)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditTarget(koor)
                    setNewPassword('')
                    setEditError('')
                    setShowNewPassword(false)
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                  title="Ganti password"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(koor)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal ganti password */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Ganti Password</h3>
              <button
                onClick={() => setEditTarget(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Akun: <span className="font-semibold text-gray-800">{editTarget.username}</span> ({editTarget.unit})
            </p>
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password baru (min 6 karakter)"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {editError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {editError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal konfirmasi hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
            <h3 className="font-bold text-gray-900 mb-1">Hapus Koordinator?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Akun <span className="font-semibold text-gray-800">{deleteTarget.username}</span> ({deleteTarget.unit}) akan dihapus permanen.
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
    </div>
  )
}
