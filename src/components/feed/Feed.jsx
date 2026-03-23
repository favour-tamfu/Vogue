'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Star, MapPin, DollarSign, Users,
  Heart, Bookmark, Share2, CheckCircle,
  Briefcase, Image, UserPlus, ArrowRight,
  MessageCircle, Award
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

function timeAgo(dateStr) {
  const diff   = Date.now() - new Date(dateStr).getTime()
  const mins   = Math.floor(diff / 60000)
  const hours  = Math.floor(diff / 3600000)
  const days   = Math.floor(diff / 86400000)
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatBudget(min, max, currency) {
  const symbols = { USD: '$', EUR: '€', GBP: '£', NGN: '₦', GHS: 'GH₵', XAF: 'FCFA' }
  const sym = symbols[currency] || '$'
  if (min) return `${sym}${Number(min).toLocaleString()} – ${sym}${Number(max).toLocaleString()}`
  return `Up to ${sym}${Number(max).toLocaleString()}`
}

// ── Shared action bar used by every card ──
function ActionBar({ itemId, itemType, currentUser, isLiked, isSaved, onLike, onSave, shareUrl, shareText }) {
  const [liked, setLiked]   = useState(isLiked)
  const [saved, setSaved]   = useState(isSaved)
  const [likes, setLikes]   = useState(0)
  const [busy, setBusy]     = useState(false)
  const supabase = createClient()

  const handleLike = async () => {
    if (!currentUser || busy) return
    setBusy(true)
    if (liked) {
      await supabase.from('feed_likes').delete()
        .eq('user_id', currentUser.id).eq('item_id', itemId)
      setLiked(false)
      setLikes(l => Math.max(0, l - 1))
    } else {
      await supabase.from('feed_likes').insert({
        user_id: currentUser.id, item_id: itemId, item_type: itemType
      })
      setLiked(true)
      setLikes(l => l + 1)
    }
    setBusy(false)
    if (onLike) onLike(!liked)
  }

  const handleSave = async () => {
    if (!currentUser || busy) return
    setBusy(true)
    if (saved) {
      await supabase.from('saves').delete()
        .eq('user_id', currentUser.id).eq('portfolio_item_id', itemId)
      setSaved(false)
    } else {
      await supabase.from('saves').insert({
        user_id: currentUser.id, portfolio_item_id: itemId
      })
      setSaved(true)
    }
    setBusy(false)
    if (onSave) onSave(!saved)
  }

  const handleShare = () => {
    const url  = shareUrl || window.location.href
    const text = shareText || 'Check this out on Vogue Events'
    if (navigator.share) {
      navigator.share({ title: text, url })
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div
      className="flex items-center gap-1 px-4 py-2.5 border-t"
      style={{ borderColor: T.border }}
    >
      {/* Like */}
      <button
        onClick={handleLike}
        disabled={!currentUser}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors hover:bg-slate-50 disabled:opacity-40"
        title={!currentUser ? 'Log in to like' : liked ? 'Unlike' : 'Like'}
      >
        <Heart
          size={16}
          strokeWidth={1.5}
          className={`transition-colors ${liked ? 'fill-red-500 text-red-500' : ''}`}
          style={{ color: liked ? undefined : T.textLight }}
        />
        <span className="text-xs font-medium" style={{ color: liked ? '#EF4444' : T.textLight }}>
          Like
        </span>
      </button>

      {/* Save — only for portfolio items */}
      {itemType === 'portfolio' && (
        <button
          onClick={handleSave}
          disabled={!currentUser}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors hover:bg-slate-50 disabled:opacity-40"
          title={!currentUser ? 'Log in to save' : saved ? 'Unsave' : 'Save'}
        >
          <Bookmark
            size={16}
            strokeWidth={1.5}
            className={`transition-colors ${saved ? 'fill-current' : ''}`}
            style={{ color: saved ? T.coral : T.textLight }}
          />
          <span className="text-xs font-medium"
            style={{ color: saved ? T.coral : T.textLight }}>
            {saved ? 'Saved' : 'Save'}
          </span>
        </button>
      )}

      {/* Share */}
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors hover:bg-slate-50"
      >
        <Share2 size={16} strokeWidth={1.5} style={{ color: T.textLight }} />
        <span className="text-xs font-medium" style={{ color: T.textLight }}>Share</span>
      </button>
    </div>
  )
}

// ── Shared card header ──
function CardHeader({ avatarInitial, avatarUrl, name, profileLink, subtitle, badge, badgeBg, badgeColor, badgeIcon: BadgeIcon, time }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3.5 border-b"
      style={{ borderColor: T.border }}>
      <div className="flex items-center gap-3">
        <Link href={profileLink || '#'}>
          <div
            className="w-9 h-9 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden"
            style={{ background: T.navy, borderRadius: 6 }}
          >
            {avatarUrl
              ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              : (avatarInitial || '?')
            }
          </div>
        </Link>
        <div>
          <Link href={profileLink || '#'}>
            <span className="text-sm font-semibold hover:underline" style={{ color: T.navy }}>
              {name}
            </span>
          </Link>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: T.textLight }}>{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="flex items-center gap-1 text-xs font-medium px-2 py-0.5"
          style={{ background: badgeBg, color: badgeColor, borderRadius: 4 }}
        >
          {BadgeIcon && <BadgeIcon size={10} strokeWidth={1.5} />}
          {badge}
        </span>
        <span className="text-xs" style={{ color: T.textLight }}>{time}</span>
      </div>
    </div>
  )
}

