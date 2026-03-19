import { createClient } from '@/lib/supabase/server'
import JobBoard from '@/components/jobs/JobBoard'
import Navbar from '@/components/layout/Navbar'

export default async function JobsPage() {
  const supabase = await createClient()

  // Get user if logged in (null if guest)
  const { data: { user } } = await supabase.auth.getUser()

  // Get profile if logged in
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // Fetch all open jobs with category and hirer info
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      category:categories(id, name, slug),
      hirer:profiles!jobs_hirer_id_fkey(id, full_name, org_type, avatar_url)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <Navbar profile={profile} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <JobBoard
          initialJobs={jobs || []}
          categories={categories || []}
          profile={profile}
        />
      </main>
    </div>
  )
}