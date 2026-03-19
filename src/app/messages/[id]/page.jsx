import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Conversation from '@/components/messages/Conversation'

export default async function ConversationPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch conversation with all related data
  const { data: conversation } = await supabase
    .from('conversations')
    .select(`
      *,
      job:jobs(id, title, status, event_type, location, budget_max, currency),
      hirer:profiles!conversations_hirer_id_fkey(
        id, full_name, avatar_url, org_type
      ),
      provider:profiles!conversations_provider_id_fkey(
        id, full_name, avatar_url, is_verified
      )
    `)
    .eq('id', id)
    .single()

  if (!conversation) notFound()

  // Verify user is a participant
  if (conversation.hirer_id !== user.id && conversation.provider_id !== user.id) {
    redirect('/messages')
  }

  // Fetch messages
  const { data: messages } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
    `)
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  // Mark messages as read
  const isHirer = conversation.hirer_id === user.id
  if (isHirer && conversation.hirer_unread > 0) {
    await supabase
      .from('conversations')
      .update({ hirer_unread: 0 })
      .eq('id', id)
  } else if (!isHirer && conversation.provider_unread > 0) {
    await supabase
      .from('conversations')
      .update({ provider_unread: 0 })
      .eq('id', id)
  }

  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', id)
    .neq('sender_id', user.id)

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <Navbar profile={profile} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <Conversation
          conversation={conversation}
          initialMessages={messages || []}
          currentUser={profile}
        />
      </main>
    </div>
  )
}