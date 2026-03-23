import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ProviderProfile from '@/components/providers/ProviderProfile'

export default async function ProviderProfilePage({ params }) {
  const { id } = await params
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

  // Fetch provider profile
  const { data: provider } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!provider) notFound()

  // Fetch their service categories
  const { data: categories } = await supabase
    .from('provider_categories')
    .select('category:categories(id, name, slug)')
    .eq('provider_id', id)

  // Fetch their portfolio items
  const { data: portfolio } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('provider_id', id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // Fetch their reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey(
        id, full_name, avatar_url, org_type
      )
    `)
    .eq('reviewee_id', id)
    .eq('reviewer_role', 'hirer')
    .order('created_at', { ascending: false })

  // Check if current user follows this provider
  let isFollowing = false
  if (user) {
    const { data: follow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', id)
      .single()
    isFollowing = !!follow
  }

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <Navbar profile={currentUser} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <ProviderProfile
          provider={provider}
          categories={categories?.map(c => c.category) || []}
          portfolio={portfolio || []}
          reviews={reviews || []}
          currentUser={currentUser}
          isFollowing={isFollowing}
        />
      </main>
    </div>
  )
}