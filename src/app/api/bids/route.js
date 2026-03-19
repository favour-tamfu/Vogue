import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { job_id, amount, pitch } = body

  if (!job_id || !amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check provider is verified
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verified, role')
    .eq('id', user.id)
    .single()

  if (!profile?.is_verified) {
    return NextResponse.json({ error: 'You must be verified to bid' }, { status: 403 })
  }

  if (profile.role === 'hirer') {
    return NextResponse.json({ error: 'Hirers cannot place bids' }, { status: 403 })
  }

  // Check job is still open
  const { data: job } = await supabase
    .from('jobs')
    .select('status, hirer_id')
    .eq('id', job_id)
    .single()

  if (!job || job.status !== 'open') {
    return NextResponse.json({ error: 'This job is no longer open' }, { status: 400 })
  }

  if (job.hirer_id === user.id) {
    return NextResponse.json({ error: 'You cannot bid on your own job' }, { status: 400 })
  }

  // Insert bid
  const { data, error } = await supabase
    .from('bids')
    .insert({
      job_id,
      provider_id: user.id,
      amount:      parseInt(amount),
      pitch:       pitch || null,
      availability_confirmed: true,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You have already bid on this job' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bid: data }, { status: 201 })
}