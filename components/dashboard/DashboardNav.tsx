'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import type { UserProfile } from '@/lib/types'
import { cn, getUnitColor } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import {
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  LogOut,
  BookOpen,
} from 'lucide-react'

const navLinks = [
  { href: '/dashboard', label: 'Ringkasan', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/submit', label: 'Ajukan', icon: PlusCircle, exact: false },
  { href: '/dashboard/submissions', label: 'Kelola', icon: ListChecks, exact: false },
]

export function DashboardNav({ profile }: { profile: UserProfile }) {
  const pathname = usePathname()

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{profile.username}</p>
              <Badge className={cn('text-xs', getUnitColor(profile.unit))}>
                Koordinator {profile.unit}
              </Badge>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </form>
        </div>
      </header>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-10 sm:hidden">
        <div className="flex">
          {navLinks.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
                  active ? 'text-emerald-600' : 'text-gray-400'
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Top tabs (desktop) */}
      <nav className="hidden sm:block bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 flex gap-1">
          {navLinks.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  active
                    ? 'border-emerald-500 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
