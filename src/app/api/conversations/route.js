import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { job_id, provider_id, hirer_id } = await request.json()

  if (!job_id || !provider_id || !hirer_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check if conversation already exists
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('job_id', job_id)
    .eq('provider_id', provider_id)
    .single()

  if (existing) {
    return NextResponse.json({ conversation: existing }, { status: 200 })
  }

  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({ job_id, hirer_id, provider_id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ conversation: data }, { status: 201 })
}