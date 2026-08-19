'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, User, Briefcase,
  CheckCircle, AlertCircle, Camera, Save
} from 'lucide-react'
import Link from 'next/link'

const EVENT_TYPES_ORG = [
  { value: 'individual', label: 'Personal',      desc: 'Birthday parties, weddings, house events' },
  { value: 'company',    label: 'Event Business', desc: 'You run or manage events professionally' },
  { value: 'corporate',  label: 'Corporate',      desc: 'Company events, launches, conferences' },
]

export default function ProfileEdit({ profile, categories, selectedCategoryIds }) {
  const router   = useRouter()
  const supabase = createClient()
  const fileRef  = useRef(null)

  const [form, setForm] = useState({
    full_name:        profile.full_name        || '',
    location:         profile.location         || '',
    bio:              profile.bio              || '',
    org_type:         profile.org_type         || '',
    org_name:         profile.org_name         || '',
    years_experience: profile.years_experience?.toString() || '',
    phone:            profile.phone            || '',
  })

  const [selectedCats, setSelectedCats]   = useState(selectedCategoryIds)
  const [avatarFile, setAvatarFile]       = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || null)
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState(null)
  const [success, setSuccess]             = useState(false)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const isProvider = profile.role === 'provider' || profile.role === 'both'
  const isHirer    = profile.role === 'hirer'    || profile.role === 'both'

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = e => setAvatarPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const toggleCategory = (catId) => {
    setSelectedCats(prev =>
      prev.includes(catId)
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    )
  }

  const handleSave = async () => {
    if (!form.full_name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError(null)

    try {
      let avatarUrl = profile.avatar_url

      // Upload new avatar if selected
      if (avatarFile) {
        const ext      = avatarFile.name.split('.').pop()
        const fileName = `avatars/${profile.id}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('portfolio')
          .upload(fileName, avatarFile, { upsert: true })

        if (uploadError) {
          setError(`Avatar upload failed: ${uploadError.message}`)
          setSaving(false)
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio')
          .getPublicUrl(fileName)

        avatarUrl = publicUrl
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name:        form.full_name.trim(),
          location:         form.location.trim()  || null,
          bio:              form.bio.trim()        || null,
          org_type:         form.org_type          || null,
          org_name:         form.org_name.trim()   || null,
          years_experience: form.years_experience  ? parseInt(form.years_experience) : null,
          phone:            form.phone.trim()       || null,
          avatar_url:       avatarUrl,
        })
        .eq('id', profile.id)

      if (profileError) {
        setError(`Save failed: ${profileError.message}`)
        setSaving(false)
        return
      }

      // Update provider categories if provider
      if (isProvider) {
        // Delete old categories
        await supabase
          .from('provider_categories')
          .delete()
          .eq('provider_id', profile.id)

        // Insert new ones
        if (selectedCats.length > 0) {
          await supabase
            .from('provider_categories')
            .insert(selectedCats.map(catId => ({
              provider_id:  profile.id,
              category_id:  catId,
            })))
        }
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/providers/${profile.id}`)
        router.refresh()
      }, 1000)

    } catch {
      setError('Something went wrong — please try again')
    }

    setSaving(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href={`/providers/${profile.id}`}
            className="inline-flex items-center gap-1.5 text-sm mb-2 transition-opacity hover:opacity-70 text-ink-2"
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> My Profile
          </Link>
          <h1 className="t-h1 text-ink">Edit Profile</h1>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 border border-line rounded-xs mb-5 text-sm
                        bg-verified-bg text-verified">
          <CheckCircle size={14} strokeWidth={1.5} />
          Profile saved! Redirecting…
        </div>
      )}

      <div className="space-y-5">

        {/* Avatar */}
        <div className="bg-surface border border-line rounded-md p-5">
          <div className="flex items-center gap-2 pb-4 mb-5 border-b border-line">
            <User size={14} strokeWidth={1.5} className="text-ink-3" />
            <h2 className="t-h3 text-ink">Profile Photo</h2>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 flex items-center justify-center text-white text-2xl font-bold
                              overflow-hidden bg-ink rounded-sm">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar"
                    className="w-full h-full object-cover" />
                ) : (
                  profile.full_name?.charAt(0) || '?'
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 flex items-center justify-center
                           text-white rounded-full bg-terracotta transition-colors hover:bg-terracotta-deep"
              >
                <Camera size={13} strokeWidth={2} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">
                {profile.full_name}
              </p>
              <p className="text-xs mt-0.5 text-ink-3">
                JPG, PNG or WebP — max 5MB
              </p>
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs font-medium mt-1.5 text-terracotta hover:text-terracotta-deep"
              >
                Change photo
              </button>
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-surface border border-line rounded-md p-5">
          <div className="flex items-center gap-2 pb-4 mb-5 border-b border-line">
            <User size={14} strokeWidth={1.5} className="text-ink-3" />
            <h2 className="t-h3 text-ink">Basic Information</h2>
          </div>

          <div className="space-y-4">
            <Field label="Full Name" required>
              <input
                type="text"
                value={form.full_name}
                onChange={e => update('full_name', e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none text-ink
                           placeholder:text-ink-3 focus:border-terracotta transition-colors"
              />
            </Field>

            <Field label="Location" hint="City, Country">
              <input
                type="text"
                value={form.location}
                onChange={e => update('location', e.target.value)}
                placeholder="e.g. Lagos, Nigeria"
                className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none text-ink
                           placeholder:text-ink-3 focus:border-terracotta transition-colors"
              />
            </Field>

            <Field label="Phone Number" hint="Optional">
              <input
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="e.g. +234 800 000 0000"
                className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none text-ink
                           placeholder:text-ink-3 focus:border-terracotta transition-colors"
              />
            </Field>

            <Field label="Bio" hint="Tell people about yourself">
              <textarea
                value={form.bio}
                onChange={e => update('bio', e.target.value)}
                placeholder={isProvider
                  ? 'Describe your experience, specialties, and what makes you stand out…'
                  : 'Describe the types of events you organise…'}
                rows={4}
                className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none resize-none
                           text-ink placeholder:text-ink-3 focus:border-terracotta transition-colors"
              />
            </Field>
          </div>
        </div>

        {/* Hirer details */}
        {isHirer && (
          <div className="bg-surface border border-line rounded-md p-5">
            <div className="flex items-center gap-2 pb-4 mb-5 border-b border-line">
              <Briefcase size={14} strokeWidth={1.5} className="text-ink-3" />
              <h2 className="t-h3 text-ink">Hirer Details</h2>
            </div>

            <div className="space-y-4">
              <Field label="Event Type">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {EVENT_TYPES_ORG.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => update('org_type', opt.value)}
                      className={`p-3 border rounded-xs text-left transition-all ${
                        form.org_type === opt.value
                          ? 'border-terracotta bg-terracotta-soft'
                          : 'border-line bg-surface'
                      }`}
                    >
                      <div className="t-label text-ink">
                        {opt.label}
                      </div>
                      <div className="text-xs mt-0.5 text-ink-3">
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </Field>

              {(form.org_type === 'company' || form.org_type === 'corporate') && (
                <Field label="Organisation Name">
                  <input
                    type="text"
                    value={form.org_name}
                    onChange={e => update('org_name', e.target.value)}
                    placeholder="Your company or business name"
                    className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none text-ink
                               placeholder:text-ink-3 focus:border-terracotta transition-colors"
                  />
                </Field>
              )}
            </div>
          </div>
        )}

        {/* Provider details */}
        {isProvider && (
          <div className="bg-surface border border-line rounded-md p-5">
            <div className="flex items-center gap-2 pb-4 mb-5 border-b border-line">
              <Briefcase size={14} strokeWidth={1.5} className="text-ink-3" />
              <h2 className="t-h3 text-ink">Provider Details</h2>
            </div>

            <div className="space-y-5">
              <Field label="Years of Experience">
                <div className="flex gap-2 flex-wrap">
                  {['1', '2', '3', '4', '5', '6-10', '10+'].map(yr => (
                    <button
                      key={yr}
                      onClick={() => update('years_experience', yr)}
                      className={`px-4 py-2 border rounded-xs text-xs font-medium transition-all ${
                        form.years_experience === yr
                          ? 'border-terracotta bg-terracotta-soft text-terracotta'
                          : 'border-line bg-surface text-ink-2'
                      }`}
                    >
                      {yr} {yr === '1' ? 'year' : 'years'}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Service Categories" hint="Select all that apply">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3 py-2 border rounded-xs text-xs font-medium text-left transition-all ${
                        selectedCats.includes(cat.id)
                          ? 'border-terracotta bg-terracotta-soft text-terracotta'
                          : 'border-line bg-surface text-ink-2'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 border border-line rounded-xs text-sm bg-danger-bg text-danger">
            <AlertCircle size={14} strokeWidth={1.5} /> {error}
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white
                     rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep disabled:opacity-50"
        >
          <Save size={15} strokeWidth={2} />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>

      </div>
    </div>
  )
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline gap-1 mb-1.5">
        <label className="t-label text-ink-2">{label}</label>
        {required && <span className="text-xs text-terracotta">*</span>}
        {hint && <span className="text-xs text-ink-3">— {hint}</span>}
      </div>
      {children}
    </div>
  )
}
