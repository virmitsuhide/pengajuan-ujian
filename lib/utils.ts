import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { TahfidzTipe, SubmissionStatus, Predikat, Unit, TahfidzSubmission, TahsinSubmission, SiswaItem } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type TahsinSiswaSource = Pick<TahsinSubmission, 'level' | 'siswa'>

// Kelompokkan siswa tahsin per level/capaian, mempertahankan urutan kemunculan.
// Siswa pada data lama (tanpa `level`) otomatis memakai level pengajuan.
export function groupSiswaByLevel(
  item: TahsinSiswaSource
): { level: string; siswa: SiswaItem[] }[] {
  const groups: { level: string; siswa: SiswaItem[] }[] = []
  for (const s of item.siswa) {
    const lvl = s.level?.trim() || item.level
    let group = groups.find((g) => g.level === lvl)
    if (!group) {
      group = { level: lvl, siswa: [] }
      groups.push(group)
    }
    group.siswa.push(s)
  }
  return groups
}

// Daftar level unik (urut kemunculan) pada satu pengajuan tahsin.
export function getTahsinLevels(item: TahsinSiswaSource): string[] {
  return groupSiswaByLevel(item).map((g) => g.level)
}

// String ringkas level untuk ditampilkan, mis. "Jilid 1, Al-Qur'an".
export function formatTahsinLevels(item: TahsinSiswaSource): string {
  const levels = getTahsinLevels(item)
  return levels.length > 0 ? levels.join(', ') : item.level
}

export function getTahfidzLabel(tipe: TahfidzTipe, juz: string): string {
  switch (tipe) {
    case '1_juz':
      return `Tasmi' Juz ${juz}`
    case '3_juz':
      return `Tasmi' 3 Juz (${juz})`
    case '5_juz':
      return `Tasmi' 5 Juz (${juz})`
  }
}

export function getStatusLabel(status: SubmissionStatus): string {
  switch (status) {
    case 'diajukan':
      return 'Diajukan'
    case 'dijadwalkan':
      return 'Dijadwalkan'
    case 'selesai':
      return 'Selesai'
  }
}

export function getStatusColor(status: SubmissionStatus): string {
  switch (status) {
    case 'diajukan':
      return 'bg-amber-100 text-amber-800 border border-amber-200'
    case 'dijadwalkan':
      return 'bg-blue-100 text-blue-800 border border-blue-200'
    case 'selesai':
      return 'bg-green-100 text-green-800 border border-green-200'
  }
}

export function getPredikatLabel(predikat: Predikat | null): string {
  if (!predikat) return '-'
  switch (predikat) {
    case 'mumtaz':
      return 'Mumtaz'
    case 'jayyid_jiddan':
      return 'Jayyid Jiddan'
    case 'jayyid':
      return 'Jayyid'
    case 'maqbul':
      return 'Maqbul'
    case 'mengulang':
      return 'Mengulang'
  }
}

export function getPredikatColor(predikat: Predikat | null): string {
  switch (predikat) {
    case 'mumtaz':
      return 'text-emerald-700 font-semibold'
    case 'jayyid_jiddan':
      return 'text-blue-700 font-semibold'
    case 'jayyid':
      return 'text-sky-700 font-semibold'
    case 'maqbul':
      return 'text-amber-700 font-semibold'
    case 'mengulang':
      return 'text-red-700 font-semibold'
    default:
      return 'text-gray-400'
  }
}

export function getUnitColor(unit: Unit): string {
  return unit === 'SD'
    ? 'bg-green-100 text-green-800 border border-green-200'
    : 'bg-purple-100 text-purple-800 border border-purple-200'
}

export function formatDate(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  })
}

export function formatDateOnly(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })
}

export function usernameToEmail(username: string): string {
  return `${username}@tahfidz.internal`
}

const WA_FOOTER = `\n———————————\nInfo terkait PPDB TPAIT, SDIT, SMPIT, SMA, QULS LHI :\n\n📱 0823-1115-3344 (Admin PPDB) \n🔗 https://ppdb.lhi.sch.id\n📍Jl Karanglo, Jogoragan, Banguntapan, Bantul, D.I.Yogyakarta`

