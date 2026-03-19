import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function POST(request) {
  // Check admin cookie
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')

  if (!session || session.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { application_id, provider_id, decision, admin_notes } = await request.json()

  if (!application_id || !provider_id || !decision) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const isApproved = decision === 'approved'

  await supabase
    .from('verification_applications')
    .update({
      status:      decision,
      admin_notes: admin_notes || null,
      reviewed_at: new Date().toISOString(),
      updated_at:  new Date().toISOString(),
    })
    .eq('id', application_id)

  await supabase
    .from('profiles')
    .update({
      is_verified:         isApproved,
      verification_status: decision,
    })
    .eq('id', provider_id)

  return NextResponse.json({ success: true })
}