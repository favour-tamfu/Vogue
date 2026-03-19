import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { hire_id, rating, comment, reviewer_role } = await request.json()

  if (!hire_id || !rating || !reviewer_role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  // Get hire details
  const { data: hire } = await supabase
    .from('hires')
    .select('*, job:jobs(event_date)')
    .eq('id', hire_id)
    .single()

  if (!hire) {
    return NextResponse.json({ error: 'Hire not found' }, { status: 404 })
  }

  // Verify user is part of this hire
  if (hire.hirer_id !== user.id && hire.provider_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Check event date has passed
  const eventDate = new Date(hire.job.event_date)
  if (eventDate > new Date()) {
    return NextResponse.json({ error: 'Cannot review before the event date' }, { status: 400 })
  }

  // Determine reviewee
  const reviewee_id = reviewer_role === 'hirer'
    ? hire.provider_id
    : hire.hirer_id

  // Insert review
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      hire_id,
      reviewer_id:   user.id,
      reviewee_id,
      rating,
      comment:       comment || null,
      reviewer_role,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You have already reviewed this hire' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Mark review as done on hire record
  const updateField = reviewer_role === 'hirer'
    ? { hirer_reviewed: true }
    : { provider_reviewed: true }

  await supabase
    .from('hires')
    .update(updateField)
    .eq('id', hire_id)

  return NextResponse.json({ review: data }, { status: 201 })
}