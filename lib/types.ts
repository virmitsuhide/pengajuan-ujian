export type Unit = 'SD' | 'SMP'
export type SubmissionStatus = 'diajukan' | 'dijadwalkan' | 'selesai'
export type Predikat = 'mumtaz' | 'jayyid_jiddan' | 'jayyid' | 'maqbul' | 'mengulang'
export type TahfidzTipe = '1_juz' | '3_juz' | '5_juz'

export interface TahfidzSubmission {
  id: string
  unit: Unit
  tipe: TahfidzTipe
  juz: string
  nama_siswa: string
  nama_ayah: string
  kelas: string
  jadwal: string | null
  penguji: string | null
  predikat: Predikat | null
  catatan: string | null
  status: SubmissionStatus
  created_by: string
  created_at: string
  updated_at: string
}

export interface SiswaItem {
  nama: string
  predikat: 'lulus' | 'mengulang' | null
}

export interface TahsinSubmission {
  id: string
  unit: Unit
  nama_kelompok: string
  sesi: string
  level: string
  siswa: SiswaItem[]
  jadwal: string | null
  penguji: string | null
  catatan: string | null
  status: SubmissionStatus
  created_by: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  username: string
  unit: Unit
}
