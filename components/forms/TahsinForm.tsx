'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTahsinSubmission } from '@/lib/actions/submissions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { SiswaItem, Unit } from '@/lib/types'
import { Plus, Trash2 } from 'lucide-react'

export function TahsinForm({ unit }: { unit: Unit }) {
  const router = useRouter()
  const [namaKelompok, setNamaKelompok] = useState('')
  const [sesi, setSesi] = useState('')
  const [level, setLevel] = useState('')
  const [siswa, setSiswa] = useState<SiswaItem[]>([{ nama: '', predikat: null }])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function addSiswa() {
    setSiswa((prev) => [...prev, { nama: '', predikat: null }])
  }

  function removeSiswa(index: number) {
    setSiswa((prev) => prev.filter((_, i) => i !== index))
  }

  function updateSiswaName(index: number, nama: string) {
    setSiswa((prev) => prev.map((s, i) => (i === index ? { ...s, nama } : s)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const filledSiswa = siswa.filter((s) => s.nama.trim())
    if (filledSiswa.length === 0) {
      setError('Tambahkan minimal 1 nama siswa.')
      return
    }

    setLoading(true)
    try {
      const result = await createTahsinSubmission({
        nama_kelompok: namaKelompok.trim(),
        sesi: sesi.trim(),
        level: level.trim(),
        siswa: filledSiswa,
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      router.push('/dashboard/submissions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="nama_kelompok"
        label="Nama Kelompok / Ustadz-Ustadzah"
        placeholder="Nama ustadz/ustadzah"
        value={namaKelompok}
        onChange={(e) => setNamaKelompok(e.target.value)}
        required
      />

      <Input
        id="sesi"
        label="Sesi"
        placeholder="Contoh: Pagi, Sore, Sesi 1"
        value={sesi}
        onChange={(e) => setSesi(e.target.value)}
        required
      />

      <Input
        id="level"
        label="Level"
        placeholder="Contoh: Jilid 3, Al-Qur'an, Gharib, Tajwid"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        required
      />

      {/* Dynamic siswa list */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Daftar Siswa
        </label>
        <div className="flex flex-col gap-2">
          {siswa.map((s, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-5 text-right flex-shrink-0">
                {index + 1}.
              </span>
              <input
                type="text"
                placeholder={`Nama siswa ${index + 1}`}
                value={s.nama}
                onChange={(e) => updateSiswaName(index, e.target.value)}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {siswa.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSiswa(index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addSiswa}
          className="mt-3 flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Tambah Siswa
        </button>
      </div>

      {/* Unit info */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600">
        Unit: <span className="font-semibold text-gray-800">{unit}</span>{' '}
        <span className="text-gray-400">(sesuai akun Anda)</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <Button type="submit" loading={loading} size="lg" className="mt-2">
        Ajukan Tahsin
      </Button>
    </form>
  )
}
