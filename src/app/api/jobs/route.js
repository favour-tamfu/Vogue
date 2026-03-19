import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const { title, event_type, event_date, location, budget_max } = body
  if (!title || !event_type || !event_date || !location || !budget_max) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      hirer_id:       user.id,
      title,
      description:    body.description    || null,
      event_type:     body.event_type,
      category_id:    body.category_id    || null,
      event_date:     body.event_date,
      event_time:     body.event_time     || null,
      location:       body.location,
      budget_min:     body.budget_min     || null,
      budget_max:     body.budget_max,
      currency:       body.currency       || 'USD',
      headcount:      body.headcount      || null,
      duration_hours: body.duration_hours || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ job: data }, { status: 201 })
}