import { getUserProfile } from '@/lib/actions/auth'
import { listGuru } from '@/lib/actions/users'
import { redirect } from 'next/navigation'
import { GuruClient } from '@/components/dashboard/GuruClient'

export default async function GuruPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')
  if (profile.role !== 'koordinator') redirect('/dashboard')

  const guruList = await listGuru()

  return (
    <div className="pb-24 sm:pb-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Kelola Guru</h1>
        <p className="text-sm text-gray-500 mt-1">
          Unit {profile.unit} · {guruList.length} akun guru
        </p>
      </div>

      <GuruClient guruList={guruList} unit={profile.unit} />
    </div>
  )
}
