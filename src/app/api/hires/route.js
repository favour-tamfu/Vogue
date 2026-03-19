import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bid_id, job_id } = await request.json()

  if (!bid_id || !job_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify the job belongs to this hirer
  const { data: job } = await supabase
    .from('jobs')
    .select('hirer_id, status')
    .eq('id', job_id)
    .single()

  if (!job || job.hirer_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  if (job.status !== 'open') {
    return NextResponse.json({ error: 'Job is no longer open' }, { status: 400 })
  }

  // Get the bid and provider
  const { data: bid } = await supabase
    .from('bids')
    .select('provider_id, amount')
    .eq('id', bid_id)
    .single()

  if (!bid) {
    return NextResponse.json({ error: 'Bid not found' }, { status: 404 })
  }

  // Create the hire record
  const { data: hire, error: hireError } = await supabase
    .from('hires')
    .insert({
      job_id,
      bid_id,
      hirer_id:    user.id,
      provider_id: bid.provider_id,
    })
    .select()
    .single()

  if (hireError) {
    return NextResponse.json({ error: hireError.message }, { status: 500 })
  }

  // Update job status to hired
  await supabase
    .from('jobs')
    .update({ status: 'hired' })
    .eq('id', job_id)

  // Update winning bid to accepted
  await supabase
    .from('bids')
    .update({ status: 'accepted' })
    .eq('id', bid_id)

  // Reject all other bids
  await supabase
    .from('bids')
    .update({ status: 'rejected' })
    .eq('job_id', job_id)
    .neq('id', bid_id)

  return NextResponse.json({ hire }, { status: 201 })
}