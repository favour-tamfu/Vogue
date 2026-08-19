'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Shield, Upload, Link as LinkIcon, CheckCircle,
  AlertCircle, ArrowLeft, Clock, X
} from 'lucide-react'
import { PRODUCT_NAME } from '@/lib/brand'

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

  const wasRejected = existingApplication?.status === 'rejected'

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
    } catch {
      setError('Something went wrong — please try again')
    }

    setUploading(false)
  }

  // Already submitted and awaiting a decision — nothing to do but wait.
  if (existingApplication?.status === 'pending') {
    return (
      <div>
        <h1 className="t-h1 mb-6 text-ink">
          Verification Status
        </h1>
        <div className="border border-line rounded-md p-6 text-center bg-cream-2">
          <Clock size={32} strokeWidth={1} className="text-ink-2 mx-auto mb-3" />
          <h2 className="t-h2 text-ink mb-1">
            Application Under Review
          </h2>
          <p className="text-sm text-ink-2">
            Your verification application was submitted and is currently being reviewed.
            This typically takes 1–2 business days. You&apos;ll be notified once a decision is made.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-sm font-medium px-4 py-2 text-white rounded-sm bg-terracotta
                       transition-colors hover:bg-terracotta-deep"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle size={48} strokeWidth={1} className="text-verified mx-auto mb-4" />
        <h2 className="t-h1 mb-2 text-ink">
          Application Submitted
        </h2>
        <p className="text-sm mb-6 text-ink-2">
          Your verification application is now under review. We&apos;ll notify you within 1–2 business days.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm font-semibold px-6 py-2 text-white rounded-sm bg-terracotta
                     transition-colors hover:bg-terracotta-deep"
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
        className="flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70 text-ink-2"
      >
        <ArrowLeft size={14} strokeWidth={1.5} /> Back
      </button>

      {/* A rejected application falls through to the form so the provider can
          correct their submission and reapply. */}
      {wasRejected && (
        <div className="border border-danger-bg rounded-md p-6 mb-6 bg-danger-bg">
          <div className="flex items-start gap-3">
            <X size={18} strokeWidth={1.5} className="text-danger flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="t-h3 text-danger mb-1">
                Application Not Approved
              </h2>
              <p className="text-xs text-danger">
                {existingApplication.admin_notes || 'Your application was not approved. Please review your submission and reapply.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-2">
        <Shield size={20} strokeWidth={1.5} className="text-terracotta" />
        <h1 className="t-h1 text-ink">
          {wasRejected ? 'Reapply for Verification' : 'Get Verified'}
        </h1>
      </div>
      <p className="text-sm mb-8 text-ink-2">
        Verification unlocks bidding on jobs and builds trust with hirers.
        Your documents are reviewed securely and never shared publicly.
      </p>

      <div className="space-y-5">

        {/* What you get */}
        <div className="border border-line rounded-md p-4 bg-cream">
          <p className="t-micro mb-3 text-ink-3">
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
                <CheckCircle size={13} strokeWidth={1.5} className="text-terracotta" />
                <span className="text-sm text-ink-2">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Government ID Upload */}
        <div className="bg-surface border border-line rounded-md p-5">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-line">
            <Upload size={14} strokeWidth={1.5} className="text-ink-3" />
            <h2 className="t-h3 text-ink">
              Government ID <span className="text-terracotta">*</span>
            </h2>
          </div>

          <p className="text-xs mb-4 text-ink-2">
            Upload a clear photo of a valid government-issued ID — passport, national ID card, or driver&apos;s licence.
          </p>

          {/* Upload area */}
          <label
            className={`flex flex-col items-center justify-center w-full py-8 border-2 border-dashed
                        rounded-xs cursor-pointer transition-colors hover:bg-cream ${
              idFile ? 'border-terracotta' : 'border-line'
            }`}
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
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-2 text-white
                                  font-bold text-sm rounded-xs bg-terracotta">
                    PDF
                  </div>
                  <p className="text-xs font-medium text-terracotta">{idFile.name}</p>
                  <p className="text-xs mt-1 text-ink-3">Click to change</p>
                </div>
              ) : (
                <div className="text-center">
                  <img
                    src={idPreview}
                    alt="ID preview"
                    className="max-h-32 max-w-full object-contain mx-auto mb-2 rounded-xs"
                  />
                  <p className="text-xs font-medium text-terracotta">{idFile.name}</p>
                  <p className="text-xs mt-1 text-ink-3">Click to change</p>
                </div>
              )
            ) : (
              <div className="text-center">
                <Upload size={24} strokeWidth={1} className="text-ink-3 mx-auto mb-2" />
                <p className="text-sm font-medium text-ink-2">
                  Click to upload your ID
                </p>
                <p className="text-xs mt-1 text-ink-3">
                  JPG, PNG, WebP or PDF — max 5MB
                </p>
              </div>
            )}
          </label>
        </div>

        {/* Links */}
        <div className="bg-surface border border-line rounded-md p-5">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-line">
            <LinkIcon size={14} strokeWidth={1.5} className="text-ink-3" />
            <h2 className="t-h3 text-ink">
              Online Presence <span className="text-terracotta">*</span>
            </h2>
          </div>

          <p className="text-xs mb-4 text-ink-2">
            Provide at least one link so we can verify your professional work.
          </p>

          <div className="space-y-4">
            <div>
              <label className="t-label block mb-1.5 text-ink-2">
                Website URL
              </label>
              <input
                type="url"
                value={form.website_url}
                onChange={e => update('website_url', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none text-ink
                           placeholder:text-ink-3 focus:border-terracotta transition-colors"
              />
            </div>

            <div>
              <label className="t-label block mb-1.5 text-ink-2">
                Social Media Profile
              </label>
              <input
                type="url"
                value={form.social_media_url}
                onChange={e => update('social_media_url', e.target.value)}
                placeholder="https://instagram.com/yourprofile"
                className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none text-ink
                           placeholder:text-ink-3 focus:border-terracotta transition-colors"
              />
            </div>

            <div>
              <label className="t-label block mb-1.5 text-ink-2">
                Additional Notes
                <span className="font-normal ml-1 text-ink-3">
                  — Optional
                </span>
              </label>
              <textarea
                value={form.additional_notes}
                onChange={e => update('additional_notes', e.target.value)}
                placeholder="Any additional context about your professional background…"
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none resize-none
                           text-ink placeholder:text-ink-3 focus:border-terracotta transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="border border-line rounded-md p-4 bg-cream">
          <p className="text-xs leading-relaxed text-ink-2">
            Your documents are stored securely and only accessible to {PRODUCT_NAME} administrators.
            They will never be shared publicly or with hirers.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 border border-line rounded-xs text-sm bg-danger-bg text-danger">
            <AlertCircle size={14} strokeWidth={1.5} />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white
                     rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep disabled:opacity-50"
        >
          <Shield size={15} strokeWidth={2} />
          {uploading ? 'Submitting…' : 'Submit Verification Application'}
        </button>

      </div>
    </div>
  )
}
