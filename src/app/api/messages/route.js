import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { conversation_id, content } = await request.json()

  if (!conversation_id || !content?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify user is a participant
  const { data: convo } = await supabase
    .from('conversations')
    .select('hirer_id, provider_id')
    .eq('id', conversation_id)
    .single()

  if (!convo || (convo.hirer_id !== user.id && convo.provider_id !== user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id,
      sender_id: user.id,
      content:   content.trim(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: data }, { status: 201 })
}