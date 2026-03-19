import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import HirerView from '@/components/dashboard/HirerView'
import ProviderView from '@/components/dashboard/ProviderView'
import BothView from '@/components/dashboard/BothView'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    return (
      <div className="min-h-screen p-8" style={{ background: '#F8FAFC' }}>
        <div className="max-w-xl">
          <h1 className="text-xl font-semibold mb-2">Failed to load profile</h1>
          <p className="text-sm text-slate-600 mb-4">Supabase error: {profileError.message}</p>
          <p className="text-sm text-slate-600">Try finishing onboarding, then refresh the page.</p>
        </div>
      </div>
    )
  }

  if (!profile) redirect('/onboarding')
  if (!profile?.location && !profile?.is_admin) redirect('/onboarding')

  // Fetch recent open jobs for provider dashboard
  const { data: recentJobs } = await supabase
    .from('jobs')
    .select(`*, category:categories(id, name)`)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch hirer's own jobs
  const { data: myJobs } = await supabase
    .from('jobs')
    .select('*, category:categories(name)')
    .eq('hirer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch hires where event date has passed
  const { data: pendingReviews } = await supabase
    .from('hires')
    .select(`
      *,
      job:jobs(id, title, event_date, location),
      hirer:profiles!hires_hirer_id_fkey(id, full_name),
      provider:profiles!hires_provider_id_fkey(id, full_name)
    `)
    .or(`hirer_id.eq.${user.id},provider_id.eq.${user.id}`)
    .eq('status', 'confirmed')

  // Filter in JavaScript instead — Supabase can't filter on joined columns
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const reviewsNeeded = (pendingReviews || []).filter(hire => {
    if (!hire.job?.event_date) return false

    const eventDate = new Date(hire.job.event_date)
    eventDate.setHours(0, 0, 0, 0)

    // Event date must be today or in the past
    if (eventDate > today) return false

    // Check this user hasn't reviewed yet
    if (hire.hirer_id === user.id)    return !hire.hirer_reviewed
    if (hire.provider_id === user.id) return !hire.provider_reviewed
    return false
  })

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <Navbar profile={profile} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        {profile.role === 'both' ? (
          <BothView
            profile={profile}
            recentJobs={recentJobs || []}
            myJobs={myJobs || []}
            pendingReviews={reviewsNeeded}
          />
        ) : profile.role === 'provider' ? (
          <ProviderView
            profile={profile}
            recentJobs={recentJobs || []}
            pendingReviews={reviewsNeeded}
          />
        ) : (
          <HirerView
            profile={profile}
            myJobs={myJobs || []}
            pendingReviews={reviewsNeeded}
          />
        )}
      </main>
    </div>
  )
}