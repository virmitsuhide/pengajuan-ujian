import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { TahfidzTipe, SubmissionStatus, Predikat, Unit } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

export function usernameToEmail(username: string): string {
  return `${username}@tahfidz.internal`
}
