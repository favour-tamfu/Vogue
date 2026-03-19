import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Inbox from '@/components/messages/Inbox'

export default async function MessagesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch all conversations with job and other party info
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      job:jobs(id, title, status, event_type),
      hirer:profiles!conversations_hirer_id_fkey(
        id, full_name, avatar_url
      ),
      provider:profiles!conversations_provider_id_fkey(
        id, full_name, avatar_url
      )
    `)
    .or(`hirer_id.eq.${user.id},provider_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <Navbar profile={profile} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <Inbox
          conversations={conversations || []}
          currentUser={profile}
        />
      </main>
    </div>
  )
}