export default function Feed({ feedItems, currentUser, savedIds, likedIds }) {
  const [filter, setFilter] = useState('all')

  const filters = [
    { key: 'all',          label: 'All'       },
    { key: 'new_provider', label: 'Providers' },
    { key: 'new_job',      label: 'Jobs'      },
    { key: 'review',       label: 'Reviews'   },
    { key: 'portfolio',    label: 'Portfolio' },
  ]

  const filtered = feedItems.filter(item =>
    filter === 'all' ? true : item.type === filter
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: T.navy }}>Live Feed</h1>
        <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
          What's happening on the platform
        </p>
      </div>

      {/* Filter tabs */}
      <div
        className="flex items-center bg-white border p-1 mb-5 overflow-x-auto"
        style={{ borderColor: T.border, borderRadius: 4 }}
      >
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="flex-shrink-0 px-4 py-1.5 text-xs font-semibold transition-all"
            style={{
              borderRadius: 3,
              background: filter === f.key ? T.navy : 'transparent',
              color:      filter === f.key ? '#fff' : T.textMuted,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white border py-16 text-center"
            style={{ borderColor: T.border, borderRadius: 4 }}>
            <p className="text-sm" style={{ color: T.textMuted }}>Nothing here yet</p>
          </div>
        ) : (
          filtered.map(item => {
            const itemId = item.data.id
            const isLiked = likedIds?.includes(String(itemId)) || false
            const isSaved = savedIds?.includes(itemId) || false

            switch (item.type) {
              case 'new_provider':
                return <ProviderCard key={item.id} provider={item.data}
                  currentUser={currentUser} isLiked={isLiked} />
              case 'new_job':
                return <JobCard key={item.id} job={item.data}
                  currentUser={currentUser} isLiked={isLiked} />
              case 'review':
                return <ReviewCard key={item.id} review={item.data}
                  currentUser={currentUser} isLiked={isLiked} />
              case 'portfolio':
                return <PortfolioCard key={item.id} item={item.data}
                  currentUser={currentUser} isLiked={isLiked} isSaved={isSaved} />
              default:
                return null
            }
          })
        )}
      </div>
    </div>
  )
}

