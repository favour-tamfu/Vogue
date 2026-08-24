'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  MapPin, Star, Briefcase, Clock, Heart, Share2,
  ChevronLeft, Award, Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import VerifiedBadge from '@/components/ui/VerifiedBadge'
import { PRODUCT_NAME } from '@/lib/brand'
import Akwukwo from '@/components/motifs/Akwukwo'

function timeAgo(dateStr) {
  const diff   = Date.now() - new Date(dateStr).getTime()
  const days   = Math.floor(diff / 86400000)
  const months = Math.floor(days / 30)
  if (days < 1)    return 'Today'
  if (days < 30)   return `${days}d ago`
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

export default function ProviderProfile({
  provider, categories, portfolio, reviews, currentUser, isFollowing
}) {
  const router   = useRouter()
  const supabase = createClient()

  const [following, setFollowing]   = useState(isFollowing)
  const [activeTab, setActiveTab]   = useState('about')
  const [followLoading, setFollowLoading] = useState(false)
  const [copied, setCopied]         = useState(false)

  const isOwnProfile = currentUser?.id === provider.id
  const isLoggedIn   = !!currentUser

  const handleFollow = async () => {
    if (!isLoggedIn) { router.push('/login'); return }
    setFollowLoading(true)

    if (following) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', provider.id)
      setFollowing(false)
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: currentUser.id, following_id: provider.id })
      setFollowing(true)
    }

    setFollowLoading(false)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${provider.full_name} on ${PRODUCT_NAME}`,
        url:   window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const tabs = [
    { key: 'about',     label: 'About'     },
    { key: 'portfolio', label: `Portfolio (${portfolio.length})` },
    { key: 'reviews',   label: `Reviews (${reviews.length})`    },
  ]

  return (
    <div>
      {/* Back */}
      <Link
        href="/providers"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70 text-ink-2"
      >
        <ChevronLeft size={14} strokeWidth={1.5} /> Browse Providers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── LEFT — Profile card ── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Main profile card */}
          <div className="bg-surface border border-line rounded-md p-5">

            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-20 h-20 flex items-center justify-center text-white text-2xl font-bold
                              mb-3 bg-ink rounded-sm overflow-hidden">
                {provider.avatar_url ? (
                  <img
                    src={provider.avatar_url}
                    alt={provider.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  provider.full_name?.charAt(0) || '?'
                )}
              </div>

              {/* Name + verified */}
              <div className="flex items-center gap-2 mb-1">
                <h1 className="t-h2 text-ink">
                  {provider.full_name}
                </h1>
                {provider.is_verified && <VerifiedBadge />}
              </div>

              {/* Location */}
              {provider.location && (
                <div className="flex items-center gap-1 mb-3">
                  <MapPin size={12} strokeWidth={1.5} className="text-ink-3" />
                  <span className="text-sm text-ink-2">
                    {provider.location}
                  </span>
                </div>
              )}

              {/* Rating */}
              {provider.average_rating > 0 && (
                <div className="flex items-center gap-1.5 mb-4">
                  {[1,2,3,4,5].map(star => (
                    <Star
                      key={star}
                      size={14}
                      strokeWidth={1.5}
                      className={star <= Math.round(provider.average_rating)
                        ? 'fill-ochre text-ochre'
                        : 'text-line'
                      }
                    />
                  ))}
                  <span className="text-sm font-semibold t-money text-ink">
                    {Number(provider.average_rating).toFixed(1)}
                  </span>
                  <span className="text-xs text-ink-3">
                    ({reviews.length} reviews)
                  </span>
                </div>
              )}

              {/* Action buttons */}
              {!isOwnProfile && (
                <div className="flex gap-2 w-full">
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold
                                border rounded-sm transition-all ${
                      following
                        ? 'border-terracotta bg-terracotta-soft text-terracotta'
                        : 'border-line bg-surface text-ink-2'
                    }`}
                  >
                    <Heart
                      size={13}
                      strokeWidth={1.5}
                      className={following ? 'fill-current' : ''}
                    />
                    {following ? 'Following' : 'Follow'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium
                               border border-line rounded-sm text-ink-2 transition-colors hover:bg-cream"
                  >
                    <Share2 size={13} strokeWidth={1.5} />
                  </button>
                </div>
              )}

              {copied && (
                <p className="text-xs mt-2 text-verified">Profile link copied</p>
              )}

              {isOwnProfile && (
                <Link
                  href="/profile/edit"
                  className="w-full flex items-center justify-center text-xs font-medium py-2 border border-line
                             rounded-sm text-ink-2 transition-colors hover:bg-cream"
                >
                  Edit Profile
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-line">
              {[
                { label: 'Events',  value: provider.completed_events || 0 },
                { label: 'Rating',  value: provider.average_rating ? Number(provider.average_rating).toFixed(1) : '—' },
                { label: 'Exp.',    value: provider.years_experience ? `${provider.years_experience}yr` : '—' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-lg t-money text-ink">
                    {stat.value}
                  </div>
                  <div className="text-xs mt-0.5 text-ink-3">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="bg-surface border border-line rounded-md p-4">
              <p className="t-micro mb-3 text-ink-3">
                Services
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <span
                    key={cat.id}
                    className="text-xs font-medium px-2.5 py-1 rounded-xs bg-terracotta-soft text-terracotta"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verified */}
          {provider.is_verified && (
            <div className="border border-line rounded-md p-4 flex items-start gap-3 bg-verified-bg">
              <div>
                <VerifiedBadge />
                <p className="text-xs text-verified mt-2">
                  Identity and credentials verified by {PRODUCT_NAME}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ── RIGHT — Tabs ── */}
        <div className="lg:col-span-2">

          {/* Tab nav */}
          <div className="flex items-center bg-surface border border-line rounded-xs mb-4 p-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 text-xs font-semibold rounded-[3px] transition-all ${
                  activeTab === tab.key ? 'bg-ink text-white' : 'text-ink-2'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── About tab ── */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              {provider.bio ? (
                <div className="bg-surface border border-line rounded-md p-5">
                  <p className="t-micro mb-3 text-ink-3">About</p>
                  <p className="text-sm leading-relaxed text-ink-2">
                    {provider.bio}
                  </p>
                </div>
              ) : (
                <div className="bg-surface border border-line rounded-md p-8 text-center">
                  <p className="text-sm text-ink-3">
                    No bio added yet
                  </p>
                </div>
              )}

              {/* Details grid */}
              <div className="bg-surface border border-line rounded-md p-5">
                <p className="t-micro mb-4 text-ink-3">Details</p>
                <div className="space-y-3">
                  {[
                    { icon: MapPin,    label: 'Location',    value: provider.location },
                    { icon: Clock,     label: 'Experience',  value: provider.years_experience ? `${provider.years_experience} years` : null },
                    { icon: Briefcase, label: 'Events done', value: provider.completed_events ? `${provider.completed_events} events` : '0 events' },
                    { icon: Award,     label: 'Member since',value: new Date(provider.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) },
                  ].filter(d => d.value).map(detail => (
                    <div key={detail.label} className="flex items-center gap-3">
                      <detail.icon size={14} strokeWidth={1.5} className="text-ink-3 flex-shrink-0" />
                      <span className="text-xs text-ink-3">
                        {detail.label}
                      </span>
                      <span className="text-xs font-medium ml-auto text-ink-2">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Portfolio tab ── */}
          {activeTab === 'portfolio' && (
            <div>
              {portfolio.length === 0 ? (
                <div className="bg-surface border border-line rounded-md p-12 text-center">
                  <Akwukwo size={88} className="text-terracotta mx-auto mb-4 opacity-70" />
                  <p className="text-sm font-medium text-ink-2">
                    No portfolio items yet
                  </p>
                  <p className="text-xs mt-1 text-ink-3">
                    This provider hasn&apos;t uploaded any work yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.map(item => (
                    <div
                      key={item.id}
                      className="relative aspect-square bg-cream-2 border border-line rounded-xs
                                 overflow-hidden group cursor-pointer"
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title || 'Portfolio item'}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={24} strokeWidth={1} className="text-ink-3" />
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div
                        className="absolute inset-0 flex flex-col justify-end p-3 opacity-0
                                   group-hover:opacity-100 transition-opacity"
                        style={{ background: 'linear-gradient(to top, rgba(43,33,24,0.85), transparent)' }}
                      >
                        {item.title && (
                          <p className="text-xs font-semibold text-white truncate">
                            {item.title}
                          </p>
                        )}
                        {item.event_type && (
                          <p className="text-xs text-white/70">{item.event_type}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Reviews tab ── */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="bg-surface border border-line rounded-md p-12 text-center">
                  <Akwukwo size={88} className="text-terracotta mx-auto mb-4 opacity-70" />
                  <p className="text-sm font-medium text-ink-2">
                    No reviews yet
                  </p>
                  <p className="text-xs mt-1 text-ink-3">
                    Reviews appear after completed hires
                  </p>
                </div>
              ) : (
                reviews.map(review => (
                  <div
                    key={review.id}
                    className="bg-surface border border-line rounded-md p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center text-white text-xs
                                        font-bold flex-shrink-0 bg-ink rounded-xs">
                          {review.reviewer?.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink">
                            {review.reviewer?.full_name}
                          </p>
                          <p className="text-xs capitalize text-ink-3">
                            {review.reviewer?.org_type || 'Hirer'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-ink-3">
                        {timeAgo(review.created_at)}
                      </span>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-2">
                      {[1,2,3,4,5].map(star => (
                        <Star
                          key={star}
                          size={13}
                          strokeWidth={1.5}
                          className={star <= review.rating
                            ? 'fill-ochre text-ochre'
                            : 'text-line'
                          }
                        />
                      ))}
                      <span className="text-xs font-semibold ml-1 t-money text-ink">
                        {review.rating}/5
                      </span>
                    </div>

                    {review.comment && (
                      <p className="text-sm leading-relaxed text-ink-2">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
