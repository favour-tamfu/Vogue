import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import JobDetail from '@/components/jobs/JobDetail'

export default async function JobPage({ params, searchParams }) {
  // Next.js 15 — await both params and searchParams
  const { id }       = await params
  const { posted }   = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  const { data: job } = await supabase
    .from('jobs')
    .select(`
      *,
      category:categories(id, name, slug),
      hirer:profiles!jobs_hirer_id_fkey(
        id, full_name, avatar_url, org_type,
        location, completed_events, average_rating
      )
    `)
    .eq('id', id)
    .single()

  if (!job) notFound()

  let bids = []
  if (user) {
    const { data } = await supabase
      .from('bids')
      .select(`
        *,
        provider:profiles!bids_provider_id_fkey(
          id, full_name, avatar_url, location,
          bio, years_experience, completed_events, average_rating,
          is_verified, verification_status
        )
      `)
      .eq('job_id', id)
      .order('created_at', { ascending: false })
    bids = data || []
  }

  const myBid = bids.find(b => b.provider_id === user?.id) || null

  const { data: hire } = user ? await supabase
    .from('hires')
    .select('*')
    .eq('job_id', id)
    .single() : { data: null }

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <Navbar profile={profile} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <JobDetail
          job={job}
          bids={bids}
          myBid={myBid}
          hire={hire}
          profile={profile}
          justPosted={posted === 'true'}
        />
      </main>
    </div>
  )
}