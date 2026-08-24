'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, MapPin, Star, Briefcase, ChevronDown, X } from 'lucide-react'
import Akwukwo from '@/components/motifs/Akwukwo'
import VerifiedBadge from '@/components/ui/VerifiedBadge'

export default function ProviderBrowse({ providers, categories }) {
  const [search, setSearch]         = useState('')
  const [selectedCategory, setCategory] = useState('')
  const [selectedLocation, setLocation] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filtered = useMemo(() => {
    return providers.filter(p => {
      const matchSearch = !search ||
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.bio?.toLowerCase().includes(search.toLowerCase()) ||
        p.location?.toLowerCase().includes(search.toLowerCase())

      const matchCategory = !selectedCategory ||
        p.provider_categories?.some(pc => pc.category?.id === selectedCategory)

      const matchLocation = !selectedLocation ||
        p.location?.toLowerCase().includes(selectedLocation.toLowerCase())

      return matchSearch && matchCategory && matchLocation
    })
  }, [providers, search, selectedCategory, selectedLocation])

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setLocation('')
  }

  const activeFilters = [selectedCategory, selectedLocation].filter(Boolean).length
  const hasFilters = search || activeFilters > 0

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="t-h1 text-ink">
          Providers
        </h1>
        <p className="text-sm mt-0.5 text-ink-2">
          {filtered.length} verified professional{filtered.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Search + filter bar — same pattern as the job board. Narrowing a
          list is one mental task and should not be two different UIs. */}
      <div className="bg-surface border border-line rounded-md p-3 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, skill, or location…"
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

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-line rounded-xs
                       flex-shrink-0 text-ink-2 transition-colors hover:bg-cream"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="bg-surface border border-line rounded-md p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="t-label block mb-1.5 text-ink-2">Category</label>
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
            <label className="t-label block mb-1.5 text-ink-2">Location</label>
            <input
              type="text"
              value={selectedLocation}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Lagos, Abuja…"
              className="w-full px-3 py-2 text-sm border border-line rounded-xs outline-none text-ink
                         placeholder:text-ink-3 focus:border-terracotta transition-colors"
            />
          </div>
        </div>
      )}

      {/* Provider grid */}
      {filtered.length === 0 ? (
        <div className="bg-surface border border-line rounded-md py-20 text-center">
          {/* Akwụkwọ — leaf spray. */}
          <Akwukwo size={92} className="text-terracotta mx-auto mb-4 opacity-70" />
          <p className="text-sm font-medium text-ink-2">
            No providers match your search
          </p>
          <button
            onClick={clearFilters}
            className="mt-3 text-xs font-medium text-terracotta hover:text-terracotta-deep"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(provider => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProviderCard({ provider }) {
  const categoryNames = provider.provider_categories
    ?.map(pc => pc.category?.name)
    .filter(Boolean)
    .slice(0, 3) || []

  return (
    <Link
      href={`/providers/${provider.id}`}
      className="bg-surface border border-line rounded-md hover:border-terracotta transition-colors block"
    >
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 flex items-center justify-center text-white text-lg font-bold
                          flex-shrink-0 bg-ink rounded-sm overflow-hidden">
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold truncate text-ink">
                {provider.full_name}
              </span>
              {provider.is_verified && <VerifiedBadge />}
            </div>
            {provider.location && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} strokeWidth={1.5} className="text-ink-3" />
                <span className="text-xs truncate text-ink-3">
                  {provider.location}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {provider.bio && (
          <p className="text-xs leading-relaxed mb-3 line-clamp-2 text-ink-2">
            {provider.bio}
          </p>
        )}

        {/* Categories */}
        {categoryNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {categoryNames.map(name => (
              <span
                key={name}
                className="text-xs font-medium px-2 py-0.5 rounded-xs bg-terracotta-soft text-terracotta"
              >
                {name}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 pt-3 border-t border-line">
          {provider.average_rating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={11} strokeWidth={1.5} className="fill-ochre text-ochre" />
              <span className="text-xs font-semibold text-ink t-money">
                {Number(provider.average_rating).toFixed(1)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Briefcase size={11} strokeWidth={1.5} className="text-ink-3" />
            <span className="text-xs text-ink-3">
              {provider.completed_events || 0} events
            </span>
          </div>
          {provider.years_experience && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-ink-3">
                {provider.years_experience}yr exp
              </span>
            </div>
          )}
          <span className="ml-auto text-xs font-medium text-terracotta">
            View Profile →
          </span>
        </div>
      </div>
    </Link>
  )
}
