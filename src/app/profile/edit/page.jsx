import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ProfileEdit from '@/components/profile/ProfileEdit'

export default async function ProfileEditPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  const { data: providerCategories } = await supabase
    .from('provider_categories')
    .select('category_id')
    .eq('provider_id', user.id)

  const selectedCategoryIds = providerCategories?.map(pc => pc.category_id) || []

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <Navbar profile={profile} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        <ProfileEdit
          profile={profile}
          categories={categories || []}
          selectedCategoryIds={selectedCategoryIds}
        />
      </main>
    </div>
  )
}