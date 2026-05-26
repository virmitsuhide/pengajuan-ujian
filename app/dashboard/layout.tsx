import { getUserProfile } from '@/lib/actions/auth'
import { getUnseenCount } from '@/lib/actions/notifications'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  const unseenCount = (profile.role === 'koordinator' || profile.role === 'admin') ? await getUnseenCount() : 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNav profile={profile} unseenCount={unseenCount} />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
