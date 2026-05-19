'use client'

import { useState } from 'react'
import type { TahfidzSubmission, TahsinSubmission } from '@/lib/types'
import { TahfidzQueueCard, TahsinQueueCard } from './QueueCard'
import { cn } from '@/lib/utils'

interface QueueTabsProps {
  tahfidz: {
    sd: { unscheduled: TahfidzSubmission[]; scheduled: TahfidzSubmission[] }
    smp: { unscheduled: TahfidzSubmission[]; scheduled: TahfidzSubmission[] }
  }
  tahsin: {
    sd: { unscheduled: TahsinSubmission[]; scheduled: TahsinSubmission[] }
    smp: { unscheduled: TahsinSubmission[]; scheduled: TahsinSubmission[] }
  }
}

type ActiveUnit = 'SD' | 'SMP'

export function QueueTabs({ tahfidz, tahsin }: QueueTabsProps) {
  const [activeUnit, setActiveUnit] = useState<ActiveUnit>('SD')

  const tfData = activeUnit === 'SD' ? tahfidz.sd : tahfidz.smp
  const tsData = activeUnit === 'SD' ? tahsin.sd : tahsin.smp

  const totalAntrian =
    tfData.unscheduled.length +
    tfData.scheduled.length +
    tsData.unscheduled.length +
    tsData.scheduled.length

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        {(['SD', 'SMP'] as ActiveUnit[]).map((unit) => (
          <button
            key={unit}
            onClick={() => setActiveUnit(unit)}
            className={cn(
              'flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all',
              activeUnit === unit
                ? unit === 'SD'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
            )}
          >
            {unit}
          </button>
        ))}
      </div>

      {totalAntrian === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">Belum ada antrian untuk unit {activeUnit}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tahfidz Section */}
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Antrian Tahfidz
            </h2>

            {/* Belum Terjadwal */}
            {tfData.unscheduled.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Belum Terjadwal ({tfData.unscheduled.length})
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {tfData.unscheduled.map((item) => (
                    <TahfidzQueueCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Separator */}
            {tfData.unscheduled.length > 0 && tfData.scheduled.length > 0 && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">Sudah Terjadwal</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}

            {/* Sudah Terjadwal */}
            {tfData.scheduled.length > 0 && (
              <div>
                {tfData.unscheduled.length === 0 && (
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Sudah Terjadwal ({tfData.scheduled.length})
                  </p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {tfData.scheduled.map((item) => (
                    <TahfidzQueueCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {tfData.unscheduled.length === 0 && tfData.scheduled.length === 0 && (
              <p className="text-sm text-gray-400 py-4 text-center">Belum ada pengajuan Tahfidz</p>
            )}
          </section>

          {/* Divider between Tahfidz and Tahsin */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Tahsin Section */}
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              Antrian Tahsin
            </h2>

            {/* Belum Terjadwal */}
            {tsData.unscheduled.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Belum Terjadwal ({tsData.unscheduled.length})
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {tsData.unscheduled.map((item) => (
                    <TahsinQueueCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Separator */}
            {tsData.unscheduled.length > 0 && tsData.scheduled.length > 0 && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">Sudah Terjadwal</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}

            {/* Sudah Terjadwal */}
            {tsData.scheduled.length > 0 && (
              <div>
                {tsData.unscheduled.length === 0 && (
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Sudah Terjadwal ({tsData.scheduled.length})
                  </p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {tsData.scheduled.map((item) => (
                    <TahsinQueueCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {tsData.unscheduled.length === 0 && tsData.scheduled.length === 0 && (
              <p className="text-sm text-gray-400 py-4 text-center">Belum ada pengajuan Tahsin</p>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
