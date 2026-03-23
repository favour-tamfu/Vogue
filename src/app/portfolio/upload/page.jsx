import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import PortfolioUpload from '@/components/portfolio/PortfolioUpload'

export default async function PortfolioUploadPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Only providers can upload
  if (profile?.role === 'hirer') redirect('/dashboard')

  // Fetch their existing portfolio
  const { data: portfolio } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('provider_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch categories for tagging
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <Navbar profile={profile} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <PortfolioUpload
          profile={profile}
          existingPortfolio={portfolio || []}
          categories={categories || []}
        />
      </main>
    </div>
  )
}