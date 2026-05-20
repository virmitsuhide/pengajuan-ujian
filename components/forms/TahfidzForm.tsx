'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTahfidzSubmission } from '@/lib/actions/submissions'
import { getTahfidzLabel } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { TahfidzTipe, Unit } from '@/lib/types'

const JUZ_OPTIONS = Array.from({ length: 30 }, (_, i) => i + 1)

export function TahfidzForm({ unit }: { unit: Unit }) {
  const router = useRouter()
  const [tipe, setTipe] = useState<TahfidzTipe>('1_juz')
  const [juz, setJuz] = useState('1')
  const [namaSiswa, setNamaSiswa] = useState('')
  const [namaAyah, setNamaAyah] = useState('')
  const [kelas, setKelas] = useState('')
  const [isQuls, setIsQuls] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const previewLabel = getTahfidzLabel(tipe, juz || '...')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!juz.trim()) {
      setError('Isi nomor/range juz terlebih dahulu.')
      return
    }

    setLoading(true)
    try {
      const result = await createTahfidzSubmission({
        tipe,
        juz: juz.trim(),
        nama_siswa: namaSiswa.trim(),
        nama_ayah: namaAyah.trim(),
        kelas: kelas.trim(),
        is_quls: isQuls,
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
      {/* Tipe */}
      <Select
        id="tipe"
        label="Tipe Ujian"
        value={tipe}
        onChange={(e) => {
          const val = e.target.value as TahfidzTipe
          setTipe(val)
          setJuz(val === '1_juz' ? '1' : '')
        }}
      >
        <option value="1_juz">1 Juz — Tasmi' Juz</option>
        <option value="3_juz">3 Juz — Tasmi' 3 Juz</option>
        <option value="5_juz">5 Juz — Tasmi' 5 Juz</option>
      </Select>

      {/* Juz input */}
      {tipe === '1_juz' ? (
        <Select
          id="juz"
          label="Nomor Juz"
          value={juz}
          onChange={(e) => setJuz(e.target.value)}
        >
          {JUZ_OPTIONS.map((n) => (
            <option key={n} value={String(n)}>
              Juz {n}
            </option>
          ))}
        </Select>
      ) : (
        <Input
          id="juz"
          label={tipe === '3_juz' ? 'Range Juz (contoh: 28-30)' : 'Range Juz (contoh: 26-30)'}
          placeholder={tipe === '3_juz' ? '28-30' : '26-30'}
          value={juz}
          onChange={(e) => setJuz(e.target.value)}
          required
        />
      )}

      {/* Preview label */}
      {juz && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 text-sm text-indigo-800 font-medium">
          Label: {previewLabel}
        </div>
      )}

      <Input
        id="nama_siswa"
        label="Nama Siswa"
        placeholder="Nama lengkap siswa"
        value={namaSiswa}
        onChange={(e) => setNamaSiswa(e.target.value)}
        required
      />

      <Input
        id="nama_ayah"
        label="Nama Ayah"
        placeholder="Nama lengkap ayah"
        value={namaAyah}
        onChange={(e) => setNamaAyah(e.target.value)}
        required
      />

      <Input
        id="kelas"
        label="Kelas"
        placeholder="Contoh: 5A, 7B"
        value={kelas}
        onChange={(e) => setKelas(e.target.value)}
        required
      />

      {/* QULS */}
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
        Ajukan Tahfidz
      </Button>
    </form>
  )
}
