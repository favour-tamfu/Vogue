'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Star, MapPin, DollarSign, Users,
  Heart, Bookmark, Share2, CheckCircle,
  Briefcase, Image as ImageIcon, UserPlus, ArrowRight,
  Award
} from 'lucide-react'
import VerifiedBadge from '@/components/ui/VerifiedBadge'
import { formatBudget } from '@/lib/currency'
import { PRODUCT_NAME } from '@/lib/brand'
import Akwukwo from '@/components/motifs/Akwukwo'

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

// ── Shared action bar used by every card ──
function ActionBar({ itemId, itemType, currentUser, isLiked, isSaved, onLike, onSave, shareUrl, shareText }) {
  const [liked, setLiked]   = useState(isLiked)
  const [saved, setSaved]   = useState(isSaved)
  const [busy, setBusy]     = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  const handleLike = async () => {
    if (!currentUser || busy) return
    setBusy(true)
    if (liked) {
      await supabase.from('feed_likes').delete()
        .eq('user_id', currentUser.id).eq('item_id', itemId)
      setLiked(false)
    } else {
      await supabase.from('feed_likes').insert({
        user_id: currentUser.id, item_id: itemId, item_type: itemType
      })
      setLiked(true)
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
    const text = shareText || `Check this out on ${PRODUCT_NAME}`
    if (navigator.share) {
      navigator.share({ title: text, url })
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-1 px-4 py-2.5 border-t border-line">
      {/* Like */}
      <button
        onClick={handleLike}
        disabled={!currentUser}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs transition-colors hover:bg-cream disabled:opacity-40"
        title={!currentUser ? 'Log in to like' : liked ? 'Unlike' : 'Like'}
      >
        <Heart
          size={16}
          strokeWidth={1.5}
          className={`transition-colors ${liked ? 'fill-terracotta text-terracotta' : 'text-ink-3'}`}
        />
        <span className={`text-xs font-medium ${liked ? 'text-terracotta' : 'text-ink-3'}`}>
          Like
        </span>
      </button>

      {/* Save — only for portfolio items */}
      {itemType === 'portfolio' && (
        <button
          onClick={handleSave}
          disabled={!currentUser}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs transition-colors hover:bg-cream disabled:opacity-40"
          title={!currentUser ? 'Log in to save' : saved ? 'Unsave' : 'Save'}
        >
          <Bookmark
            size={16}
            strokeWidth={1.5}
            className={`transition-colors ${saved ? 'fill-current text-terracotta' : 'text-ink-3'}`}
          />
          <span className={`text-xs font-medium ${saved ? 'text-terracotta' : 'text-ink-3'}`}>
            {saved ? 'Saved' : 'Save'}
          </span>
        </button>
      )}

      {/* Share */}
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs transition-colors hover:bg-cream"
      >
        <Share2 size={16} strokeWidth={1.5} className="text-ink-3" />
        <span className="text-xs font-medium text-ink-3">{copied ? 'Copied' : 'Share'}</span>
      </button>
    </div>
  )
}

// ── Shared card header ──
function CardHeader({ avatarInitial, avatarUrl, name, profileLink, subtitle, badge, badgeClassName, badgeIcon: BadgeIcon, time }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3.5 border-b border-line">
      <div className="flex items-center gap-3">
        <Link href={profileLink || '#'}>
          <div className="w-9 h-9 flex items-center justify-center text-white text-sm font-bold
                          flex-shrink-0 overflow-hidden bg-ink rounded-sm">
            {avatarUrl
              ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              : (avatarInitial || '?')
            }
          </div>
        </Link>
        <div>
          <Link href={profileLink || '#'}>
            <span className="text-sm font-semibold hover:underline text-ink">
              {name}
            </span>
          </Link>
          {subtitle && (
            <p className="text-xs mt-0.5 text-ink-3">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-xs ${badgeClassName}`}>
          {BadgeIcon && <BadgeIcon size={10} strokeWidth={1.5} />}
          {badge}
        </span>
        <span className="text-xs text-ink-3">{time}</span>
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
        <h1 className="t-h1 text-ink">Live Feed</h1>
        <p className="text-sm mt-0.5 text-ink-2">
          What&apos;s happening on the platform
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center bg-surface border border-line rounded-xs p-1 mb-5 overflow-x-auto">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-4 py-1.5 text-xs font-semibold rounded-[3px] transition-all ${
              filter === f.key ? 'bg-ink text-white' : 'text-ink-2'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-surface border border-line rounded-md py-16 text-center">
            {/* Akwụkwọ — leaf spray. */}
            <Akwukwo size={92} className="text-terracotta mx-auto mb-4 opacity-70" />
            <p className="text-sm text-ink-2">Nothing here yet</p>
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
    <div className="bg-surface border border-line rounded-md overflow-hidden">

      <CardHeader
        avatarInitial={provider.full_name?.charAt(0)}
        avatarUrl={provider.avatar_url}
        name={provider.full_name}
        profileLink={`/providers/${provider.id}`}
        subtitle={provider.location}
        badge="New Provider"
        badgeClassName="bg-ochre-soft text-ochre-text"
        badgeIcon={UserPlus}
        time={timeAgo(provider.created_at)}
      />

      {/* Content */}
      <div className="px-4 py-4">
        {/* Verified */}
        <div className="mb-3">
          <VerifiedBadge />
        </div>

        {/* Bio */}
        {provider.bio && (
          <p className="text-sm leading-relaxed mb-3 line-clamp-3 text-ink-2">
            {provider.bio}
          </p>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {categories.map(name => (
              <span key={name}
                className="text-xs font-medium px-2.5 py-1 rounded-xs bg-terracotta-soft text-terracotta">
                {name}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/providers/${provider.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 text-white
                     rounded-sm bg-ink transition-opacity hover:opacity-90"
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
        shareText={`Check out ${provider.full_name} on ${PRODUCT_NAME}`}
      />
    </div>
  )
}

// ── New Job Card ──
function JobCard({ job, currentUser, isLiked }) {
  const canBid = currentUser?.role === 'provider' || currentUser?.role === 'both'

  return (
    <div className="bg-surface border border-line rounded-md overflow-hidden">

      <CardHeader
        avatarInitial={job.hirer?.full_name?.charAt(0)}
        name={job.hirer?.full_name || 'Anonymous'}
        profileLink="#"
        subtitle="Posted a new job"
        badge="New Job"
        badgeClassName="bg-ochre-soft text-ochre-text"
        badgeIcon={Briefcase}
        time={timeAgo(job.created_at)}
      />

      <div className="px-4 py-4">
        <Link href={`/jobs/${job.id}`}>
          <h3 className="t-h2 mb-3 hover:underline text-ink">
            {job.title}
          </h3>
        </Link>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {job.category && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-xs bg-terracotta-soft text-terracotta">
              {job.category.name}
            </span>
          )}
          <span className="text-xs px-2.5 py-1 border border-line rounded-xs text-ink-3">
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
            <div key={i} className="flex items-center gap-2 p-2.5 border border-line rounded-xs bg-cream">
              <meta.icon size={12} strokeWidth={1.5} className="text-ink-3 flex-shrink-0" />
              <span className="text-xs truncate text-ink-2">{meta.value}</span>
            </div>
          ))}
        </div>

        <Link
          href={`/jobs/${job.id}`}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 text-white
                      rounded-sm transition-colors ${
            canBid ? 'bg-terracotta hover:bg-terracotta-deep' : 'bg-ink hover:opacity-90'
          }`}
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
        shareText={`${job.title} — open for bids on ${PRODUCT_NAME}`}
      />
    </div>
  )
}

// ── Review Card ──
function ReviewCard({ review, currentUser, isLiked }) {
  return (
    <div className="bg-surface border border-line rounded-md overflow-hidden">

      <CardHeader
        avatarInitial={review.reviewer?.full_name?.charAt(0)}
        avatarUrl={review.reviewer?.avatar_url}
        name={review.reviewer?.full_name || 'Anonymous'}
        profileLink="#"
        subtitle={`Reviewed ${review.reviewee?.full_name}`}
        badge="Event Completed"
        badgeClassName="bg-verified-bg text-verified"
        badgeIcon={CheckCircle}
        time={timeAgo(review.created_at)}
      />

      <div className="px-4 py-4">
        {/* Who was reviewed */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-ink-2">
            Rating for{' '}
            <Link href={`/providers/${review.reviewee?.id}`}>
              <span className="font-semibold hover:underline text-terracotta">
                {review.reviewee?.full_name}
              </span>
            </Link>
          </span>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1.5 mb-3">
          {[1,2,3,4,5].map(star => (
            <Star key={star} size={18} strokeWidth={1.5}
              className={star <= review.rating ? 'fill-ochre text-ochre' : 'text-line'} />
          ))}
          <span className="text-sm ml-1 t-money text-ink">
            {review.rating}.0 / 5
          </span>
        </div>

        {/* Job reference */}
        {review.hire?.job && (
          <div className="flex items-center gap-2 mb-3 p-2.5 border border-line rounded-xs bg-cream">
            <Award size={12} strokeWidth={1.5} className="text-ink-3" />
            <span className="text-xs text-ink-2">
              {review.hire.job.event_type} — {review.hire.job.title}
            </span>
          </div>
        )}

        {/* Comment */}
        {review.comment && (
          <div className="p-3 border-l-2 ml-1 border-terracotta">
            <p className="text-sm leading-relaxed italic text-ink-2">
              &ldquo;{review.comment}&rdquo;
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
        shareText={`${review.reviewee?.full_name} got a ${review.rating}/5 review on ${PRODUCT_NAME}`}
      />
    </div>
  )
}

// ── Portfolio Card ──
function PortfolioCard({ item, currentUser, isLiked, isSaved }) {
  return (
    <div className="bg-surface border border-line rounded-md overflow-hidden">

      <CardHeader
        avatarInitial={item.provider?.full_name?.charAt(0)}
        avatarUrl={item.provider?.avatar_url}
        name={item.provider?.full_name || 'Unknown'}
        profileLink={`/providers/${item.provider?.id}`}
        subtitle={item.event_type ? `${item.event_type} shoot` : 'Added to portfolio'}
        badge="Portfolio"
        badgeClassName="bg-terracotta-soft text-terracotta"
        badgeIcon={ImageIcon}
        time={timeAgo(item.created_at)}
      />

      {/* Full width image */}
      {item.image_url && (
        <div className="w-full" style={{ maxHeight: 400, overflow: 'hidden' }}>
          <img
            src={item.image_url}
            alt={item.title || 'Portfolio'}
            loading="lazy"
            className="w-full object-cover"
            style={{ maxHeight: 400 }}
          />
        </div>
      )}

      {/* Caption */}
      {(item.title || item.description) && (
        <div className="px-4 py-3 border-b border-line">
          {item.title && (
            <p className="text-sm font-semibold mb-0.5 text-ink">
              {item.title}
            </p>
          )}
          {item.description && (
            <p className="text-xs leading-relaxed text-ink-2">
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
        shareText={`Check out this work by ${item.provider?.full_name} on ${PRODUCT_NAME}`}
      />
    </div>
  )
}
