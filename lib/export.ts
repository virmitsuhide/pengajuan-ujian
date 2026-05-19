import * as XLSX from 'xlsx'
import type { TahfidzSubmission, TahsinSubmission } from './types'
import { getTahfidzLabel, getPredikatLabel, formatDate } from './utils'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export function exportRekapExcel(
  tahfidz: TahfidzSubmission[],
  tahsin: TahsinSubmission[],
  month: number,
  year: number
) {
  const wb = XLSX.utils.book_new()
  const periodLabel = `${MONTHS[month - 1]} ${year}`

  // ─── Sheet 1: Tahfidz ────────────────────────────────────────
  const tahfidzRows = [
    ['REKAP HASIL UJIAN TAHFIDZ', '', '', '', '', '', '', '', ''],
    [`Periode: ${periodLabel}`, '', '', '', '', '', '', '', ''],
    [],
    ['No', 'Unit', 'Nama Siswa', 'Ayah', 'Kelas', 'Tipe Ujian', 'Predikat', 'Penguji', 'Jadwal', 'Catatan'],
    ...tahfidz.map((item, i) => [
      i + 1,
      item.unit,
      item.nama_siswa,
      item.nama_ayah,
      item.kelas,
      getTahfidzLabel(item.tipe, item.juz),
      getPredikatLabel(item.predikat),
      item.penguji ?? '-',
      item.jadwal ? formatDate(item.jadwal) : '-',
      item.catatan ?? '',
    ]),
  ]

  const wsTahfidz = XLSX.utils.aoa_to_sheet(tahfidzRows)

  // Column widths
  wsTahfidz['!cols'] = [
    { wch: 4 },  // No
    { wch: 6 },  // Unit
    { wch: 28 }, // Nama Siswa
    { wch: 22 }, // Ayah
    { wch: 10 }, // Kelas
    { wch: 22 }, // Tipe Ujian
    { wch: 16 }, // Predikat
    { wch: 20 }, // Penguji
    { wch: 24 }, // Jadwal
    { wch: 30 }, // Catatan
  ]

  XLSX.utils.book_append_sheet(wb, wsTahfidz, 'Tahfidz')

  // ─── Sheet 2: Tahsin ─────────────────────────────────────────
  // Expand each siswa into its own row
  const tahsinRows: (string | number)[][] = [
    ['REKAP HASIL UJIAN TAHSIN', '', '', '', '', '', '', '', ''],
    [`Periode: ${periodLabel}`, '', '', '', '', '', '', '', ''],
    [],
    ['No', 'Unit', 'Nama Kelompok', 'Sesi', 'Level', 'Nama Siswa', 'Predikat Siswa', 'Penguji', 'Jadwal', 'Catatan'],
  ]

  let rowNo = 1
  tahsin.forEach((item) => {
    if (item.siswa.length === 0) {
      tahsinRows.push([
        rowNo++,
        item.unit,
        item.nama_kelompok,
        item.sesi,
        item.level,
        '-',
        '-',
        item.penguji ?? '-',
        item.jadwal ? formatDate(item.jadwal) : '-',
        item.catatan ?? '',
      ])
    } else {
      item.siswa.forEach((s, si) => {
        tahsinRows.push([
          si === 0 ? rowNo++ : '',       // No hanya di baris pertama
          si === 0 ? item.unit : '',
          si === 0 ? item.nama_kelompok : '',
          si === 0 ? item.sesi : '',
          si === 0 ? item.level : '',
          s.nama,
          s.predikat === 'lulus' ? 'Lulus' : s.predikat === 'mengulang' ? 'Mengulang' : '-',
          si === 0 ? (item.penguji ?? '-') : '',
          si === 0 ? (item.jadwal ? formatDate(item.jadwal) : '-') : '',
          si === 0 ? (item.catatan ?? '') : '',
        ])
      })
    }
  })

  const wsTahsin = XLSX.utils.aoa_to_sheet(tahsinRows)

  wsTahsin['!cols'] = [
    { wch: 4 },  // No
    { wch: 6 },  // Unit
    { wch: 24 }, // Nama Kelompok
    { wch: 10 }, // Sesi
    { wch: 14 }, // Level
    { wch: 26 }, // Nama Siswa
    { wch: 16 }, // Predikat
    { wch: 20 }, // Penguji
    { wch: 24 }, // Jadwal
    { wch: 30 }, // Catatan
  ]

  XLSX.utils.book_append_sheet(wb, wsTahsin, 'Tahsin')

  // ─── Download ────────────────────────────────────────────────
  const fileName = `Rekap_Ujian_${MONTHS[month - 1]}_${year}.xlsx`
  XLSX.writeFile(wb, fileName)
}
