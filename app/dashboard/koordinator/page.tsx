import { getUserProfile } from '@/lib/actions/auth'
import { listKoordinator } from '@/lib/actions/users'
import { redirect } from 'next/navigation'
import { KoordinatorClient } from '@/components/dashboard/KoordinatorClient'

export default async function KoordinatorPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')
  if (profile.role !== 'admin') redirect('/dashboard')

  const koordinatorList = await listKoordinator()

  return (
    <div className="pb-24 sm:pb-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Kelola Koordinator</h1>
        <p className="text-sm text-gray-500 mt-1">
          {koordinatorList.length} akun koordinator terdaftar
        </p>
      </div>

      <KoordinatorClient koordinatorList={koordinatorList} />
    </div>
  )
}
