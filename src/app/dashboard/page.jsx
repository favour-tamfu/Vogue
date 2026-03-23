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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.location && !profile?.is_admin) redirect('/onboarding')

  // ── SHARED ──────────────────────────────────────────

  // Unread message count
  const { data: conversations } = await supabase
    .from('conversations')
    .select('hirer_unread, provider_unread, hirer_id, provider_id')
    .or(`hirer_id.eq.${user.id},provider_id.eq.${user.id}`)

  const unreadMessages = (conversations || []).reduce((total, c) => {
    if (c.hirer_id === user.id)    return total + (c.hirer_unread || 0)
    if (c.provider_id === user.id) return total + (c.provider_unread || 0)
    return total
  }, 0)

  // Pending reviews
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: pendingReviewsRaw } = await supabase
    .from('hires')
    .select(`
      *,
      job:jobs(id, title, event_date, location),
      hirer:profiles!hires_hirer_id_fkey(id, full_name),
      provider:profiles!hires_provider_id_fkey(id, full_name)
    `)
    .or(`hirer_id.eq.${user.id},provider_id.eq.${user.id}`)
    .eq('status', 'confirmed')

  const pendingReviews = (pendingReviewsRaw || []).filter(hire => {
    if (!hire.job?.event_date) return false
    const eventDate = new Date(hire.job.event_date)
    eventDate.setHours(0, 0, 0, 0)
    if (eventDate > today) return false
    if (hire.hirer_id === user.id)    return !hire.hirer_reviewed
    if (hire.provider_id === user.id) return !hire.provider_reviewed
    return false
  })

  // ── HIRER DATA ───────────────────────────────────────

  // My jobs with bid count
  const { data: myJobs } = await supabase
    .from('jobs')
    .select(`
      *,
      category:categories(name)
    `)
    .eq('hirer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Recent bids on my jobs
  const { data: recentBids } = await supabase
    .from('bids')
    .select(`
      *,
      provider:profiles!bids_provider_id_fkey(
        id, full_name, avatar_url, is_verified,
        average_rating, completed_events
      ),
      job:jobs(id, title)
    `)
    .in('job_id', myJobs?.map(j => j.id) || ['none'])
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  // Hirer stats
  const { count: jobsPosted } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('hirer_id', user.id)

  const { count: hiresMade } = await supabase
    .from('hires')
    .select('*', { count: 'exact', head: true })
    .eq('hirer_id', user.id)

  const { count: reviewsGiven } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('reviewer_id', user.id)
    .eq('reviewer_role', 'hirer')

  const totalBidsReceived = myJobs?.reduce((sum, j) => sum + (j.bids_count || 0), 0) || 0

  // Feed items for hirer
  const { data: feedProviders } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, location, created_at, provider_categories(category:categories(name))')
    .in('role', ['provider', 'both'])
    .eq('is_verified', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: feedJobs } = await supabase
    .from('jobs')
    .select(`
      id, title, event_type, location, created_at, bids_count,
      category:categories(name),
      hirer:profiles!jobs_hirer_id_fkey(full_name)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: feedReviews } = await supabase
    .from('reviews')
    .select(`
      id, rating, created_at,
      reviewer:profiles!reviews_reviewer_id_fkey(full_name),
      reviewee:profiles!reviews_reviewee_id_fkey(id, full_name)
    `)
    .eq('reviewer_role', 'hirer')
    .order('created_at', { ascending: false })
    .limit(3)

  const feedItems = [
    ...(feedProviders || []).map(p => ({ type: 'new_provider', id: `p-${p.id}`, data: p, date: p.created_at })),
    ...(feedJobs || []).map(j => ({ type: 'new_job', id: `j-${j.id}`, data: j, date: j.created_at })),
    ...(feedReviews || []).map(r => ({ type: 'review', id: `r-${r.id}`, data: r, date: r.created_at })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)

  // ── PROVIDER DATA ────────────────────────────────────

  // Recent open jobs for provider
  const { data: recentJobs } = await supabase
    .from('jobs')
    .select(`
      *,
      category:categories(id, name)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(5)

  // Provider stats
  const { count: bidsSent } = await supabase
    .from('bids')
    .select('*', { count: 'exact', head: true })
    .eq('provider_id', user.id)

  const { count: jobsWon } = await supabase
    .from('hires')
    .select('*', { count: 'exact', head: true })
    .eq('provider_id', user.id)

  // Top providers for sidebar
  const { data: topProviders } = await supabase
    .from('profiles')
    .select(`
      id, full_name, average_rating, completed_events,
      provider_categories(category:categories(name))
    `)
    .in('role', ['provider', 'both'])
    .eq('is_verified', true)
    .order('average_rating', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <Navbar profile={profile} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        {profile.role === 'both' ? (
          <BothView
            profile={profile}
            recentJobs={recentJobs || []}
            myJobs={myJobs || []}
            pendingReviews={pendingReviews}
            recentBids={recentBids || []}
            feedItems={feedItems}
            unreadMessages={unreadMessages}
            hirerStats={{ jobsPosted, totalBidsReceived, hiresMade, reviewsGiven }}
            providerStats={{ bidsSent, jobsWon }}
            topProviders={topProviders || []}
          />
        ) : profile.role === 'provider' ? (
          <ProviderView
            profile={profile}
            recentJobs={recentJobs || []}
            pendingReviews={pendingReviews}
            providerStats={{ bidsSent, jobsWon }}
            unreadMessages={unreadMessages}
            topProviders={topProviders || []}
          />
        ) : (
          <HirerView
            profile={profile}
            myJobs={myJobs || []}
            pendingReviews={pendingReviews}
            recentBids={recentBids || []}
            feedItems={feedItems}
            unreadMessages={unreadMessages}
            hirerStats={{ jobsPosted, totalBidsReceived, hiresMade, reviewsGiven }}
            topProviders={topProviders || []}
          />
        )}
      </main>
    </div>
  )
}