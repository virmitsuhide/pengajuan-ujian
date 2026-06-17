'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTahsinSubmission } from '@/lib/actions/submissions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { SiswaItem, Unit } from '@/lib/types'
import { Plus, Trash2 } from 'lucide-react'

const TAHSIN_LEVELS: Record<Unit, string[]> = {
  SD: ['Jilid 1', 'Jilid 2', 'Jilid 3', 'Jilid 4', 'Jilid 5', 'Jilid 6', "Al-Qur'an", 'Gharib', 'Tajwid'],
  SMP: ['Jilid 1', 'Jilid 2', 'Jilid 3', 'Jilid 4', 'Jilid 5'],
}

// Satu capaian/level beserta daftar siswa-nya. Sebuah kelompok bisa punya
// beberapa capaian sekaligus.
interface LevelGroup {
  level: string
  siswa: { nama: string }[]
}

function emptyGroup(): LevelGroup {
  return { level: '', siswa: [{ nama: '' }] }
}

export function TahsinForm({ unit }: { unit: Unit }) {
  const router = useRouter()
  const [namaKelompok, setNamaKelompok] = useState('')
  const [sesi, setSesi] = useState('')
  const [groups, setGroups] = useState<LevelGroup[]>([emptyGroup()])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function addGroup() {
    setGroups((prev) => [...prev, emptyGroup()])
  }

  function removeGroup(gi: number) {
    setGroups((prev) => prev.filter((_, i) => i !== gi))
  }

  function updateLevel(gi: number, level: string) {
    setGroups((prev) => prev.map((g, i) => (i === gi ? { ...g, level } : g)))
  }

  function addSiswa(gi: number) {
    setGroups((prev) =>
      prev.map((g, i) => (i === gi ? { ...g, siswa: [...g.siswa, { nama: '' }] } : g))
    )
  }

  function removeSiswa(gi: number, si: number) {
    setGroups((prev) =>
      prev.map((g, i) =>
        i === gi ? { ...g, siswa: g.siswa.filter((_, j) => j !== si) } : g
      )
    )
  }

  function updateSiswaName(gi: number, si: number, nama: string) {
    setGroups((prev) =>
      prev.map((g, i) =>
        i === gi
          ? { ...g, siswa: g.siswa.map((s, j) => (j === si ? { nama } : s)) }
          : g
      )
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Rakit daftar siswa (flat) — tiap siswa membawa level-nya sendiri.
    const siswa: SiswaItem[] = []
    const usedLevels: string[] = []
    for (const g of groups) {
      const level = g.level.trim()
      const filled = g.siswa.map((s) => s.nama.trim()).filter(Boolean)
      if (!level && filled.length === 0) continue // baris kosong, abaikan
      if (!level) {
        setError('Pilih level untuk setiap capaian.')
        return
      }
      if (filled.length === 0) {
        setError(`Level "${level}" belum punya siswa. Tambahkan minimal 1 siswa.`)
        return
      }
      if (!usedLevels.includes(level)) usedLevels.push(level)
      for (const nama of filled) {
        siswa.push({ nama, predikat: null, level })
      }
    }

    if (siswa.length === 0) {
      setError('Tambahkan minimal 1 level dengan 1 siswa.')
      return
    }

    setLoading(true)
    try {
      const result = await createTahsinSubmission({
        nama_kelompok: namaKelompok.trim(),
        sesi: sesi.trim(),
        level: usedLevels.join(', '),
        siswa,
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

      {/* Daftar level/capaian — tiap level punya daftar siswa sendiri */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">
          Level & Siswa <span className="text-red-500">*</span>
        </label>

        {groups.map((group, gi) => (
          <div
            key={gi}
            className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3.5 flex flex-col gap-3"
          >
            {/* Header level: dropdown + hapus level */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 flex-shrink-0">
                Capaian {gi + 1}
              </span>
              <select
                value={group.level}
                onChange={(e) => updateLevel(gi, e.target.value)}
                required
                className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="" disabled>Pilih level...</option>
                {TAHSIN_LEVELS[unit].map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
              {groups.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGroup(gi)}
                  title="Hapus capaian ini"
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Daftar siswa pada level ini */}
            <div className="flex flex-col gap-2">
              {group.siswa.map((s, si) => (
                <div key={si} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5 text-right flex-shrink-0">
                    {si + 1}.
                  </span>
                  <input
                    type="text"
                    placeholder={`Nama siswa ${si + 1}`}
                    value={s.nama}
                    onChange={(e) => updateSiswaName(gi, si, e.target.value)}
                    className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  {group.siswa.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSiswa(gi, si)}
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
              onClick={() => addSiswa(gi)}
              className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Tambah Siswa
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addGroup}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Level / Capaian
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
