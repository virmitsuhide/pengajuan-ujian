import type { TahfidzSubmission, TahsinSubmission } from '@/lib/types'
import {
  getTahfidzLabel,
  getStatusColor,
  getStatusLabel,
  getUnitColor,
  formatDate,
  cn,
} from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { BookOpen, User, Calendar, Clipboard, Users } from 'lucide-react'

export function TahfidzQueueCard({ item }: { item: TahfidzSubmission }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getUnitColor(item.unit)}>{item.unit}</Badge>
          <Badge className="bg-indigo-100 text-indigo-800 border border-indigo-200">
            Tahfidz
          </Badge>
          <Badge className={getStatusColor(item.status)}>
            {getStatusLabel(item.status)}
          </Badge>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{item.nama_siswa}</p>
          <p className="text-sm text-gray-500">
            {getTahfidzLabel(item.tipe, item.juz)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Kelas {item.kelas} · Ayah: {item.nama_ayah}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-50 pt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{item.jadwal ? formatDate(item.jadwal) : 'Belum dijadwalkan'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>{item.penguji || 'Penguji belum ditentukan'}</span>
        </div>
      </div>
    </div>
  )
}

export function TahsinQueueCard({ item }: { item: TahsinSubmission }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getUnitColor(item.unit)}>{item.unit}</Badge>
          <Badge className="bg-teal-100 text-teal-800 border border-teal-200">
            Tahsin
          </Badge>
          <Badge className={getStatusColor(item.status)}>
            {getStatusLabel(item.status)}
          </Badge>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
          <Clipboard className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{item.nama_kelompok}</p>
          <p className="text-sm text-gray-500">
            {item.level} · Sesi {item.sesi}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {item.siswa.length} siswa
          </p>
        </div>
      </div>

      {item.siswa.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.siswa.slice(0, 5).map((s, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-gray-50 text-gray-600 text-xs rounded-lg px-2 py-0.5 border border-gray-100"
            >
              <Users className="w-3 h-3" />
              {s.nama}
            </span>
          ))}
          {item.siswa.length > 5 && (
            <span className="text-xs text-gray-400 self-center">
              +{item.siswa.length - 5} lainnya
            </span>
          )}
        </div>
      )}

      <div className="border-t border-gray-50 pt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{item.jadwal ? formatDate(item.jadwal) : 'Belum dijadwalkan'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>{item.penguji || 'Penguji belum ditentukan'}</span>
        </div>
      </div>
    </div>
  )
}
