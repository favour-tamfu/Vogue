import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Feed from '@/components/feed/Feed'

export default async function FeedPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let currentUser = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    currentUser = data
  }

  // Fetch new verified providers (joined in last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: newProviders } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, location, bio, created_at, provider_categories(category:categories(name))')
    .in('role', ['provider', 'both'])
    .eq('is_verified', true)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch recent open jobs
  const { data: recentJobs } = await supabase
    .from('jobs')
    .select(`
      id, title, event_type, location, budget_max,
      budget_min, currency, created_at, bids_count,
      category:categories(name),
      hirer:profiles!jobs_hirer_id_fkey(id, full_name)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch completed hires with reviews
  const { data: completedHires } = await supabase
    .from('reviews')
    .select(`
      id, rating, comment, created_at,
      reviewer:profiles!reviews_reviewer_id_fkey(id, full_name),
      reviewee:profiles!reviews_reviewee_id_fkey(id, full_name),
      hire:hires(job:jobs(title, event_type))
    `)
    .eq('reviewer_role', 'hirer')
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch recent portfolio uploads
  const { data: portfolioItems } = await supabase
    .from('portfolio_items')
    .select(`
      id, title, image_url, event_type, created_at, likes_count,
      provider:profiles!portfolio_items_provider_id_fkey(
        id, full_name, avatar_url
      )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch saves if logged in
  let savedIds = []
  if (user) {
    const { data: saves } = await supabase
      .from('saves')
      .select('portfolio_item_id')
      .eq('user_id', user.id)
    savedIds = saves?.map(s => s.portfolio_item_id) || []
  }

  // Merge and sort all feed items by date
  const feedItems = [
    ...(newProviders || []).map(p => ({
      type: 'new_provider',
      id:   `provider-${p.id}`,
      data: p,
      date: p.created_at,
    })),
    ...(recentJobs || []).map(j => ({
      type: 'new_job',
      id:   `job-${j.id}`,
      data: j,
      date: j.created_at,
    })),
    ...(completedHires || []).map(r => ({
      type: 'review',
      id:   `review-${r.id}`,
      data: r,
      date: r.created_at,
    })),
    ...(portfolioItems || []).map(p => ({
      type: 'portfolio',
      id:   `portfolio-${p.id}`,
      data: p,
      date: p.created_at,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  // Fetch user's likes
    let likedIds = []
    if (user) {
    const { data: likes } = await supabase
        .from('feed_likes')
        .select('item_id')
        .eq('user_id', user.id)
    likedIds = likes?.map(l => l.item_id) || []
    }

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <Navbar profile={currentUser} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        <Feed
          feedItems={feedItems}
          currentUser={currentUser}
          savedIds={savedIds}
          likedIds={likedIds}
        />
      </main>
    </div>
  )
}