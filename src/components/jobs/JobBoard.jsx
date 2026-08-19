'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, SlidersHorizontal, MapPin, DollarSign,
  Users, Clock, ChevronDown, X,
  ArrowRight, Lock, Plus
} from 'lucide-react'
import { formatBudget } from '@/lib/currency'
import { PRODUCT_NAME } from '@/lib/brand'
import Akwukwo from '@/components/motifs/Akwukwo'

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function JobBoard({ initialJobs, categories, profile }) {
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
          <h1 className="t-h1 text-ink">Job Board</h1>
          <p className="text-sm mt-0.5 text-ink-2">
            {filteredJobs.length} open job{filteredJobs.length !== 1 ? 's' : ''} available
          </p>
        </div>
        {(profile?.role === 'hirer' || profile?.role === 'both') && (
          <Link
            href="/jobs/new"
            className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 flex-shrink-0
                       rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep"
          >
            <Plus size={14} strokeWidth={2.5} />
            Post a Job
          </Link>
        )}
      </div>

      {/* Search + filter bar */}
      <div className="bg-surface border border-line rounded-md p-3 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, category, or location…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-line rounded-xs outline-none text-ink
                       placeholder:text-ink-3 focus:border-terracotta transition-colors"
          />
        </div>

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-xs
                      transition-colors flex-shrink-0 ${
            activeFilters > 0
              ? 'border-terracotta text-terracotta bg-terracotta-soft'
              : 'border-line text-ink-2 bg-surface'
          }`}
        >
          <SlidersHorizontal size={14} strokeWidth={1.5} />
          Filters
          {activeFilters > 0 && (
            <span className="text-xs font-bold px-1.5 py-0.5 text-white rounded-[3px] bg-terracotta">
              {activeFilters}
            </span>
          )}
        </button>

        {(search || activeFilters > 0) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 border border-line
                       rounded-xs text-ink-2 transition-colors hover:bg-cream"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="bg-surface border border-line rounded-md p-4 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="t-label block mb-1.5 text-ink-2">
              Category
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={e => setCategory(e.target.value)}
                className="w-full appearance-none px-3 py-2 text-sm border border-line rounded-xs outline-none
                           bg-surface text-ink focus:border-terracotta transition-colors"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown size={12} strokeWidth={1.5}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-3" />
            </div>
          </div>

          <div>
            <label className="t-label block mb-1.5 text-ink-2">
              Location
            </label>
            <input
              type="text"
              value={selectedLocation}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Lagos, Abuja…"
              className="w-full px-3 py-2 text-sm border border-line rounded-xs outline-none text-ink
                         placeholder:text-ink-3 focus:border-terracotta transition-colors"
            />
          </div>

          <div>
            <label className="t-label block mb-1.5 text-ink-2">
              Max Budget
            </label>
            <input
              type="number"
              value={budgetMax}
              onChange={e => setBudgetMax(e.target.value)}
              placeholder="e.g. 500000"
              min="0"
              className="w-full px-3 py-2 text-sm border border-line rounded-xs outline-none text-ink
                         placeholder:text-ink-3 focus:border-terracotta transition-colors"
            />
          </div>
        </div>
      )}

      {/* Guest banner */}
      {!isLoggedIn && (
        <div className="flex items-center gap-3 px-4 py-3 border border-terracotta rounded-md mb-5
                        flex-wrap bg-terracotta-soft">
          <Lock size={14} strokeWidth={1.5} className="text-terracotta flex-shrink-0" />
          <p className="text-sm flex-1 text-ink-2">
            Create a free account to bid on jobs and connect with hirers.
          </p>
          <div className="flex gap-2">
            <Link href="/signup"
              className="text-xs font-semibold px-3 py-1.5 text-white rounded-sm bg-terracotta
                         transition-colors hover:bg-terracotta-deep">
              Sign Up Free
            </Link>
            <Link href="/login"
              className="text-xs font-semibold px-3 py-1.5 border border-terracotta rounded-sm text-terracotta">
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
            <div className="bg-surface border border-line rounded-md py-16 text-center">
              {/* Akwụkwọ — leaf spray. */}
              <Akwukwo size={92} className="text-terracotta mx-auto mb-4 opacity-70" />
              <p className="text-sm font-medium text-ink-2">
                No jobs match your filters
              </p>
              <button onClick={clearFilters}
                className="mt-3 text-xs font-medium text-terracotta hover:text-terracotta-deep">
                Clear filters
              </button>
            </div>
          ) : (
            filteredJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
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
          <div className="bg-surface border border-line rounded-md overflow-hidden">
            <div className="px-4 py-2.5 border-b border-line bg-cream">
              <span className="t-micro text-ink-3">
                Browse by Category
              </span>
            </div>
            <div className="p-2 space-y-0.5">
              <button
                onClick={() => setCategory('')}
                className={`w-full text-left flex items-center justify-between px-3 py-2 text-sm
                            rounded-xs transition-colors hover:bg-cream ${
                  !selectedCategory ? 'text-terracotta font-semibold' : 'text-ink-2'
                }`}
              >
                <span>All Categories</span>
                <span className="text-xs text-ink-3">
                  {initialJobs.length}
                </span>
              </button>
              {categories.map(cat => {
                const count = initialJobs.filter(j => j.category?.id === cat.id).length
                if (count === 0) return null
                const active = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 text-sm
                                rounded-xs transition-colors hover:bg-cream ${
                      active ? 'text-terracotta font-semibold bg-terracotta-soft' : 'text-ink-2'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-[3px] ${
                      active ? 'bg-terracotta text-white' : 'bg-line text-ink-2'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Post a job CTA */}
          {(profile?.role === 'hirer' || profile?.role === 'both') && (
            <div className="border border-ink rounded-md p-4 bg-ink">
              <p className="t-micro mb-2 text-sand">
                Need Someone?
              </p>
              <p className="text-xs leading-relaxed mb-3 text-ink-3">
                Post a job and receive bids from verified professionals within hours.
              </p>
              <Link href="/jobs/new"
                className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-white
                           rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep">
                Post a Job <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* Guest CTA */}
          {!isLoggedIn && (
            <div className="border border-ink rounded-md p-4 bg-ink">
              <p className="t-micro mb-2 text-sand">
                Join {PRODUCT_NAME}
              </p>
              <p className="text-xs leading-relaxed mb-3 text-ink-3">
                Sign up free to bid on jobs and grow your events career.
              </p>
              <Link href="/signup"
                className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-white
                           rounded-sm bg-terracotta transition-colors hover:bg-terracotta-deep">
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
function JobCard({ job, isLoggedIn, isProvider, isVerified }) {
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
    <div className="bg-surface border border-line rounded-md hover:border-terracotta transition-colors group">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {job.category && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-xs bg-terracotta-soft text-terracotta">
                  {job.category.name}
                </span>
              )}
              <span className="text-xs px-2 py-0.5 border border-line rounded-xs text-ink-3">
                {job.event_type}
              </span>
              <span className="flex items-center gap-1 text-xs ml-auto text-ink-3">
                <Clock size={10} strokeWidth={1.5} />
                {timeAgo(job.created_at)}
              </span>
            </div>

            <Link href={`/jobs/${job.id}`}>
              <h3 className="t-h3 leading-snug mb-2.5 group-hover:underline text-ink">
                {job.title}
              </h3>
            </Link>

            {job.description && (
              <p className="text-xs leading-relaxed mb-3 line-clamp-2 text-ink-2">
                {job.description}
              </p>
            )}

            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-ink-2">
                <MapPin size={11} strokeWidth={1.5} className="text-ink-3" />
                {job.location}
              </span>
              <span className="flex items-center gap-1 text-xs text-ink-2">
                <DollarSign size={11} strokeWidth={1.5} className="text-ink-3" />
                {formatBudget(job.budget_min, job.budget_max, job.currency)}
              </span>
              <span className="flex items-center gap-1 text-xs text-ink-2">
                <Users size={11} strokeWidth={1.5} className="text-ink-3" />
                {job.bids_count} bid{job.bids_count !== 1 ? 's' : ''}
              </span>
              {job.event_date && (
                <span className="flex items-center gap-1 text-xs text-ink-2">
                  <Clock size={11} strokeWidth={1.5} className="text-ink-3" />
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
              className={`text-xs font-semibold px-4 py-2 rounded-sm transition-colors ${
                canBid
                  ? 'bg-terracotta text-white hover:bg-terracotta-deep'
                  : 'bg-cream text-ink-2 border border-line'
              }`}
            >
              {canBid ? 'Place Bid' : (
                <span className="flex items-center gap-1">
                  <Lock size={11} strokeWidth={1.5} />
                  {bidButtonLabel()}
                </span>
              )}
            </button>
            {job.hirer && (
              <span className="text-xs text-ink-3">
                by {job.hirer.full_name?.split(' ')[0]}
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
