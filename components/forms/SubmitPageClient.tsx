'use client'

import { useState } from 'react'
import { TahfidzForm } from './TahfidzForm'
import { TahsinForm } from './TahsinForm'
import { cn } from '@/lib/utils'
import type { Unit } from '@/lib/types'

export function SubmitPageClient({ unit }: { unit: Unit }) {
  const [activeTab, setActiveTab] = useState<'tahfidz' | 'tahsin'>('tahfidz')

  return (
    <div className="pb-24 sm:pb-6 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pengajuan Baru</h1>
        <p className="text-sm text-gray-500 mt-1">Unit {unit}</p>
      </div>

      {/* Tab */}
      <div className="flex gap-2">
        {(['tahfidz', 'tahsin'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all',
              activeTab === tab
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
            )}
          >
            {tab === 'tahfidz' ? 'Tahfidz' : 'Tahsin'}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {activeTab === 'tahfidz' ? (
          <TahfidzForm unit={unit} />
        ) : (
          <TahsinForm unit={unit} />
        )}
      </div>
    </div>
  )
}
