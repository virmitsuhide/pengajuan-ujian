'use client'

import { useState, useTransition } from 'react'
import { createGuru, deleteGuru } from '@/lib/actions/users'
import type { GuruAccount, Unit } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { UserPlus, Trash2, Eye, EyeOff, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  guruList: GuruAccount[]
  unit: Unit | null
  isAdmin?: boolean
}

export function GuruClient({ guruList: initial, unit, isAdmin }: Props) {
  const router = useRouter()
  const [guruList, setGuruList] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedUnit, setSelectedUnit] = useState<Unit>(unit ?? 'SD')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<GuruAccount | null>(null)
  const [isPending, startTransition] = useTransition()

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
          {guruList.map((guru) => (
            <div
              key={guru.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between gap-2"
            >
              <div>
                <p className="font-semibold text-gray-900 text-sm">{guru.username}</p>
                <p className="text-xs text-gray-400 mt-0.5">Dibuat {formatDate(guru.created_at)}</p>
              </div>
              <button
                onClick={() => setDeleteTarget(guru)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
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
    </div>
  )
}
