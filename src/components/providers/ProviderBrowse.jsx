'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, MapPin, Star, Briefcase, CheckCircle, Filter, X } from 'lucide-react'

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

export default function ProviderBrowse({ providers, categories }) {
  const [search, setSearch]         = useState('')
  const [selectedCategory, setCategory] = useState('')
  const [selectedLocation, setLocation] = useState('')

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

  const hasFilters = search || selectedCategory || selectedLocation

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: T.navy }}>
          Find Providers
        </h1>
        <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>
          {filtered.length} verified professional{filtered.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Search + filters */}
      <div
        className="bg-white border p-3 mb-5 flex flex-col sm:flex-row gap-3"
        style={{ borderColor: T.border, borderRadius: 4 }}
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: T.textLight }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, skill, or location..."
            className="w-full pl-9 pr-3 py-2 text-sm border outline-none"
            style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
            onFocus={e => e.target.style.borderColor = T.navy}
            onBlur={e => e.target.style.borderColor = T.border}
          />
        </div>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={e => setCategory(e.target.value)}
          className="px-3 py-2 text-sm border outline-none bg-white"
          style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Location */}
        <input
          type="text"
          value={selectedLocation}
          onChange={e => setLocation(e.target.value)}
          placeholder="Location..."
          className="px-3 py-2 text-sm border outline-none sm:w-40"
          style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
          onFocus={e => e.target.style.borderColor = T.navy}
          onBlur={e => e.target.style.borderColor = T.border}
        />

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border flex-shrink-0"
            style={{ borderColor: T.border, borderRadius: 4, color: T.textMuted }}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Provider grid */}
      {filtered.length === 0 ? (
        <div
          className="bg-white border py-20 text-center"
          style={{ borderColor: T.border, borderRadius: 4 }}
        >
          <p className="text-sm font-medium" style={{ color: T.textMuted }}>
            No providers match your search
          </p>
          <button
            onClick={clearFilters}
            className="mt-3 text-xs font-medium"
            style={{ color: T.coral }}
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
      className="bg-white border hover:border-slate-300 transition-colors block"
      style={{ borderColor: T.border, borderRadius: 4 }}
    >
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-12 h-12 flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
            style={{ background: T.navy, borderRadius: 6 }}
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold truncate" style={{ color: T.navy }}>
                {provider.full_name}
              </span>
              {provider.is_verified && (
                <CheckCircle size={13} strokeWidth={1.5} className="text-blue-500 flex-shrink-0" />
              )}
            </div>
            {provider.location && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} strokeWidth={1.5} style={{ color: T.textLight }} />
                <span className="text-xs truncate" style={{ color: T.textLight }}>
                  {provider.location}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {provider.bio && (
          <p
            className="text-xs leading-relaxed mb-3 line-clamp-2"
            style={{ color: T.textMuted }}
          >
            {provider.bio}
          </p>
        )}

        {/* Categories */}
        {categoryNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {categoryNames.map(name => (
              <span
                key={name}
                className="text-xs font-medium px-2 py-0.5"
                style={{ background: T.coralLight, color: T.coral, borderRadius: 4 }}
              >
                {name}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div
          className="flex items-center gap-4 pt-3 border-t"
          style={{ borderColor: T.border }}
        >
          {provider.average_rating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={11} strokeWidth={1.5} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold" style={{ color: T.navy }}>
                {Number(provider.average_rating).toFixed(1)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Briefcase size={11} strokeWidth={1.5} style={{ color: T.textLight }} />
            <span className="text-xs" style={{ color: T.textLight }}>
              {provider.completed_events || 0} events
            </span>
          </div>
          {provider.years_experience && (
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: T.textLight }}>
                {provider.years_experience}yr exp
              </span>
            </div>
          )}
          <span
            className="ml-auto text-xs font-medium"
            style={{ color: T.coral }}
          >
            View Profile →
          </span>
        </div>
      </div>
    </Link>
  )
}