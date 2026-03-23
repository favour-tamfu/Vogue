'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Upload, X, CheckCircle, AlertCircle,
  Image, Trash2, Eye, EyeOff, ArrowLeft,
  Plus
} from 'lucide-react'
import Link from 'next/link'

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

const EVENT_TYPES = [
  'Wedding', 'Corporate', 'Birthday', 'Concert',
  'Conference', 'Product Launch', 'Festival',
  'Private Dinner', 'Funeral', 'Other'
]

export default function PortfolioUpload({ profile, existingPortfolio, categories }) {
  const router   = useRouter()
  const supabase = createClient()

  const [portfolio, setPortfolio] = useState(existingPortfolio)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState(null)
  const [success, setSuccess]     = useState(null)
  const [deleting, setDeleting]   = useState(null)

  // New item form state
  const [preview, setPreview]     = useState(null)
  const [file, setFile]           = useState(null)
  const [form, setForm]           = useState({
    title:       '',
    description: '',
    event_type:  '',
    category_id: '',
    event_date:  '',
  })
  const [showForm, setShowForm] = useState(false)
  const fileRef = useRef(null)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleFileSelect = (e) => {
    const selected = e.target.files[0]
    if (!selected) return

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(selected.type)) {
      setError('Please upload a JPG, PNG, or WebP image')
      return
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB')
      return
    }

    setFile(selected)
    setError(null)

    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(selected)
  }

  const handleUpload = async () => {
    if (!file) { setError('Please select an image'); return }
    setUploading(true)
    setError(null)

    try {
      // Upload image to Supabase Storage
      const ext      = file.name.split('.').pop()
      const fileName = `${profile.id}/${Date.now()}.${ext}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(fileName, file, { upsert: false })

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`)
        setUploading(false)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(fileName)

      // Save to database
      const { data: newItem, error: dbError } = await supabase
        .from('portfolio_items')
        .insert({
          provider_id:  profile.id,
          image_url:    publicUrl,
          title:        form.title       || null,
          description:  form.description || null,
          event_type:   form.event_type  || null,
          category_id:  form.category_id || null,
          event_date:   form.event_date  || null,
          is_published: true,
        })
        .select()
        .single()

      if (dbError) {
        setError(`Save failed: ${dbError.message}`)
        setUploading(false)
        return
      }

      // Add to local state
      setPortfolio(prev => [newItem, ...prev])

      // Reset form
      setFile(null)
      setPreview(null)
      setForm({ title: '', description: '', event_type: '', category_id: '', event_date: '' })
      setShowForm(false)
      setSuccess('Photo uploaded successfully!')
      setTimeout(() => setSuccess(null), 3000)

    } catch (e) {
      setError('Something went wrong — please try again')
    }

    setUploading(false)
  }

  const handleDelete = async (item) => {
    if (!confirm('Delete this portfolio item?')) return
    setDeleting(item.id)

    // Extract filename from URL
    const urlParts   = item.image_url.split('/portfolio/')
    const fileName   = urlParts[1]

    // Delete from storage
    if (fileName) {
      await supabase.storage.from('portfolio').remove([fileName])
    }

    // Delete from database
    await supabase.from('portfolio_items').delete().eq('id', item.id)

    setPortfolio(prev => prev.filter(p => p.id !== item.id))
    setDeleting(null)
  }

  const handleTogglePublish = async (item) => {
    const { data } = await supabase
      .from('portfolio_items')
      .update({ is_published: !item.is_published })
      .eq('id', item.id)
      .select()
      .single()

    if (data) {
      setPortfolio(prev => prev.map(p => p.id === item.id ? data : p))
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href={`/providers/${profile.id}`}
            className="inline-flex items-center gap-1.5 text-sm mb-2 transition-opacity hover:opacity-70"
            style={{ color: T.textMuted }}
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> My Profile
          </Link>
          <h1 className="text-xl font-semibold" style={{ color: T.navy }}>Portfolio</h1>
          <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
            {portfolio.length} item{portfolio.length !== 1 ? 's' : ''} · Showcase your best work
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 transition-opacity hover:opacity-90"
          style={{ background: T.coral, borderRadius: 4 }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Add Photo
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div
          className="flex items-center gap-2 p-3 border mb-5 text-sm"
          style={{ background: '#F0FDF4', borderColor: '#86EFAC', borderRadius: 4, color: '#16A34A' }}
        >
          <CheckCircle size={14} strokeWidth={1.5} />
          {success}
        </div>
      )}

      {/* Upload form */}
      {showForm && (
        <div className="bg-white border p-5 mb-6"
          style={{ borderColor: T.border, borderRadius: 4 }}>
          <div className="flex items-center justify-between mb-4 pb-4 border-b"
            style={{ borderColor: T.border }}>
            <h2 className="text-sm font-semibold" style={{ color: T.navy }}>
              Upload New Photo
            </h2>
            <button onClick={() => { setShowForm(false); setFile(null); setPreview(null) }}>
              <X size={16} strokeWidth={1.5} style={{ color: T.textLight }} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Image upload */}
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: T.navyMid }}>
                Image <span style={{ color: T.coral }}>*</span>
              </p>
              <label
                className="flex flex-col items-center justify-center border-2 border-dashed cursor-pointer transition-colors hover:bg-slate-50"
                style={{
                  borderColor:  file ? T.coral : T.border,
                  borderRadius: 4,
                  minHeight:    200,
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full object-cover"
                    style={{ maxHeight: 200, borderRadius: 4 }}
                  />
                ) : (
                  <div className="text-center p-6">
                    <Upload size={24} strokeWidth={1}
                      style={{ color: T.textLight, margin: '0 auto 8px' }} />
                    <p className="text-sm font-medium" style={{ color: T.textMuted }}>
                      Click to upload
                    </p>
                    <p className="text-xs mt-1" style={{ color: T.textLight }}>
                      JPG, PNG, WebP — max 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* Details form */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1"
                  style={{ color: T.navyMid }}>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => update('title', e.target.value)}
                  placeholder="e.g. Corporate Event at Eko Hotel"
                  className="w-full px-3 py-2 text-sm border outline-none"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                  onFocus={e => e.target.style.borderColor = T.navy}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1"
                  style={{ color: T.navyMid }}>Event Type</label>
                <select
                  value={form.event_type}
                  onChange={e => update('event_type', e.target.value)}
                  className="w-full px-3 py-2 text-sm border outline-none bg-white"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                >
                  <option value="">Select type...</option>
                  {EVENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1"
                  style={{ color: T.navyMid }}>Service Category</label>
                <select
                  value={form.category_id}
                  onChange={e => update('category_id', e.target.value)}
                  className="w-full px-3 py-2 text-sm border outline-none bg-white"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1"
                  style={{ color: T.navyMid }}>Event Date</label>
                <input
                  type="date"
                  value={form.event_date}
                  onChange={e => update('event_date', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 text-sm border outline-none"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                  onFocus={e => e.target.style.borderColor = T.navy}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1"
                  style={{ color: T.navyMid }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="Brief description of the work..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border outline-none resize-none"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                  onFocus={e => e.target.style.borderColor = T.navy}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
              </div>
            </div>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 p-3 border text-xs mt-4"
              style={{ borderColor: '#FECACA', background: '#FFF5F5', borderRadius: 4, color: '#DC2626' }}
            >
              <AlertCircle size={13} strokeWidth={1.5} /> {error}
            </div>
          )}

          <div className="flex gap-3 mt-4 pt-4 border-t" style={{ borderColor: T.border }}>
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: T.coral, borderRadius: 4 }}
            >
              <Upload size={14} strokeWidth={2} />
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
            <button
              onClick={() => { setShowForm(false); setFile(null); setPreview(null) }}
              className="px-4 py-2 text-sm font-medium border transition-colors hover:bg-slate-50"
              style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Portfolio grid */}
      {portfolio.length === 0 ? (
        <div
          className="bg-white border py-20 text-center"
          style={{ borderColor: T.border, borderRadius: 4 }}
        >
          <Image size={40} strokeWidth={1}
            style={{ color: T.textLight, margin: '0 auto 12px' }} />
          <p className="text-sm font-medium" style={{ color: T.textMuted }}>
            No portfolio items yet
          </p>
          <p className="text-xs mt-1 mb-4" style={{ color: T.textLight }}>
            Upload your best event photos to attract more hirers
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-semibold px-5 py-2 text-white"
            style={{ background: T.coral, borderRadius: 4 }}
          >
            Upload First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {portfolio.map(item => (
            <div
              key={item.id}
              className="relative group border overflow-hidden"
              style={{ borderColor: T.border, borderRadius: 4 }}
            >
              {/* Image */}
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title || 'Portfolio'}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image size={24} strokeWidth={1} style={{ color: T.textLight }} />
                  </div>
                )}
              </div>

              {/* Overlay on hover */}
              <div
                className="absolute inset-0 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(15,23,42,0.6)' }}
              >
                {/* Top — unpublished badge */}
                {!item.is_published && (
                  <div>
                    <span
                      className="text-xs font-medium px-2 py-0.5 text-white"
                      style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 3 }}
                    >
                      Hidden
                    </span>
                  </div>
                )}

                {/* Bottom — actions */}
                <div className="flex items-center justify-end gap-1.5 mt-auto">
                  {/* Toggle visibility */}
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className="flex items-center justify-center w-7 h-7 bg-white/20 hover:bg-white/30 text-white transition-colors"
                    style={{ borderRadius: 4 }}
                    title={item.is_published ? 'Hide from feed' : 'Show in feed'}
                  >
                    {item.is_published
                      ? <Eye size={13} strokeWidth={1.5} />
                      : <EyeOff size={13} strokeWidth={1.5} />
                    }
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deleting === item.id}
                    className="flex items-center justify-center w-7 h-7 bg-red-500/80 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
                    style={{ borderRadius: 4 }}
                    title="Delete"
                  >
                    <Trash2 size={13} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Title below image */}
              {item.title && (
                <div className="px-2 py-1.5 border-t" style={{ borderColor: T.border }}>
                  <p className="text-xs font-medium truncate" style={{ color: T.navyMid }}>
                    {item.title}
                  </p>
                  {item.event_type && (
                    <p className="text-xs" style={{ color: T.textLight }}>{item.event_type}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}