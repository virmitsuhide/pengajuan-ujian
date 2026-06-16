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
  Users,
  History,
} from 'lucide-react'

export function DashboardNav({ profile, unseenCount }: { profile: UserProfile; unseenCount: number }) {
  const pathname = usePathname()
  const isKoordinator = profile.role === 'koordinator'
  const isAdmin = profile.role === 'admin'

  const navLinks = [
    { href: '/dashboard', label: 'Ringkasan', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/submit', label: 'Ajukan', icon: PlusCircle, exact: false },
    { href: '/dashboard/submissions', label: 'Kelola', icon: ListChecks, exact: false },
    ...(isKoordinator || isAdmin
      ? [{ href: '/dashboard/riwayat', label: 'Riwayat', icon: History, exact: false }]
      : []),
    ...(isKoordinator || isAdmin
      ? [{ href: '/dashboard/guru', label: 'Guru', icon: Users, exact: false }]
      : []),
    ...(isAdmin
      ? [{ href: '/dashboard/koordinator', label: 'Koordinator', icon: Users, exact: false }]
      : []),
  ]

  const guruUnitLabel = profile.unit === 'SD' ? 'SDIT LHI' : 'SMPIT LHI'
  const roleLabel = isAdmin
    ? 'Administrator'
    : isKoordinator
    ? `Koordinator ${profile.unit}`
    : `Guru Qur'an RQ unit ${guruUnitLabel}`
  const roleBadgeClass = isAdmin
    ? 'bg-red-100 text-red-800 border border-red-200'
    : isKoordinator
    ? getUnitColor(profile.unit!)
    : 'bg-violet-100 text-violet-800 border border-violet-200'

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
              <Badge className={cn('text-xs', roleBadgeClass)}>{roleLabel}</Badge>
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
            const showBadge = href === '/dashboard/submissions' && unseenCount > 0
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
                  active ? 'text-emerald-600' : 'text-gray-400'
                )}
              >
                <span className="relative">
                  <Icon className="w-5 h-5" />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {unseenCount > 99 ? '99+' : unseenCount}
                    </span>
                  )}
                </span>
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
            const showBadge = href === '/dashboard/submissions' && unseenCount > 0
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
                {showBadge && (
                  <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unseenCount > 99 ? '99+' : unseenCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
