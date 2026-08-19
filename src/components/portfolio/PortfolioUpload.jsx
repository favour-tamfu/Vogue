'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Upload, X, CheckCircle, AlertCircle,
  Image as ImageIcon, Trash2, Eye, EyeOff, ArrowLeft,
  Plus, Play
} from 'lucide-react'
import Link from 'next/link'
import Onuuzo from '@/components/motifs/Onuuzo'

const EVENT_TYPES = [
  'Wedding', 'Corporate', 'Birthday', 'Concert',
  'Conference', 'Product Launch', 'Festival',
  'Private Dinner', 'Funeral', 'Other'
]

const TODAY = new Date().toISOString().split('T')[0]

export default function PortfolioUpload({ profile, existingPortfolio, categories }) {
  const supabase = createClient()

  const [portfolio, setPortfolio] = useState(existingPortfolio)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState(null)
  const [success, setSuccess]     = useState(null)
  const [deleting, setDeleting]   = useState(null)

  // New item form state
  const [preview, setPreview]     = useState(null)
  const [file, setFile]           = useState(null)
  const [fileType, setFileType]   = useState('image')
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

    const allowedImages = ['image/jpeg', 'image/png', 'image/webp']
    const allowedVideos = ['video/mp4', 'video/quicktime', 'video/webm']
    const allowed = [...allowedImages, ...allowedVideos]

    if (!allowed.includes(selected.type)) {
      setError('Please upload a JPG, PNG, WebP image or MP4/MOV/WebM video')
      return
    }

    const maxSize = selected.type.startsWith('video/') ? 100 : 10
    if (selected.size > maxSize * 1024 * 1024) {
      setError(`File must be under ${maxSize}MB`)
      return
    }

    setFile(selected)
    setFileType(selected.type.startsWith('video/') ? 'video' : 'image')
    setError(null)

    if (selected.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target.result)
      reader.readAsDataURL(selected)
    } else {
      setPreview('video')
    }
  }

  const handleUpload = async () => {
    if (!file) { setError('Please select a file'); return }
    setUploading(true)
    setError(null)

    try {
      const ext      = file.name.split('.').pop()
      const fileName = `${profile.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(fileName, file, { upsert: false })

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`)
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(fileName)

      const { data: newItem, error: dbError } = await supabase
        .from('portfolio_items')
        .insert({
          provider_id:  profile.id,
          image_url:    fileType === 'image' ? publicUrl : null,
          video_url:    fileType === 'video' ? publicUrl : null,
          media_type:   fileType,
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

      setPortfolio(prev => [newItem, ...prev])
      setFile(null)
      setPreview(null)
      setFileType('image')
      setForm({ title: '', description: '', event_type: '', category_id: '', event_date: '' })
      setShowForm(false)
      setSuccess(`${fileType === 'video' ? 'Video' : 'Photo'} uploaded successfully!`)
      setTimeout(() => setSuccess(null), 3000)

    } catch {
      setError('Something went wrong — please try again')
    }

    setUploading(false)
  }

  const handleDelete = async (item) => {
    if (!confirm('Delete this portfolio item?')) return
    setDeleting(item.id)

    const mediaUrl = item.image_url || item.video_url
    if (mediaUrl) {
      const urlParts = mediaUrl.split('/portfolio/')
      const fileName = urlParts[1]
      if (fileName) {
        await supabase.storage.from('portfolio').remove([fileName])
      }
    }

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

  const resetForm = () => {
    setShowForm(false)
    setFile(null)
    setPreview(null)
    setFileType('image')
    setError(null)
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
          <h1 className="t-h1 text-ink">Portfolio</h1>
          <p className="text-sm mt-0.5 text-ink-2">
            {portfolio.length} item{portfolio.length !== 1 ? 's' : ''} · Showcase your best work
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-sm
                     bg-terracotta transition-colors hover:bg-terracotta-deep"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add Media
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-2 p-3 border border-line rounded-xs mb-5 text-sm
                        bg-verified-bg text-verified">
          <CheckCircle size={14} strokeWidth={1.5} />
          {success}
        </div>
      )}

      {/* Upload form */}
      {showForm && (
        <div className="bg-surface border border-line rounded-md p-5 mb-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-line">
            <h2 className="t-h3 text-ink">
              Upload Photo or Video
            </h2>
            <button onClick={resetForm}>
              <X size={16} strokeWidth={1.5} className="text-ink-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* File upload */}
            <div>
              <p className="t-label mb-2 text-ink-2">
                Photo or Video <span className="text-terracotta">*</span>
              </p>
              <label
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xs
                            cursor-pointer transition-colors hover:bg-cream ${
                  file ? 'border-terracotta' : 'border-line'
                }`}
                style={{ minHeight: 200 }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {preview === 'video' ? (
                  <div className="text-center p-6">
                    <div className="w-14 h-14 flex items-center justify-center mx-auto mb-2 text-white
                                    bg-ink rounded-sm">
                      <Play size={24} strokeWidth={1.5} />
                    </div>
                    <p className="text-xs font-medium text-terracotta">{file?.name}</p>
                    <p className="text-xs mt-1 text-ink-3">
                      Video ready · Click to change
                    </p>
                  </div>
                ) : preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full object-cover rounded-xs"
                    style={{ maxHeight: 200 }}
                  />
                ) : (
                  <div className="text-center p-6">
                    <Upload size={24} strokeWidth={1} className="text-ink-3 mx-auto mb-2" />
                    <p className="text-sm font-medium text-ink-2">
                      Click to upload
                    </p>
                    <p className="text-xs mt-1 text-ink-3">
                      Images: JPG, PNG, WebP — max 10MB
                    </p>
                    <p className="text-xs text-ink-3">
                      Videos: MP4, MOV, WebM — max 100MB
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* Details form */}
            <div className="space-y-3">
              <div>
                <label className="t-label block mb-1 text-ink-2">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => update('title', e.target.value)}
                  placeholder="e.g. Corporate Event at Eko Hotel"
                  className="w-full px-3 py-2 text-sm border border-line rounded-xs outline-none text-ink
                             placeholder:text-ink-3 focus:border-terracotta transition-colors"
                />
              </div>

              <div>
                <label className="t-label block mb-1 text-ink-2">Event Type</label>
                <select
                  value={form.event_type}
                  onChange={e => update('event_type', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-line rounded-xs outline-none bg-surface
                             text-ink focus:border-terracotta transition-colors"
                >
                  <option value="">Select type…</option>
                  {EVENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="t-label block mb-1 text-ink-2">Service Category</label>
                <select
                  value={form.category_id}
                  onChange={e => update('category_id', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-line rounded-xs outline-none bg-surface
                             text-ink focus:border-terracotta transition-colors"
                >
                  <option value="">Select category…</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="t-label block mb-1 text-ink-2">Event Date</label>
                <input
                  type="date"
                  value={form.event_date}
                  onChange={e => update('event_date', e.target.value)}
                  max={TODAY}
                  className="w-full px-3 py-2 text-sm border border-line rounded-xs outline-none text-ink
                             focus:border-terracotta transition-colors"
                />
              </div>

              <div>
                <label className="t-label block mb-1 text-ink-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="Brief description of the work…"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-line rounded-xs outline-none resize-none
                             text-ink placeholder:text-ink-3 focus:border-terracotta transition-colors"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 border border-line rounded-xs text-xs mt-4
                            bg-danger-bg text-danger">
              <AlertCircle size={13} strokeWidth={1.5} /> {error}
            </div>
          )}

          <div className="flex gap-3 mt-4 pt-4 border-t border-line">
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-sm
                         bg-terracotta transition-colors hover:bg-terracotta-deep disabled:opacity-50"
            >
              <Upload size={14} strokeWidth={2} />
              {uploading ? 'Uploading…' : `Upload ${fileType === 'video' ? 'Video' : 'Photo'}`}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium border border-line rounded-sm text-ink-2
                         transition-colors hover:bg-cream"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Portfolio grid */}
      {portfolio.length === 0 ? (
        <div className="bg-surface border border-line rounded-md py-20 text-center">
          {/* Ọnụ ụzọ — the threshold. */}
          <Onuuzo size={104} className="text-terracotta mx-auto mb-4 opacity-70" />
          <p className="text-sm font-medium text-ink-2">
            No portfolio items yet
          </p>
          <p className="text-xs mt-1 mb-4 text-ink-3">
            Upload your best event photos and videos to attract more hirers
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-semibold px-5 py-2 text-white rounded-sm bg-terracotta
                       transition-colors hover:bg-terracotta-deep"
          >
            Upload First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {portfolio.map(item => {
            const isVideo = item.media_type === 'video' || item.video_url
            return (
              <div
                key={item.id}
                className="relative group border border-line rounded-xs overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-cream-2 overflow-hidden">
                  {isVideo ? (
                    <div className="w-full h-full flex items-center justify-center relative bg-ink">
                      <Play size={32} strokeWidth={1} className="text-white opacity-80" />
                      <span className="absolute bottom-2 right-2 text-xs text-white/70 font-medium">
                        Video
                      </span>
                    </div>
                  ) : item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title || 'Portfolio'}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={24} strokeWidth={1} className="text-ink-3" />
                    </div>
                  )}
                </div>

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 flex flex-col justify-between p-2 opacity-0
                             group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(43,33,24,0.6)' }}
                >
                  {!item.is_published && (
                    <div>
                      <span className="text-xs font-medium px-2 py-0.5 text-white rounded-[3px]"
                        style={{ background: 'rgba(0,0,0,0.5)' }}
                      >
                        Hidden
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1.5 mt-auto">
                    <button
                      onClick={() => handleTogglePublish(item)}
                      className="flex items-center justify-center w-7 h-7 bg-white/20 hover:bg-white/30
                                 text-white rounded-xs transition-colors"
                      title={item.is_published ? 'Hide from feed' : 'Show in feed'}
                    >
                      {item.is_published
                        ? <Eye size={13} strokeWidth={1.5} />
                        : <EyeOff size={13} strokeWidth={1.5} />
                      }
                    </button>

                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deleting === item.id}
                      className="flex items-center justify-center w-7 h-7 bg-danger/80 hover:bg-danger
                                 text-white rounded-xs transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Title below */}
                {item.title && (
                  <div className="px-2 py-1.5 border-t border-line">
                    <p className="text-xs font-medium truncate text-ink-2">
                      {item.title}
                    </p>
                    {item.event_type && (
                      <p className="text-xs text-ink-3">{item.event_type}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
