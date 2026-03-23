'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  MapPin, Star, Briefcase, CheckCircle,
  Clock, Heart, Share2, MessageSquare,
  ChevronLeft, Award, Calendar, Image
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

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const days  = Math.floor(diff / 86400000)
  const months = Math.floor(days / 30)
  if (days < 1)   return 'Today'
  if (days < 30)  return `${days}d ago`
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
        title: `${provider.full_name} on Vogue Events`,
        url:   window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Profile link copied!')
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
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70"
        style={{ color: T.textMuted }}
      >
        <ChevronLeft size={14} strokeWidth={1.5} /> Browse Providers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── LEFT — Profile card ── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Main profile card */}
          <div className="bg-white border p-5"
            style={{ borderColor: T.border, borderRadius: 4 }}>

            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-5">
              <div
                className="w-20 h-20 flex items-center justify-center text-white text-2xl font-bold mb-3"
                style={{ background: T.navy, borderRadius: 8 }}
              >
                {provider.avatar_url ? (
                  <img
                    src={provider.avatar_url}
                    alt={provider.full_name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  provider.full_name?.charAt(0) || '?'
                )}
              </div>

              {/* Name + verified */}
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-bold" style={{ color: T.navy }}>
                  {provider.full_name}
                </h1>
                {provider.is_verified && (
                  <CheckCircle size={16} strokeWidth={1.5} className="text-blue-500" />
                )}
              </div>

              {/* Location */}
              {provider.location && (
                <div className="flex items-center gap-1 mb-3">
                  <MapPin size={12} strokeWidth={1.5} style={{ color: T.textLight }} />
                  <span className="text-sm" style={{ color: T.textMuted }}>
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
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-200'
                      }
                    />
                  ))}
                  <span className="text-sm font-semibold" style={{ color: T.navy }}>
                    {Number(provider.average_rating).toFixed(1)}
                  </span>
                  <span className="text-xs" style={{ color: T.textLight }}>
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
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border transition-all"
                    style={{
                      borderColor: following ? T.coral : T.border,
                      background:  following ? T.coralLight : '#fff',
                      color:       following ? T.coral : T.textMuted,
                      borderRadius: 4,
                    }}
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
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border transition-colors hover:bg-slate-50"
                    style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}
                  >
                    <Share2 size={13} strokeWidth={1.5} />
                  </button>
                </div>
              )}

              {isOwnProfile && (
                <Link
                  href="/profile/edit"
                  className="w-full flex items-center justify-center text-xs font-medium py-2 border transition-colors hover:bg-slate-50"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}
                >
                  Edit Profile
                </Link>
              )}
            </div>

            {/* Stats */}
            <div
              className="grid grid-cols-3 gap-2 pt-4 border-t"
              style={{ borderColor: T.border }}
            >
              {[
                { label: 'Events',  value: provider.completed_events || 0, icon: Briefcase },
                { label: 'Rating',  value: provider.average_rating ? Number(provider.average_rating).toFixed(1) : '—', icon: Star },
                { label: 'Exp.',    value: provider.years_experience ? `${provider.years_experience}yr` : '—', icon: Clock },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-lg font-bold" style={{ color: T.navy }}>
                    {stat.value}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: T.textLight }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="bg-white border p-4"
              style={{ borderColor: T.border, borderRadius: 4 }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ color: T.textLight }}>
                Services
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <span
                    key={cat.id}
                    className="text-xs font-medium px-2.5 py-1"
                    style={{
                      background:   T.coralLight,
                      color:        T.coral,
                      borderRadius: 4,
                    }}
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verified badge */}
          {provider.is_verified && (
            <div
              className="border p-4 flex items-start gap-3"
              style={{ background: '#EFF6FF', borderColor: '#BFDBFE', borderRadius: 4 }}
            >
              <CheckCircle size={15} strokeWidth={1.5} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-900">Verified Professional</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Identity and credentials verified by Vogue Events
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ── RIGHT — Tabs ── */}
        <div className="lg:col-span-2">

          {/* Tab nav */}
          <div
            className="flex items-center bg-white border mb-4 p-1"
            style={{ borderColor: T.border, borderRadius: 4 }}
          >
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 py-2 text-xs font-semibold transition-all"
                style={{
                  borderRadius: 3,
                  background: activeTab === tab.key ? T.navy : 'transparent',
                  color:      activeTab === tab.key ? '#fff' : T.textMuted,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── About tab ── */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              {provider.bio ? (
                <div className="bg-white border p-5"
                  style={{ borderColor: T.border, borderRadius: 4 }}>
                  <p className="text-xs font-semibold tracking-widest uppercase mb-3"
                    style={{ color: T.textLight }}>About</p>
                  <p className="text-sm leading-relaxed" style={{ color: T.textMuted }}>
                    {provider.bio}
                  </p>
                </div>
              ) : (
                <div className="bg-white border p-8 text-center"
                  style={{ borderColor: T.border, borderRadius: 4 }}>
                  <p className="text-sm" style={{ color: T.textLight }}>
                    No bio added yet
                  </p>
                </div>
              )}

              {/* Details grid */}
              <div className="bg-white border p-5"
                style={{ borderColor: T.border, borderRadius: 4 }}>
                <p className="text-xs font-semibold tracking-widest uppercase mb-4"
                  style={{ color: T.textLight }}>Details</p>
                <div className="space-y-3">
                  {[
                    { icon: MapPin,    label: 'Location',    value: provider.location },
                    { icon: Clock,     label: 'Experience',  value: provider.years_experience ? `${provider.years_experience} years` : null },
                    { icon: Briefcase, label: 'Events done', value: provider.completed_events ? `${provider.completed_events} events` : '0 events' },
                    { icon: Award,     label: 'Member since',value: new Date(provider.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) },
                  ].filter(d => d.value).map(detail => (
                    <div key={detail.label} className="flex items-center gap-3">
                      <detail.icon size={14} strokeWidth={1.5}
                        style={{ color: T.textLight, flexShrink: 0 }} />
                      <span className="text-xs" style={{ color: T.textLight }}>
                        {detail.label}
                      </span>
                      <span className="text-xs font-medium ml-auto" style={{ color: T.navyMid }}>
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
                <div className="bg-white border p-12 text-center"
                  style={{ borderColor: T.border, borderRadius: 4 }}>
                  <Image size={32} strokeWidth={1}
                    style={{ color: T.textLight, margin: '0 auto 12px' }} />
                  <p className="text-sm font-medium" style={{ color: T.textMuted }}>
                    No portfolio items yet
                  </p>
                  <p className="text-xs mt-1" style={{ color: T.textLight }}>
                    This provider hasn't uploaded any work yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.map(item => (
                    <div
                      key={item.id}
                      className="relative aspect-square bg-gray-100 border overflow-hidden group cursor-pointer"
                      style={{ borderColor: T.border, borderRadius: 4 }}
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title || 'Portfolio item'}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image size={24} strokeWidth={1} style={{ color: T.textLight }} />
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div
                        className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent)' }}
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
                <div className="bg-white border p-12 text-center"
                  style={{ borderColor: T.border, borderRadius: 4 }}>
                  <Star size={32} strokeWidth={1}
                    style={{ color: T.textLight, margin: '0 auto 12px' }} />
                  <p className="text-sm font-medium" style={{ color: T.textMuted }}>
                    No reviews yet
                  </p>
                  <p className="text-xs mt-1" style={{ color: T.textLight }}>
                    Reviews appear after completed hires
                  </p>
                </div>
              ) : (
                reviews.map(review => (
                  <div
                    key={review.id}
                    className="bg-white border p-5"
                    style={{ borderColor: T.border, borderRadius: 4 }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: T.navy, borderRadius: 4 }}
                        >
                          {review.reviewer?.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: T.navy }}>
                            {review.reviewer?.full_name}
                          </p>
                          <p className="text-xs capitalize" style={{ color: T.textLight }}>
                            {review.reviewer?.org_type || 'Hirer'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs" style={{ color: T.textLight }}>
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
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200'
                          }
                        />
                      ))}
                      <span className="text-xs font-semibold ml-1" style={{ color: T.navy }}>
                        {review.rating}/5
                      </span>
                    </div>

                    {review.comment && (
                      <p className="text-sm leading-relaxed" style={{ color: T.textMuted }}>
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