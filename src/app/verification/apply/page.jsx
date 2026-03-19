import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import VerificationForm from '@/components/verification/VerificationForm'

export default async function VerificationApplyPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Redirect if already verified
  if (profile?.is_verified) redirect('/dashboard')

  // Check for existing application
  const { data: application } = await supabase
    .from('verification_applications')
    .select('*')
    .eq('provider_id', user.id)
    .single()

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <Navbar profile={profile} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        <VerificationForm
          profile={profile}
          existingApplication={application}
        />
      </main>
    </div>
  )
}