const UNIT_FULL_NAME: Record<Unit, string> = {
  SD: 'SDIT LHI Banguntapan',
  SMP: 'SMPIT LHI Banguntapan',
}

export function generateWAText(
  item: TahfidzSubmission,
  gender: 'putra' | 'putri'
): string {
  const isPutri = gender === 'putri'
  const emoji = isPutri ? '🧕🏻' : '🧒🏻'
  const putraPutri = isPutri ? 'Putri' : 'Putra'
  const siswaSiswi = isPutri ? 'Siswi' : 'Siswa'
  const unitName = UNIT_FULL_NAME[item.unit]
  const kelasLine = `${siswaSiswi} Kelas ${item.kelas}${item.is_quls ? ' QULS' : ''} ${unitName}`

  if (item.tipe === '1_juz') {
    return `[Laporan TASMI' Juz ${item.juz}]

Alhamdulillah, dengan rahmat dan taufik-Nya ﷻ, telah menghafal dan melaksanakan Ujian Al Quran :

Juz ${item.juz} bil ghoib,  Ananda

${emoji} ${item.nama_siswa}, ${putraPutri} dari Bapak ${item.nama_ayah}
${kelasLine}

Kedepan insyaAllah ananda akan melanjutkan hafalannya dengan target melaksanakan ujian hafalan 3-5 juz sekali duduk.

Semoga Allāh jadikan Ananda semua Ahlul Quran yang hidup sesuai tuntunan Al Quran, dan berakhlak dengan akhlak Al Quran.

ونسأل الله أن يجعل القرآن رببع قلوبنا ونور صدورنا وجلاء أحزاننا وذهاب همومنا وغمومنا. اللهم آمين
${WA_FOOTER}`
  }

  if (item.tipe === '3_juz') {
    return `[Laporan TASMI' 3 Juz]

Alhamdulillah, dengan rahmat dan taufik-Nya ﷻ, telah menghafal dan melaksanakan Ujian Al Quran

📖 Tasmi' 3 Juz bil ghoib, Ananda:
${emoji}${item.nama_siswa}
${putraPutri} dari Bapak ${item.nama_ayah}
${kelasLine}

Kedepan insyaAllah Ananda akan melanjutkan hafalannya dengan target melaksanakan ujian hafalan 5-10 juz dengan Tasmi' sekali duduk.

Semoga Allāh jadikan Ananda semua Ahlul Quran yang hidup sesuai tuntunan Al Quran, dan berakhlak dengan akhlak Al Quran.

ونسأل الله أن يجعل القرآن رببع قلوبنا ونور صدورنا وجلاء أحزاننا وذهاب همومنا وغمومنا. اللهم آمين
${WA_FOOTER}`
  }

  // 5_juz
  return `[Laporan TASMI' 5 Juz]

Alhamdulillah, dengan rahmat dan taufik-Nya ﷻ, telah menghafal dan melaksanakan Ujian Al Quran :

Juz ${item.juz} bil ghoib,  Ananda

${emoji} ${item.nama_siswa}, ${putraPutri} dari Bapak ${item.nama_ayah}
${kelasLine}

Kedepan insyaAllah ananda akan melanjutkan hafalannya dengan target melaksanakan ujian hafalan 10 Juz sekali duduk.

Semoga Allāh jadikan Ananda semua Ahlul Quran yang hidup sesuai tuntunan Al Quran, dan berakhlak dengan akhlak Al Quran.

ونسأل الله أن يجعل القرآن رببع قلوبنا ونور صدورنا وجلاء أحزاننا وذهاب همومنا وغمومنا. اللهم آمين
${WA_FOOTER}`
}

// Laporan ringkas untuk pembuat flyer (data poin, mudah dicopy-paste)
export function generateFlyerText(item: TahfidzSubmission): string {
  return `👑Laporan ${getTahfidzLabel(item.tipe, item.juz)}

Nama : ${item.nama_siswa}
Nama Ayah: ${item.nama_ayah}
Kelas : ${item.kelas}${item.is_quls ? ' QULS' : ''}
Tanggal ujian : ${formatDateOnly(item.jadwal)}
Penguji: ${item.penguji ?? '-'}
Predikat: ${getPredikatLabel(item.predikat)}`
}
