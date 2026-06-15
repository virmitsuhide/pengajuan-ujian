'use client'

import { useState } from 'react'
import type { TahfidzSubmission, Predikat, SubmissionStatus } from '@/lib/types'
import {
  updateTahfidzSubmission,
  deleteTahfidzSubmission,
} from '@/lib/actions/submissions'
import {
  getTahfidzLabel,
  getStatusLabel,
  generateWAText,
  generateFlyerText,
  cn,
} from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { X, Trash2, ChevronRight, Copy, Check, MessageCircle, Megaphone, CalendarX } from 'lucide-react'

const PREDIKAT_OPTIONS: { value: Predikat; label: string }[] = [
  { value: 'mumtaz', label: 'Mumtaz' },
  { value: 'jayyid_jiddan', label: 'Jayyid Jiddan' },
  { value: 'jayyid', label: 'Jayyid' },
  { value: 'maqbul', label: 'Maqbul' },
  { value: 'mengulang', label: 'Mengulang' },
]

interface Props {
  item: TahfidzSubmission
  onClose: () => void
}

export function EditTahfidzModal({ item, onClose }: Props) {
  const [jadwal, setJadwal] = useState(
    item.jadwal ? new Date(item.jadwal).toISOString().slice(0, 16) : ''
  )
  const [penguji, setPenguji] = useState(item.penguji ?? '')
  const [namaAyah, setNamaAyah] = useState(item.nama_ayah)
  const [predikat, setPredikat] = useState<Predikat | ''>(item.predikat ?? '')
  const [catatan, setCatatan] = useState(item.catatan ?? '')
  const [isQuls, setIsQuls] = useState(item.is_quls)
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [error, setError] = useState('')
  const [gender, setGender] = useState<'putra' | 'putri'>('putri')
  const [copied, setCopied] = useState(false)
  const [copiedFlyer, setCopiedFlyer] = useState(false)

  async function handleSave() {
    setError('')
    setLoading(true)
    try {
      // Determine new status based on filled fields
      let newStatus: SubmissionStatus = item.status
      if (predikat) {
        newStatus = 'selesai'
      } else if (jadwal && penguji) {
        newStatus = 'dijadwalkan'
      }

      const result = await updateTahfidzSubmission(item.id, {
        jadwal: jadwal ? new Date(jadwal).toISOString() : null,
        penguji: penguji || null,
        predikat: predikat || null,
        catatan: catatan || null,
        nama_ayah: namaAyah,
        status: newStatus,
        is_quls: isQuls,
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

  async function handleCancelSchedule() {
    setLoading(true)
    setError('')
    try {
      const result = await updateTahfidzSubmission(item.id, {
        jadwal: null,
        penguji: null,
        status: 'diajukan',
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

  async function handleCopy() {
    const text = generateWAText(
      // Reflect current form values (predikat & is_quls might have just changed)
      { ...item, predikat: predikat || item.predikat, kelas: item.kelas, is_quls: isQuls },
      gender
    )
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  async function handleCopyFlyer() {
    const text = generateFlyerText({
      // Reflect current form values (predikat & is_quls might have just changed)
      ...item,
      penguji: penguji || item.penguji,
      predikat: predikat || item.predikat,
      is_quls: isQuls,
    })
    await navigator.clipboard.writeText(text)
    setCopiedFlyer(true)
    setTimeout(() => setCopiedFlyer(false), 2500)
  }

  async function handleDelete() {
    setLoading(true)
    try {
      const result = await deleteTahfidzSubmission(item.id)
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Edit Tahfidz
              </p>
              <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                {item.nama_siswa}
              </h2>
              <p className="text-sm text-gray-500">
                {getTahfidzLabel(item.tipe, item.juz)} · Kelas {item.kelas}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status flow indicator */}
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

          {/* Fields */}
          <div className="grid grid-cols-1 gap-4">
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

            <Input
              id="nama_ayah"
              label="Nama Ayah"
              placeholder="Nama lengkap ayah"
              value={namaAyah}
              onChange={(e) => setNamaAyah(e.target.value)}
            />

            <Select
              id="predikat"
              label="Predikat (isi setelah ujian selesai)"
              value={predikat}
              onChange={(e) => setPredikat(e.target.value as Predikat | '')}
            >
              <option value="">-- Belum ada --</option>
              {PREDIKAT_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>

            {/* QULS toggle */}
            <label className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isQuls}
                onChange={(e) => setIsQuls(e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-600"
              />
              <div>
                <span className="text-sm font-semibold text-indigo-800">Program QULS</span>
                <p className="text-xs text-indigo-500 mt-0.5">Centang jika siswa ini termasuk program QULS</p>
              </div>
            </label>

            <Textarea
              id="catatan"
              label="Catatan (opsional)"
              placeholder="Catatan dari penguji..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </div>

          {/* Status hint */}
          <div className="bg-blue-50 border border-blue-100 text-blue-700 text-xs rounded-xl px-3 py-2">
            Status akan otomatis berubah:{' '}
            <strong>Dijadwalkan</strong> jika jadwal & penguji diisi •{' '}
            <strong>Selesai</strong> jika predikat diisi
          </div>

          {/* Laporan WhatsApp — tampil jika status selesai atau predikat sudah diisi */}
          {(item.status === 'selesai' || predikat) && item.tipe !== undefined && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-700" />
                <p className="text-sm font-semibold text-green-800">Laporan WhatsApp</p>
              </div>

              {/* Gender toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-700 font-medium">Jenis kelamin:</span>
                <div className="flex gap-1">
                  {(['putri', 'putra'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={cn(
                        'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                        gender === g
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-green-700 border border-green-300'
                      )}
                    >
                      {g === 'putri' ? '🧕🏻 Putri' : '🧒🏻 Putra'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview teks */}
              <textarea
                readOnly
                value={generateWAText({ ...item, predikat: (predikat || item.predikat) as any, is_quls: isQuls }, gender)}
                rows={8}
                className="w-full rounded-xl border border-green-200 bg-white px-3 py-2.5 text-xs text-gray-700 font-mono resize-none focus:outline-none"
              />

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                className="w-full border-green-300 text-green-700 hover:bg-green-50 gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Salin Teks
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Laporan Flyer — data ringkas untuk pembuat flyer */}
          {(item.status === 'selesai' || predikat) && item.tipe !== undefined && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-700" />
                <p className="text-sm font-semibold text-amber-800">Laporan untuk Pembuat Flyer</p>
              </div>

              {/* Preview teks */}
              <textarea
                readOnly
                value={generateFlyerText({
                  ...item,
                  penguji: penguji || item.penguji,
                  predikat: (predikat || item.predikat) as any,
                  is_quls: isQuls,
                })}
                rows={7}
                className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-xs text-gray-700 font-mono resize-none focus:outline-none"
              />

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyFlyer}
                className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 gap-2"
              >
                {copiedFlyer ? (
                  <>
                    <Check className="w-4 h-4 text-amber-600" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Salin Teks
                  </>
                )}
              </Button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSave}
              loading={loading}
            >
              Simpan
            </Button>
          </div>

          {/* Batalkan Jadwal — hanya tampil saat status dijadwalkan */}
          {item.status === 'dijadwalkan' && (
            !cancelConfirm ? (
              <button
                onClick={() => setCancelConfirm(true)}
                className="flex items-center justify-center gap-1.5 text-sm text-orange-500 hover:text-orange-700 py-1"
                disabled={loading}
              >
                <CalendarX className="w-4 h-4" />
                Batalkan jadwal ujian
              </button>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex flex-col gap-2">
                <p className="text-sm text-orange-800 font-medium text-center">
                  Batalkan jadwal? Status akan kembali ke <strong>Diajukan</strong>.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setCancelConfirm(false)}
                  >
                    Tidak
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                    onClick={handleCancelSchedule}
                    loading={loading}
                  >
                    Ya, Batalkan
                  </Button>
                </div>
              </div>
            )
          )}

          {/* Delete */}
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
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setDeleteConfirm(false)}
                >
                  Batal
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  onClick={handleDelete}
                  loading={loading}
                >
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