// ── New Provider Card ──
function ProviderCard({ provider, currentUser, isLiked }) {
  const categories = provider.provider_categories
    ?.map(pc => pc.category?.name).filter(Boolean).slice(0, 3) || []

  return (
    <div className="bg-white border overflow-hidden"
      style={{ borderColor: T.border, borderRadius: 4 }}>

      <CardHeader
        avatarInitial={provider.full_name?.charAt(0)}
        avatarUrl={provider.avatar_url}
        name={provider.full_name}
        profileLink={`/providers/${provider.id}`}
        subtitle={provider.location}
        badge="New Provider"
        badgeBg="#EFF6FF"
        badgeColor="#3B82F6"
        badgeIcon={UserPlus}
        time={timeAgo(provider.created_at)}
      />

      {/* Content */}
      <div className="px-4 py-4">
        {/* Verified badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <CheckCircle size={13} strokeWidth={1.5} className="text-blue-500" />
          <span className="text-xs font-medium text-blue-700">Verified Professional</span>
        </div>

        {/* Bio */}
        {provider.bio && (
          <p className="text-sm leading-relaxed mb-3 line-clamp-3" style={{ color: T.textMuted }}>
            {provider.bio}
          </p>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {categories.map(name => (
              <span key={name} className="text-xs font-medium px-2.5 py-1"
                style={{ background: T.coralLight, color: T.coral, borderRadius: 4 }}>
                {name}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/providers/${provider.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 text-white transition-opacity hover:opacity-90"
          style={{ background: T.navy, borderRadius: 4 }}
        >
          View Profile <ArrowRight size={12} />
        </Link>
      </div>

      <ActionBar
        itemId={String(provider.id)}
        itemType="provider"
        currentUser={currentUser}
        isLiked={isLiked}
        shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/providers/${provider.id}`}
        shareText={`Check out ${provider.full_name} on Vogue Events`}
      />
    </div>
  )
}

// ── New Job Card ──
function JobCard({ job, currentUser, isLiked }) {
  const canBid = currentUser?.role === 'provider' || currentUser?.role === 'both'

  return (
    <div className="bg-white border overflow-hidden"
      style={{ borderColor: T.border, borderRadius: 4 }}>

      <CardHeader
        avatarInitial={job.hirer?.full_name?.charAt(0)}
        name={job.hirer?.full_name || 'Anonymous'}
        profileLink="#"
        subtitle="Posted a new job"
        badge="New Job"
        badgeBg="#FFFBEB"
        badgeColor="#D97706"
        badgeIcon={Briefcase}
        time={timeAgo(job.created_at)}
      />

      <div className="px-4 py-4">
        <Link href={`/jobs/${job.id}`}>
          <h3 className="text-base font-semibold mb-3 hover:underline" style={{ color: T.navy }}>
            {job.title}
          </h3>
        </Link>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {job.category && (
            <span className="text-xs font-medium px-2.5 py-1"
              style={{ background: T.coralLight, color: T.coral, borderRadius: 4 }}>
              {job.category.name}
            </span>
          )}
          <span className="text-xs px-2.5 py-1 border"
            style={{ borderColor: T.border, borderRadius: 4, color: T.textLight }}>
            {job.event_type}
          </span>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { icon: MapPin,    value: job.location },
            { icon: DollarSign,value: formatBudget(job.budget_min, job.budget_max, job.currency) },
            { icon: Users,     value: `${job.bids_count} bids so far` },
          ].map((meta, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 border"
              style={{ borderColor: T.border, borderRadius: 4, background: T.bg }}>
              <meta.icon size={12} strokeWidth={1.5} style={{ color: T.textLight, flexShrink: 0 }} />
              <span className="text-xs truncate" style={{ color: T.textMuted }}>{meta.value}</span>
            </div>
          ))}
        </div>

        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 text-white transition-opacity hover:opacity-90"
          style={{ background: canBid ? T.coral : T.navy, borderRadius: 4 }}
        >
          {canBid ? 'View & Bid' : 'View Job'} <ArrowRight size={12} />
        </Link>
      </div>

      <ActionBar
        itemId={String(job.id)}
        itemType="job"
        currentUser={currentUser}
        isLiked={isLiked}
        shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/jobs/${job.id}`}
        shareText={`${job.title} — open for bids on Vogue Events`}
      />
    </div>
  )
}

// ── Review Card ──
function ReviewCard({ review, currentUser, isLiked }) {
  return (
    <div className="bg-white border overflow-hidden"
      style={{ borderColor: T.border, borderRadius: 4 }}>

      <CardHeader
        avatarInitial={review.reviewer?.full_name?.charAt(0)}
        avatarUrl={review.reviewer?.avatar_url}
        name={review.reviewer?.full_name || 'Anonymous'}
        profileLink="#"
        subtitle={`Reviewed ${review.reviewee?.full_name}`}
        badge="Event Completed"
        badgeBg="#F0FDF4"
        badgeColor="#16A34A"
        badgeIcon={CheckCircle}
        time={timeAgo(review.created_at)}
      />

      <div className="px-4 py-4">
        {/* Who was reviewed */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm" style={{ color: T.textMuted }}>
            Rating for{' '}
            <Link href={`/providers/${review.reviewee?.id}`}>
              <span className="font-semibold hover:underline" style={{ color: T.coral }}>
                {review.reviewee?.full_name}
              </span>
            </Link>
          </span>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1.5 mb-3">
          {[1,2,3,4,5].map(star => (
            <Star key={star} size={18} strokeWidth={1.5}
              className={star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
          ))}
          <span className="text-sm font-bold ml-1" style={{ color: T.navy }}>
            {review.rating}.0 / 5
          </span>
        </div>

        {/* Job reference */}
        {review.hire?.job && (
          <div className="flex items-center gap-2 mb-3 p-2.5 border"
            style={{ borderColor: T.border, borderRadius: 4, background: T.bg }}>
            <Award size={12} strokeWidth={1.5} style={{ color: T.textLight }} />
            <span className="text-xs" style={{ color: T.textMuted }}>
              {review.hire.job.event_type} — {review.hire.job.title}
            </span>
          </div>
        )}

        {/* Comment */}
        {review.comment && (
          <div className="p-3 border-l-2 ml-1"
            style={{ borderLeftColor: T.coral }}>
            <p className="text-sm leading-relaxed italic" style={{ color: T.textMuted }}>
              "{review.comment}"
            </p>
          </div>
        )}
      </div>

      <ActionBar
        itemId={String(review.id)}
        itemType="review"
        currentUser={currentUser}
        isLiked={isLiked}
        shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/providers/${review.reviewee?.id}`}
        shareText={`${review.reviewee?.full_name} got a ${review.rating}/5 review on Vogue Events`}
      />
    </div>
  )
}

// ── Portfolio Card ──
function PortfolioCard({ item, currentUser, isLiked, isSaved }) {
  return (
    <div className="bg-white border overflow-hidden"
      style={{ borderColor: T.border, borderRadius: 4 }}>

      <CardHeader
        avatarInitial={item.provider?.full_name?.charAt(0)}
        avatarUrl={item.provider?.avatar_url}
        name={item.provider?.full_name || 'Unknown'}
        profileLink={`/providers/${item.provider?.id}`}
        subtitle={item.event_type ? `${item.event_type} shoot` : 'Added to portfolio'}
        badge="Portfolio"
        badgeBg={T.coralLight}
        badgeColor={T.coral}
        badgeIcon={Image}
        time={timeAgo(item.created_at)}
      />

      {/* Full width image */}
      {item.image_url && (
        <div className="w-full" style={{ maxHeight: 400, overflow: 'hidden' }}>
          <img
            src={item.image_url}
            alt={item.title || 'Portfolio'}
            className="w-full object-cover"
            style={{ maxHeight: 400 }}
          />
        </div>
      )}

      {/* Caption */}
      {(item.title || item.description) && (
        <div className="px-4 py-3 border-b" style={{ borderColor: T.border }}>
          {item.title && (
            <p className="text-sm font-semibold mb-0.5" style={{ color: T.navy }}>
              {item.title}
            </p>
          )}
          {item.description && (
            <p className="text-xs leading-relaxed" style={{ color: T.textMuted }}>
              {item.description}
            </p>
          )}
        </div>
      )}

      <ActionBar
        itemId={String(item.id)}
        itemType="portfolio"
        currentUser={currentUser}
        isLiked={isLiked}
        isSaved={isSaved}
        shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/providers/${item.provider?.id}`}
        shareText={`Check out this work by ${item.provider?.full_name} on Vogue Events`}
      />
    </div>
  )
}