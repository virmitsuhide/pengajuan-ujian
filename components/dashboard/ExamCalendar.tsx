'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface CalendarEvent {
  date: string  // YYYY-MM-DD in WIB
  name: string
  type: 'tahfidz' | 'tahsin'
}

interface Props {
  events: CalendarEvent[]
  year: number
  month: number   // 0-indexed
  todayWIB: string  // YYYY-MM-DD, passed from server
}

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function formatSelectedDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00+07:00').toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function ExamCalendar({ events, year, month, todayWIB }: Props) {
  const eventsByDate: Record<string, CalendarEvent[]> = {}
  for (const e of events) {
    ;(eventsByDate[e.date] ??= []).push(e)
  }

  const firstUpcoming = events
    .map(e => e.date)
    .filter(d => d >= todayWIB)
    .sort()[0] ?? null

  const [selected, setSelected] = useState<string | null>(
    eventsByDate[todayWIB] ? todayWIB : firstUpcoming
  )

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7  // Mon=0
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const d = i - startOffset + 1
    return d >= 1 && d <= daysInMonth ? d : null
  })

  function toDateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const selectedEvents = selected ? (eventsByDate[selected] ?? []) : []

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-gray-800">
            Jadwal Ujian — {MONTH_NAMES[month]} {year}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {events.length === 0
              ? 'Belum ada ujian terjadwal'
              : `${events.length} ujian terjadwal bulan ini`}
          </p>
        </div>
        <div className="flex flex-col gap-1 items-end flex-shrink-0">
          <span className="flex items-center gap-1 text-[11px] text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Tahfidz
          </span>
          <span className="flex items-center gap-1 text-[11px] text-gray-500">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            Tahsin
          </span>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 bg-gray-50/60 border-b border-gray-100">
        {DAY_LABELS.map(d => (
          <div key={d} className="py-1.5 text-center text-[10px] font-bold text-gray-400 tracking-wider uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-50">
        {cells.map((day, i) => {
          if (!day) {
            return <div key={`_${i}`} className="h-12 bg-gray-50/40" />
          }

          const dateStr = toDateStr(day)
          const dayEvts = eventsByDate[dateStr] ?? []
          const isToday = dateStr === todayWIB
          const isSelected = dateStr === selected
          const hasEvts = dayEvts.length > 0
          const visibleDots = dayEvts.slice(0, 3)
          const extra = dayEvts.length - visibleDots.length

          return (
            <button
              key={dateStr}
              onClick={() => hasEvts && setSelected(isSelected ? null : dateStr)}
              disabled={!hasEvts}
              className={cn(
                'h-12 flex flex-col items-center justify-center gap-[3px] transition-all',
                hasEvts ? 'cursor-pointer' : 'cursor-default',
                isSelected ? 'bg-emerald-50' : hasEvts ? 'hover:bg-gray-50' : '',
              )}
            >
              <span className={cn(
                'w-7 h-7 flex items-center justify-center rounded-full text-xs transition-all',
                isToday && isSelected
                  ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-200'
                  : isToday
                  ? 'bg-emerald-600 text-white font-bold'
                  : isSelected
                  ? 'bg-emerald-100 text-emerald-800 font-bold'
                  : hasEvts
                  ? 'text-gray-800 font-semibold'
                  : 'text-gray-300',
              )}>
                {day}
              </span>

              {hasEvts && (
                <div className="flex items-center gap-[2px]">
                  {visibleDots.map((evt, j) => (
                    <div
                      key={j}
                      className={cn(
                        'w-[5px] h-[5px] rounded-full',
                        evt.type === 'tahfidz' ? 'bg-emerald-400' : 'bg-blue-400',
                      )}
                    />
                  ))}
                  {extra > 0 && (
                    <span className="text-[8px] text-gray-400 font-bold ml-[1px] leading-none">
                      +{extra}
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Events panel */}
      {selected && selectedEvents.length > 0 ? (
        <div className="border-t border-gray-100 px-4 py-3">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2.5">
            {formatSelectedDate(selected)}
          </p>
          <div className="flex flex-col gap-1.5">
            {selectedEvents.map((evt, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2.5',
                  evt.type === 'tahfidz' ? 'bg-emerald-50' : 'bg-blue-50',
                )}
              >
                <div className={cn(
                  'w-1 h-5 rounded-full flex-shrink-0',
                  evt.type === 'tahfidz' ? 'bg-emerald-500' : 'bg-blue-500',
                )} />
                <p className="text-sm font-medium text-gray-900 flex-1 min-w-0 truncate">
                  {evt.name}
                </p>
                <span className={cn(
                  'text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0',
                  evt.type === 'tahfidz'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700',
                )}>
                  {evt.type === 'tahfidz' ? 'Tahfidz' : 'Tahsin'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : events.length > 0 && !selected ? (
        <div className="border-t border-gray-100 px-4 py-3 text-center">
          <p className="text-xs text-gray-400">Tap tanggal untuk melihat jadwal</p>
        </div>
      ) : null}
    </div>
  )
}
