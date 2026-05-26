'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { List, BarChart2 } from 'lucide-react'

interface PublicHeaderProps {
  badge?: React.ReactNode
}

export function PublicHeader({ badge }: PublicHeaderProps) {
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div className="max-w-2xl mx-auto px-4">
        {/* Top row */}
        <div className="flex items-center justify-between py-3">
          <div>
            <h1 className="text-base font-bold text-gray-900">Tahsin & Tahfidz</h1>
            <p className="text-xs text-gray-400">SMPIT & SDIT LHI</p>
          </div>
          <div className="flex items-center gap-3">
            {badge}
            <Link
              href="/login"
              className="text-xs text-gray-400 hover:text-gray-600 font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 -mb-px">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              pathname === '/'
                ? 'border-emerald-500 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <List className="w-4 h-4" />
            Antrian Ujian
          </Link>
          <Link
            href="/rekap"
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              pathname === '/rekap'
                ? 'border-emerald-500 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <BarChart2 className="w-4 h-4" />
            Rekap Hasil
          </Link>
        </div>
      </div>
    </header>
  )
}
