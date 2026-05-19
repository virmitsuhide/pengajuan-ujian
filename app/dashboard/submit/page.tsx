import { getUserProfile } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { SubmitPageClient } from '@/components/forms/SubmitPageClient'

export default async function SubmitPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/login')

  return <SubmitPageClient unit={profile.unit} />
}
