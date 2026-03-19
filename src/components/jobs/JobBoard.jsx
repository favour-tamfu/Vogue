'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, SlidersHorizontal, MapPin, DollarSign,
  Users, Clock, ChevronDown, X, Briefcase,
  ArrowRight, Lock, Plus
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
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function formatBudget(min, max, currency) {
  const symbols = {
    USD: '$', EUR: '€', GBP: '£', NGN: '₦',
    GHS: 'GH₵', KES: 'KSh', ZAR: 'R',
    XAF: 'FCFA', XOF: 'CFA', CAD: 'CA$', AUD: 'A$'
  }
  const sym = symbols[currency] || (currency || '$')
  if (min) return `${sym}${Number(min).toLocaleString()} – ${sym}${Number(max).toLocaleString()}`
  return `Up to ${sym}${Number(max).toLocaleString()}`
}

export default function JobBoard({ initialJobs, categories, profile }) {
  const router = useRouter()

  const [search, setSearch]           = useState('')
  const [selectedCategory, setCategory] = useState('')
  const [selectedLocation, setLocation] = useState('')
  const [budgetMax, setBudgetMax]     = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const isLoggedIn = !!profile
  const isProvider = profile?.role === 'provider' || profile?.role === 'both'
  const isVerified = profile?.is_verified

  const filteredJobs = useMemo(() => {
    return initialJobs.filter(job => {
      const matchSearch = !search ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        (job.description || '').toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase())
      const matchCategory = !selectedCategory || job.category?.id === selectedCategory
      const matchLocation = !selectedLocation ||
        job.location.toLowerCase().includes(selectedLocation.toLowerCase())
      const matchBudget = !budgetMax || job.budget_max <= parseInt(budgetMax)
      return matchSearch && matchCategory && matchLocation && matchBudget
    })
  }, [initialJobs, search, selectedCategory, selectedLocation, budgetMax])

  const activeFilters = [selectedCategory, selectedLocation, budgetMax].filter(Boolean).length

  const clearFilters = () => {
    setCategory('')
    setLocation('')
    setBudgetMax('')
    setSearch('')
  }

  return (
    <div>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: T.navy }}>Job Board</h1>
          <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
            {filteredJobs.length} open job{filteredJobs.length !== 1 ? 's' : ''} available
          </p>
        </div>
        {(profile?.role === 'hirer' || profile?.role === 'both') && (
          <Link
            href="/jobs/new"
            className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 flex-shrink-0"
            style={{ background: T.coral, borderRadius: 4 }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Post a Job
          </Link>
        )}
      </div>

      {/* Search + filter bar */}
      <div
        className="bg-white border p-3 mb-5 flex flex-col sm:flex-row gap-3"
        style={{ borderColor: T.border, borderRadius: 4 }}
      >
        <div className="relative flex-1">
          <Search size={14} strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: T.textLight }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, category, or location..."
            className="w-full pl-9 pr-3 py-2 text-sm border outline-none"
            style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
            onFocus={e => e.target.style.borderColor = T.navy}
            onBlur={e => e.target.style.borderColor = T.border}
          />
        </div>

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-colors flex-shrink-0"
          style={{
            borderColor: activeFilters > 0 ? T.coral : T.border,
            borderRadius: 4,
            color:        activeFilters > 0 ? T.coral : T.textMuted,
            background:   activeFilters > 0 ? T.coralLight : '#fff',
          }}
        >
          <SlidersHorizontal size={14} strokeWidth={1.5} />
          Filters
          {activeFilters > 0 && (
            <span className="text-xs font-bold px-1.5 py-0.5 text-white"
              style={{ background: T.coral, borderRadius: 3 }}>
              {activeFilters}
            </span>
          )}
        </button>

        {(search || activeFilters > 0) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 border"
            style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div
          className="bg-white border p-4 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-4"
          style={{ borderColor: T.border, borderRadius: 4 }}
        >
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: T.navyMid }}>
              Category
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={e => setCategory(e.target.value)}
                className="w-full appearance-none px-3 py-2 text-sm border outline-none bg-white"
                style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown size={12} strokeWidth={1.5}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: T.textLight }} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: T.navyMid }}>
              Location
            </label>
            <input
              type="text"
              value={selectedLocation}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Lagos, London..."
              className="w-full px-3 py-2 text-sm border outline-none"
              style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
              onFocus={e => e.target.style.borderColor = T.navy}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: T.navyMid }}>
              Max Budget
            </label>
            <input
              type="number"
              value={budgetMax}
              onChange={e => setBudgetMax(e.target.value)}
              placeholder="e.g. 1000"
              min="0"
              className="w-full px-3 py-2 text-sm border outline-none"
              style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
              onFocus={e => e.target.style.borderColor = T.navy}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>
        </div>
      )}

      {/* Guest banner */}
      {!isLoggedIn && (
        <div
          className="flex items-center gap-3 px-4 py-3 border mb-5 flex-wrap"
          style={{ background: T.coralLight, borderColor: T.coral, borderRadius: 4 }}
        >
          <Lock size={14} strokeWidth={1.5} style={{ color: T.coral, flexShrink: 0 }} />
          <p className="text-sm flex-1" style={{ color: T.navyMid }}>
            Create a free account to bid on jobs and connect with hirers.
          </p>
          <div className="flex gap-2">
            <Link href="/signup"
              className="text-xs font-semibold px-3 py-1.5 text-white"
              style={{ background: T.coral, borderRadius: 4 }}>
              Sign Up Free
            </Link>
            <Link href="/login"
              className="text-xs font-semibold px-3 py-1.5 border"
              style={{ borderColor: T.coral, borderRadius: 4, color: T.coral }}>
              Log In
            </Link>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Job list */}
        <div className="lg:col-span-2 space-y-3">
          {filteredJobs.length === 0 ? (
            <div
              className="bg-white border py-16 text-center"
              style={{ borderColor: T.border, borderRadius: 4 }}
            >
              <Briefcase size={32} strokeWidth={1}
                style={{ color: T.textLight, margin: '0 auto 12px' }} />
              <p className="text-sm font-medium" style={{ color: T.textMuted }}>
                No jobs match your filters
              </p>
              <button onClick={clearFilters} className="mt-3 text-xs font-medium"
                style={{ color: T.coral }}>
                Clear filters
              </button>
            </div>
          ) : (
            filteredJobs.map((job, i) => (
              <JobCard
                key={job.id}
                job={job}
                index={i}
                isLoggedIn={isLoggedIn}
                isProvider={isProvider}
                isVerified={isVerified}
              />
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-4">

          {/* Category filter */}
          <div className="bg-white border overflow-hidden"
            style={{ borderColor: T.border, borderRadius: 4 }}>
            <div className="px-4 py-2.5 border-b"
              style={{ borderColor: T.border, background: T.bg }}>
              <span className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: T.textLight }}>
                Browse by Category
              </span>
            </div>
            <div className="p-2 space-y-0.5">
              <button
                onClick={() => setCategory('')}
                className="w-full text-left flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-slate-50"
                style={{
                  borderRadius: 4,
                  color:      !selectedCategory ? T.coral : T.textMuted,
                  fontWeight: !selectedCategory ? 600 : 400,
                }}
              >
                <span>All Categories</span>
                <span className="text-xs" style={{ color: T.textLight }}>
                  {initialJobs.length}
                </span>
              </button>
              {categories.map(cat => {
                const count = initialJobs.filter(j => j.category?.id === cat.id).length
                if (count === 0) return null
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className="w-full text-left flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-slate-50"
                    style={{
                      borderRadius: 4,
                      color:      selectedCategory === cat.id ? T.coral : T.textMuted,
                      fontWeight: selectedCategory === cat.id ? 600 : 400,
                      background: selectedCategory === cat.id ? T.coralLight : 'transparent',
                    }}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs px-1.5 py-0.5"
                      style={{
                        borderRadius: 3,
                        background: selectedCategory === cat.id ? T.coral : T.border,
                        color:      selectedCategory === cat.id ? '#fff' : T.textMuted,
                      }}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Post a job CTA */}
          {(profile?.role === 'hirer' || profile?.role === 'both') && (
            <div className="border p-4"
              style={{ background: T.navy, borderColor: T.navy, borderRadius: 4 }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: '#FFD3AC' }}>
                Need Someone?
              </p>
              <p className="text-xs leading-relaxed mb-3" style={{ color: T.textLight }}>
                Post a job and receive bids from verified professionals within hours.
              </p>
              <Link href="/jobs/new"
                className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-white"
                style={{ background: T.coral, borderRadius: 4 }}>
                Post a Job <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* Guest CTA */}
          {!isLoggedIn && (
            <div className="border p-4"
              style={{ background: T.navy, borderColor: T.navy, borderRadius: 4 }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: '#FFD3AC' }}>
                Join Vogue
              </p>
              <p className="text-xs leading-relaxed mb-3" style={{ color: T.textLight }}>
                Sign up free to bid on jobs and grow your events career.
              </p>
              <Link href="/signup"
                className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-white"
                style={{ background: T.coral, borderRadius: 4 }}>
                Create Account <ArrowRight size={13} />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Job Card ──
function JobCard({ job, index, isLoggedIn, isProvider, isVerified }) {
  const router = useRouter()

  const handleBid = () => {
    if (!isLoggedIn) { router.push('/signup'); return }
    router.push(`/jobs/${job.id}`)
  }

  const bidButtonLabel = () => {
    if (!isLoggedIn) return 'Sign Up to Bid'
    if (!isProvider) return 'Hirer Account'
    if (!isVerified) return 'Verify to Bid'
    return 'Place Bid'
  }

  const canBid = isLoggedIn && isProvider && isVerified

  return (
    <div
      className="bg-white border hover:border-slate-300 transition-colors group"
      style={{ borderColor: T.border, borderRadius: 4 }}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {job.category && (
                <span className="text-xs font-medium px-2 py-0.5"
                  style={{ background: T.coralLight, color: T.coral, borderRadius: 4 }}>
                  {job.category.name}
                </span>
              )}
              <span className="text-xs px-2 py-0.5 border"
                style={{ borderColor: T.border, borderRadius: 4, color: T.textLight }}>
                {job.event_type}
              </span>
              <span className="flex items-center gap-1 text-xs ml-auto"
                style={{ color: T.textLight }}>
                <Clock size={10} strokeWidth={1.5} />
                {timeAgo(job.created_at)}
              </span>
            </div>

            <Link href={`/jobs/${job.id}`}>
              <h3 className="text-sm font-semibold leading-snug mb-2.5 group-hover:underline"
                style={{ color: T.navy }}>
                {job.title}
              </h3>
            </Link>

            {job.description && (
              <p className="text-xs leading-relaxed mb-3 line-clamp-2"
                style={{ color: T.textMuted }}>
                {job.description}
              </p>
            )}

            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1 text-xs" style={{ color: T.textMuted }}>
                <MapPin size={11} strokeWidth={1.5} style={{ color: T.textLight }} />
                {job.location}
              </span>
              <span className="flex items-center gap-1 text-xs" style={{ color: T.textMuted }}>
                <DollarSign size={11} strokeWidth={1.5} style={{ color: T.textLight }} />
                {formatBudget(job.budget_min, job.budget_max, job.currency)}
              </span>
              <span className="flex items-center gap-1 text-xs" style={{ color: T.textMuted }}>
                <Users size={11} strokeWidth={1.5} style={{ color: T.textLight }} />
                {job.bids_count} bid{job.bids_count !== 1 ? 's' : ''}
              </span>
              {job.event_date && (
                <span className="flex items-center gap-1 text-xs" style={{ color: T.textMuted }}>
                  <Clock size={11} strokeWidth={1.5} style={{ color: T.textLight }} />
                  {new Date(job.event_date).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col items-end gap-2">
            <button
              onClick={handleBid}
              className="text-xs font-semibold px-4 py-2 transition-opacity"
              style={{
                background:   canBid ? T.coral : T.bg,
                color:        canBid ? '#fff'  : T.textMuted,
                borderRadius: 4,
                border:       canBid ? 'none'  : `1px solid ${T.border}`,
              }}
            >
              {canBid ? 'Place Bid' : (
                <span className="flex items-center gap-1">
                  <Lock size={11} strokeWidth={1.5} />
                  {bidButtonLabel()}
                </span>
              )}
            </button>
            {job.hirer && (
              <span className="text-xs" style={{ color: T.textLight }}>
                by {job.hirer.full_name?.split(' ')[0]}
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}