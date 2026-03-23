import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import MyJobs from '@/components/jobs/MyJobs'

export default async function MyJobsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'provider') redirect('/dashboard')

  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      category:categories(id, name),
      bids(
        id, amount, status,
        provider:profiles!bids_provider_id_fkey(
          id, full_name, is_verified, average_rating
        )
      )
    `)
    .eq('hirer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <Navbar profile={profile} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <MyJobs jobs={jobs || []} profile={profile} />
      </main>
    </div>
  )
}