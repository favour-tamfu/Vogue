import { createClient } from '@supabase/supabase-js'
import AdminDashboard from '@/components/admin/AdminDashboard'

// Service role client — bypasses RLS, only used server-side
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export default async function AdminPage() {
  const supabase = createAdminClient()

  const { data: applications } = await supabase
    .from('verification_applications')
    .select(`
      *,
      provider:profiles!verification_applications_provider_id_fkey(
        id, full_name, location, bio,
        years_experience, role, avatar_url,
        completed_events, average_rating
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <AdminDashboard
      applications={applications || []}
      adminName="Admin"
    />
  )
}