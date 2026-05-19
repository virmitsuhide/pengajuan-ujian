import { getUserProfile } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNav profile={profile} />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
