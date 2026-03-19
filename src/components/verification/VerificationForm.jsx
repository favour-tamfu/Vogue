'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Shield, Upload, Link, CheckCircle,
  AlertCircle, ArrowLeft, Clock, X
} from 'lucide-react'

const T = {
  navy:       '#0F172A',
  navyMid:    '#1E293B',
  coral:      '#E8523A',
  coralLight: '#FEF0ED',
  border:     '#E2E8F0',
  bg:         '#F8FAFC',
  textMuted:  '#64748B',
  textLight:  '#94A3B8',
}

export default function VerificationForm({ profile, existingApplication }) {
  const router   = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    website_url:       existingApplication?.website_url       || '',
    social_media_url:  existingApplication?.social_media_url  || '',
    additional_notes:  existingApplication?.additional_notes  || '',
  })
  const [idFile, setIdFile]       = useState(null)
  const [idPreview, setIdPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState(null)
  const [success, setSuccess]     = useState(false)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  // If already submitted
  if (existingApplication?.status === 'pending') {
    return (
      <div>
        <h1 className="text-xl font-semibold mb-6" style={{ color: T.navy }}>
          Verification Status
        </h1>
        <div
          className="border p-6 text-center"
          style={{ background: '#EFF6FF', borderColor: '#BFDBFE', borderRadius: 4 }}
        >
          <Clock size={32} strokeWidth={1} className="text-blue-400 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-blue-900 mb-1">
            Application Under Review
          </h2>
          <p className="text-sm text-blue-700">
            Your verification application was submitted and is currently being reviewed.
            This typically takes 1–2 business days. You'll be notified once a decision is made.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-sm font-medium px-4 py-2 text-white"
            style={{ background: T.coral, borderRadius: 4 }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (existingApplication?.status === 'rejected') {
    return (
      <div>
        <h1 className="text-xl font-semibold mb-6" style={{ color: T.navy }}>
          Verification Status
        </h1>
        <div
          className="border p-6 mb-6"
          style={{ background: '#FFF5F5', borderColor: '#FECACA', borderRadius: 4 }}
        >
          <div className="flex items-start gap-3">
            <X size={18} strokeWidth={1.5} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-red-900 mb-1">
                Application Not Approved
              </h2>
              <p className="text-xs text-red-700">
                {existingApplication.admin_notes || 'Your application was not approved. Please review your submission and reapply.'}
              </p>
            </div>
          </div>
        </div>
        {/* Fall through to show form for reapplication */}
      </div>
    )
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type)) {
      setError('Please upload a JPG, PNG, WebP, or PDF file')
      return
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB')
      return
    }

    setIdFile(file)
    setError(null)

    // Preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setIdPreview(e.target.result)
      reader.readAsDataURL(file)
    } else {
      setIdPreview('pdf')
    }
  }

  const handleSubmit = async () => {
    if (!idFile) {
      setError('Please upload your government ID')
      return
    }
    if (!form.social_media_url && !form.website_url) {
      setError('Please provide at least one social media or website link')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Upload ID to Supabase Storage
      const fileExt  = idFile.name.split('.').pop()
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(fileName, idFile, { upsert: true })

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`)
        setUploading(false)
        return
      }

      // Save application to database
      const { error: dbError } = await supabase
        .from('verification_applications')
        .upsert({
          provider_id:       profile.id,
          government_id_url: uploadData.path,
          website_url:       form.website_url      || null,
          social_media_url:  form.social_media_url || null,
          additional_notes:  form.additional_notes || null,
          status:            'pending',
          updated_at:        new Date().toISOString(),
        })

      if (dbError) {
        setError(`Submission failed: ${dbError.message}`)
        setUploading(false)
        return
      }

      // Update profile verification status
      await supabase
        .from('profiles')
        .update({ verification_status: 'pending' })
        .eq('id', profile.id)

      setSuccess(true)
    } catch (e) {
      setError('Something went wrong — please try again')
    }

    setUploading(false)
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle size={48} strokeWidth={1} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2" style={{ color: T.navy }}>
          Application Submitted
        </h2>
        <p className="text-sm mb-6" style={{ color: T.textMuted }}>
          Your verification application is now under review. We'll notify you within 1–2 business days.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm font-semibold px-6 py-2 text-white"
          style={{ background: T.coral, borderRadius: 4 }}
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70"
        style={{ color: T.textMuted }}
      >
        <ArrowLeft size={14} strokeWidth={1.5} /> Back
      </button>

      <div className="flex items-center gap-3 mb-2">
        <Shield size={20} strokeWidth={1.5} style={{ color: T.coral }} />
        <h1 className="text-xl font-semibold" style={{ color: T.navy }}>
          Get Verified
        </h1>
      </div>
      <p className="text-sm mb-8" style={{ color: T.textMuted }}>
        Verification unlocks bidding on jobs and builds trust with hirers.
        Your documents are reviewed securely and never shared publicly.
      </p>

      <div className="space-y-5">

        {/* What you get */}
        <div
          className="border p-4"
          style={{ borderColor: T.border, borderRadius: 4, background: T.bg }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: T.textLight }}>
            Verified providers get
          </p>
          <div className="space-y-2">
            {[
              'A verified badge on your profile',
              'Access to bid on all open jobs',
              'Higher visibility in search results',
              'Increased trust from hirers',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle size={13} strokeWidth={1.5} style={{ color: T.coral }} />
                <span className="text-sm" style={{ color: T.textMuted }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Government ID Upload */}
        <div
          className="bg-white border p-5"
          style={{ borderColor: T.border, borderRadius: 4 }}
        >
          <div className="flex items-center gap-2 pb-4 mb-4 border-b"
            style={{ borderColor: T.border }}>
            <Upload size={14} strokeWidth={1.5} style={{ color: T.textLight }} />
            <h2 className="text-sm font-semibold" style={{ color: T.navy }}>
              Government ID <span style={{ color: T.coral }}>*</span>
            </h2>
          </div>

          <p className="text-xs mb-4" style={{ color: T.textMuted }}>
            Upload a clear photo of a valid government-issued ID — passport, national ID card, or driver's licence.
          </p>

          {/* Upload area */}
          <label
            className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed cursor-pointer transition-colors hover:bg-slate-50"
            style={{ borderColor: idFile ? T.coral : T.border, borderRadius: 4 }}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {idPreview ? (
              idPreview === 'pdf' ? (
                <div className="text-center">
                  <div
                    className="w-12 h-12 flex items-center justify-center mx-auto mb-2 text-white font-bold text-sm"
                    style={{ background: T.coral, borderRadius: 4 }}
                  >
                    PDF
                  </div>
                  <p className="text-xs font-medium" style={{ color: T.coral }}>{idFile.name}</p>
                  <p className="text-xs mt-1" style={{ color: T.textLight }}>Click to change</p>
                </div>
              ) : (
                <div className="text-center">
                  <img
                    src={idPreview}
                    alt="ID preview"
                    className="max-h-32 max-w-full object-contain mx-auto mb-2 rounded"
                  />
                  <p className="text-xs font-medium" style={{ color: T.coral }}>{idFile.name}</p>
                  <p className="text-xs mt-1" style={{ color: T.textLight }}>Click to change</p>
                </div>
              )
            ) : (
              <div className="text-center">
                <Upload size={24} strokeWidth={1} style={{ color: T.textLight, margin: '0 auto 8px' }} />
                <p className="text-sm font-medium" style={{ color: T.textMuted }}>
                  Click to upload your ID
                </p>
                <p className="text-xs mt-1" style={{ color: T.textLight }}>
                  JPG, PNG, WebP or PDF — max 5MB
                </p>
              </div>
            )}
          </label>
        </div>

        {/* Links */}
        <div
          className="bg-white border p-5"
          style={{ borderColor: T.border, borderRadius: 4 }}
        >
          <div className="flex items-center gap-2 pb-4 mb-4 border-b"
            style={{ borderColor: T.border }}>
            <Link size={14} strokeWidth={1.5} style={{ color: T.textLight }} />
            <h2 className="text-sm font-semibold" style={{ color: T.navy }}>
              Online Presence <span style={{ color: T.coral }}>*</span>
            </h2>
          </div>

          <p className="text-xs mb-4" style={{ color: T.textMuted }}>
            Provide at least one link so we can verify your professional work.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5"
                style={{ color: T.navyMid }}>
                Website URL
              </label>
              <input
                type="url"
                value={form.website_url}
                onChange={e => update('website_url', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-3 py-2.5 text-sm border outline-none"
                style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                onFocus={e => e.target.style.borderColor = T.navy}
                onBlur={e => e.target.style.borderColor = T.border}
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5"
                style={{ color: T.navyMid }}>
                Social Media Profile
              </label>
              <input
                type="url"
                value={form.social_media_url}
                onChange={e => update('social_media_url', e.target.value)}
                placeholder="https://instagram.com/yourprofile"
                className="w-full px-3 py-2.5 text-sm border outline-none"
                style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                onFocus={e => e.target.style.borderColor = T.navy}
                onBlur={e => e.target.style.borderColor = T.border}
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5"
                style={{ color: T.navyMid }}>
                Additional Notes
                <span className="font-normal ml-1" style={{ color: T.textLight }}>
                  — Optional
                </span>
              </label>
              <textarea
                value={form.additional_notes}
                onChange={e => update('additional_notes', e.target.value)}
                placeholder="Any additional context about your professional background..."
                rows={3}
                className="w-full px-3 py-2.5 text-sm border outline-none resize-none"
                style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                onFocus={e => e.target.style.borderColor = T.navy}
                onBlur={e => e.target.style.borderColor = T.border}
              />
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <div
          className="border p-4"
          style={{ borderColor: T.border, borderRadius: 4, background: T.bg }}
        >
          <p className="text-xs leading-relaxed" style={{ color: T.textLight }}>
            🔒 Your documents are stored securely and only accessible to Vogue Events administrators.
            They will never be shared publicly or with hirers.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2 p-3 border text-sm"
            style={{ borderColor: '#FECACA', background: '#FFF5F5', borderRadius: 4, color: '#DC2626' }}
          >
            <AlertCircle size={14} strokeWidth={1.5} />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: T.coral, borderRadius: 4 }}
        >
          <Shield size={15} strokeWidth={2} />
          {uploading ? 'Submitting...' : 'Submit Verification Application'}
        </button>

      </div>
    </div>
  )
}