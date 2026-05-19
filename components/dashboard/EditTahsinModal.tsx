'use client'

import { useState } from 'react'
import type { TahsinSubmission, SiswaItem, SubmissionStatus } from '@/lib/types'
import {
  updateTahsinSubmission,
  deleteTahsinSubmission,
} from '@/lib/actions/submissions'
import { getStatusLabel } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { X, Trash2, ChevronRight } from 'lucide-react'

interface Props {
  item: TahsinSubmission
  onClose: () => void
}

export function EditTahsinModal({ item, onClose }: Props) {
  const [jadwal, setJadwal] = useState(
    item.jadwal ? new Date(item.jadwal).toISOString().slice(0, 16) : ''
  )
  const [penguji, setPenguji] = useState(item.penguji ?? '')
  const [siswa, setSiswa] = useState<SiswaItem[]>(item.siswa)
  const [catatan, setCatatan] = useState(item.catatan ?? '')
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [error, setError] = useState('')

  function updatePredikat(index: number, predikat: SiswaItem['predikat']) {
    setSiswa((prev) =>
      prev.map((s, i) => (i === index ? { ...s, predikat } : s))
    )
  }

  async function handleSave() {
    setError('')
    setLoading(true)
    try {
      // Determine status
      let newStatus: SubmissionStatus = item.status
      const allDone = siswa.every((s) => s.predikat !== null)
      if (allDone && siswa.length > 0) {
        newStatus = 'selesai'
      } else if (jadwal && penguji) {
        newStatus = 'dijadwalkan'
      }

      const result = await updateTahsinSubmission(item.id, {
        jadwal: jadwal ? new Date(jadwal).toISOString() : null,
        penguji: penguji || null,
        siswa,
        catatan: catatan || null,
        status: newStatus,
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      onClose()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    try {
      const result = await deleteTahsinSubmission(item.id)
      if (result?.error) {
        setError(result.error)
        return
      }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Edit Tahsin
              </p>
              <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                {item.nama_kelompok}
              </h2>
              <p className="text-sm text-gray-500">
                {item.level} · Sesi {item.sesi}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status flow */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {(['diajukan', 'dijadwalkan', 'selesai'] as SubmissionStatus[]).map(
              (s, i, arr) => (
                <div key={s} className="flex items-center gap-1">
                  <span
                    className={
                      item.status === s
                        ? 'font-semibold text-emerald-700'
                        : 'text-gray-400'
                    }
                  >
                    {getStatusLabel(s)}
                  </span>
                  {i < arr.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                  )}
                </div>
              )
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Jadwal & Penguji */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Jadwal Ujian
            </label>
            <input
              type="datetime-local"
              value={jadwal}
              onChange={(e) => setJadwal(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <Input
            id="penguji"
            label="Penguji"
            placeholder="Nama penguji"
            value={penguji}
            onChange={(e) => setPenguji(e.target.value)}
          />

          {/* Siswa predikat */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Predikat Per Siswa
            </p>
            <div className="flex flex-col gap-2">
              {siswa.map((s, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2"
                >
                  <span className="text-sm text-gray-800 flex-1 font-medium">
                    {s.nama}
                  </span>
                  <select
                    value={s.predikat ?? ''}
                    onChange={(e) =>
                      updatePredikat(
                        index,
                        (e.target.value || null) as SiswaItem['predikat']
                      )
                    }
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Belum --</option>
                    <option value="lulus">Lulus</option>
                    <option value="mengulang">Mengulang</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <Textarea
            id="catatan"
            label="Catatan (opsional)"
            placeholder="Catatan dari penguji..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />

          {/* Status hint */}
          <div className="bg-blue-50 border border-blue-100 text-blue-700 text-xs rounded-xl px-3 py-2">
            Status otomatis: <strong>Dijadwalkan</strong> jika jadwal & penguji diisi •{' '}
            <strong>Selesai</strong> jika semua siswa sudah ada predikat
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-1">
            <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleSave} loading={loading}>
              Simpan
            </Button>
          </div>

          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center justify-center gap-1.5 text-sm text-red-500 hover:text-red-700 py-1"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
              Hapus pengajuan ini
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col gap-2">
              <p className="text-sm text-red-800 font-medium text-center">
                Yakin ingin menghapus?
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setDeleteConfirm(false)}>
                  Batal
                </Button>
                <Button variant="danger" size="sm" className="flex-1" onClick={handleDelete} loading={loading}>
                  Hapus
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
