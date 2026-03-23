import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import MyBids from '@/components/bids/MyBids'

export default async function MyBidsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'hirer') redirect('/dashboard')

  const { data: bids } = await supabase
    .from('bids')
    .select(`
      *,
      job:jobs(
        id, title, event_type, location, event_date,
        budget_min, budget_max, currency, status, bids_count,
        category:categories(name),
        hirer:profiles!jobs_hirer_id_fkey(
          id, full_name, avatar_url, org_type, average_rating
        )
      )
    `)
    .eq('provider_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <Navbar profile={profile} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <MyBids bids={bids || []} profile={profile} />
      </main>
    </div>
  )
}