'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPenguji, deletePenguji } from '@/lib/actions/pengujis'
import type { Penguji } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { UserPlus, Trash2 } from 'lucide-react'

interface Props {
  pengujis: Penguji[]
}

export function PengujiManager({ pengujis }: Props) {
  const router = useRouter()
  const [nama, setNama] = useState('')
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Penguji | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (nama.trim().length < 2) {
      setError('Nama penguji minimal 2 karakter')
      return
    }

    startTransition(async () => {
      const result = await createPenguji(nama)
      if (result.error) {
        setError(result.error)
        return
      }
      setNama('')
      router.refresh()
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      await deletePenguji(deleteTarget.id)
      setDeleteTarget(null)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Form tambah */}
      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
        <label className="text-xs font-medium text-gray-600">Tambah Nama Penguji</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Ust Nuha"
            className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 bg-violet-600 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Tambah
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
        <p className="text-xs text-gray-400">
          Daftar ini dipakai saat koordinator memilih penguji ketika menjadwalkan ujian.
        </p>
      </form>

      {/* Daftar penguji */}
      {pengujis.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🧑‍🏫</p>
          <p className="text-sm">Belum ada penguji</p>
          <p className="text-xs mt-1">Tambah nama agar bisa dipilih saat menjadwalkan ujian</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pengujis.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{p.nama}</p>
                <p className="text-xs text-gray-400 mt-0.5">Ditambahkan {formatDate(p.created_at)}</p>
              </div>
              <button
                onClick={() => setDeleteTarget(p)}
                title="Hapus penguji"
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
            <h3 className="font-bold text-gray-900 mb-1">Hapus Penguji?</h3>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-semibold text-gray-800">{deleteTarget.nama}</span> akan dihapus
              dari daftar. Data ujian yang sudah tercatat dengan nama ini tidak berubah.
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
