import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import ProviderBrowse from '@/components/providers/ProviderBrowse'

export default async function ProvidersPage() {
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

  // Fetch all verified providers
  const { data: providers } = await supabase
    .from('profiles')
    .select(`
      id, full_name, avatar_url, location, bio,
      years_experience, completed_events, average_rating,
      is_verified, verification_status, role,
      provider_categories(
        category:categories(id, name, slug)
      )
    `)
    .in('role', ['provider', 'both'])
    .eq('is_verified', true)
    .order('average_rating', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <Navbar profile={currentUser} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <ProviderBrowse
          providers={providers || []}
          categories={categories || []}
        />
      </main>
    </div>
  )
}