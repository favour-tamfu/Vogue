'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import {
  Briefcase, MapPin, Calendar, DollarSign,
  Users, Clock, FileText, ChevronRight,
  CheckCircle, AlertCircle, ArrowLeft, ChevronDown
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

const EVENT_TYPES = [
  'Wedding', 'Corporate Event', 'Birthday Party',
  'Concert / Live Show', 'Conference', 'Product Launch',
  'Funeral / Memorial', 'Festival', 'Private Dinner', 'Other',
]

const CURRENCIES = [
  { code: 'USD', symbol: '$',  label: 'US Dollar'       },
  { code: 'EUR', symbol: '€',  label: 'Euro'             },
  { code: 'GBP', symbol: '£',  label: 'British Pound'   },
  { code: 'NGN', symbol: '₦',  label: 'Nigerian Naira'  },
  { code: 'GHS', symbol: 'GH₵',label: 'Ghanaian Cedi'   },
  { code: 'KES', symbol: 'KSh',label: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R',  label: 'South African Rand' },
  { code: 'XAF', symbol: 'FCFA',label: 'Central African CFA' },
  { code: 'XOF', symbol: 'CFA',label: 'West African CFA'  },
  { code: 'CAD', symbol: 'CA$',label: 'Canadian Dollar'  },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar'},
]

const STEPS = [
  { id: 1, label: 'Job Details' },
  { id: 2, label: 'Event Info'  },
  { id: 3, label: 'Budget'      },
  { id: 4, label: 'Review'      },
]

export default function NewJobPage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile]       = useState(null)
  const [categories, setCategories] = useState([])
  const [step, setStep]             = useState(1)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [currencyOpen, setCurrencyOpen] = useState(false)

  // Location autocomplete state
  const [locationQuery, setLocationQuery]       = useState('')
  const [locationResults, setLocationResults]   = useState([])
  const [locationSearching, setLocationSearching] = useState(false)
  const [showLocationDrop, setShowLocationDrop] = useState(false)
  const debounceRef = useRef(null)

  const [form, setForm] = useState({
    title:          '',
    description:    '',
    event_type:     '',
    category_id:    '',
    event_date:     '',
    event_time:     '',
    location:       '',
    budget_min:     '',
    budget_max:     '',
    currency:       'USD',
    headcount:      '',
    duration_hours: '',
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: prof }, { data: cats }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('categories').select('*').order('name'),
      ])
      setProfile(prof)
      setCategories(cats || [])
    }
    load()
  }, [])

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  // Location search
  const searchLocation = (value) => {
    setLocationQuery(value)
    update('location', value)
    setShowLocationDrop(true)
    clearTimeout(debounceRef.current)
    if (value.length < 2) { setLocationResults([]); return }

    debounceRef.current = setTimeout(async () => {
      setLocationSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=6`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data = await res.json()
        const formatted = data.map(item => {
          const city = item.address.city || item.address.town || item.address.village || item.address.county || item.name
          const country = item.address.country
          return { label: `${city}, ${country}` }
        }).filter((item, i, self) =>
          i === self.findIndex(t => t.label === item.label)
        )
        setLocationResults(formatted)
      } catch { setLocationResults([]) }
      setLocationSearching(false)
    }, 400)
  }

  const selectLocation = (label) => {
    setLocationQuery(label)
    update('location', label)
    setShowLocationDrop(false)
    setLocationResults([])
  }

  const canProceed = () => {
    if (step === 1) return form.title.trim() && form.event_type && form.category_id
    if (step === 2) return form.event_date && form.location.trim()
    if (step === 3) return form.budget_max
    return true
  }

  const selectedCurrency = CURRENCIES.find(c => c.code === form.currency) || CURRENCIES[0]

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          budget_min:     form.budget_min     ? parseInt(form.budget_min)     : null,
          budget_max:     parseInt(form.budget_max),
          headcount:      form.headcount      ? parseInt(form.headcount)      : null,
          duration_hours: form.duration_hours ? parseInt(form.duration_hours) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); setLoading(false); return }
      router.push(`/jobs/${data.job.id}?posted=true`)
    } catch {
      setError('Network error — please try again')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ background: T.bg }}>
      <Navbar profile={profile} />

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-16">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70"
          style={{ color: T.textMuted }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Back
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold" style={{ color: T.navy }}>Post a Job</h1>
          <p className="text-sm mt-1" style={{ color: T.textMuted }}>
            The more specific you are, the better bids you'll receive.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className="w-7 h-7 flex items-center justify-center text-xs font-bold border-2 transition-all"
                  style={{
                    borderRadius: 4,
                    borderColor: step > s.id ? T.coral : step === s.id ? T.navy : T.border,
                    background:  step > s.id ? T.coral : step === s.id ? T.navy : '#fff',
                    color:       step >= s.id ? '#fff' : T.textLight,
                  }}
                >
                  {step > s.id ? <CheckCircle size={13} /> : s.id}
                </div>
                <span className="text-xs mt-1 font-medium hidden sm:block"
                  style={{ color: step === s.id ? T.navy : T.textLight }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-px flex-1 mx-1 mb-4 sm:mb-6"
                  style={{ background: step > s.id ? T.coral : T.border }} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white border" style={{ borderColor: T.border, borderRadius: 4 }}>

          {/* ── STEP 1 — Job Details ── */}
          {step === 1 && (
            <div className="p-5 sm:p-6 space-y-5">
              <SectionHeader icon={FileText} title="What do you need?" />

              <Field label="Job Title" required>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => update('title', e.target.value)}
                  placeholder="e.g. Photographer needed for wedding reception"
                  className="w-full px-3 py-2.5 text-sm border outline-none"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                  onFocus={e => e.target.style.borderColor = T.navy}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
              </Field>

              <Field label="Event Type" required>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EVENT_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => update('event_type', type)}
                      className="px-3 py-2 text-xs font-medium text-left border transition-all"
                      style={{
                        borderRadius: 4,
                        borderColor: form.event_type === type ? T.navy : T.border,
                        background:  form.event_type === type ? T.navy : '#fff',
                        color:       form.event_type === type ? '#fff' : T.textMuted,
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Service Category" required hint="What type of professional do you need?">
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => update('category_id', cat.id)}
                      className="px-3 py-2 text-xs font-medium text-left border transition-all"
                      style={{
                        borderRadius: 4,
                        borderColor: form.category_id === cat.id ? T.coral : T.border,
                        background:  form.category_id === cat.id ? T.coralLight : '#fff',
                        color:       form.category_id === cat.id ? T.coral : T.textMuted,
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Job Description" hint="Describe your requirements in detail">
                <textarea
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="Include style preferences, equipment needed, dress code, special requirements..."
                  rows={4}
                  className="w-full px-3 py-2.5 text-sm border outline-none resize-none"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                  onFocus={e => e.target.style.borderColor = T.navy}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
              </Field>
            </div>
          )}

          {/* ── STEP 2 — Event Info ── */}
          {step === 2 && (
            <div className="p-5 sm:p-6 space-y-5">
              <SectionHeader icon={Calendar} title="When and where?" />

              <Field label="Event Date" required>
                <input
                  type="date"
                  value={form.event_date}
                  onChange={e => update('event_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2.5 text-sm border outline-none"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                  onFocus={e => e.target.style.borderColor = T.navy}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
              </Field>

              <Field label="Event Time" hint="Optional">
                <input
                  type="time"
                  value={form.event_time}
                  onChange={e => update('event_time', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border outline-none"
                  style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                  onFocus={e => e.target.style.borderColor = T.navy}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
              </Field>

              {/* Location with autocomplete */}
              <Field label="Location" required hint="City or venue where the event takes place">
                <div className="relative">
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={e => searchLocation(e.target.value)}
                    placeholder="e.g. Victoria Island, Lagos"
                    autoComplete="off"
                    className="w-full px-3 py-2.5 text-sm border outline-none"
                    style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                    onFocus={e => { e.target.style.borderColor = T.navy; locationResults.length > 0 && setShowLocationDrop(true) }}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />

                  {/* Spinner */}
                  {locationSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <motion.div
                        className="w-4 h-4 border-2 border-t-transparent rounded-full"
                        style={{ borderColor: T.coral }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                  )}

                  {/* Dropdown */}
                  {showLocationDrop && locationResults.length > 0 && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 bg-white border overflow-hidden z-40"
                      style={{ borderColor: T.border, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    >
                      {locationResults.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => selectLocation(r.label)}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 text-sm border-b last:border-0 transition-colors hover:bg-slate-50"
                          style={{ borderColor: T.border, color: T.navyMid }}
                        >
                          <MapPin size={12} strokeWidth={1.5} style={{ color: T.textLight, flexShrink: 0 }} />
                          {r.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirmed location pill */}
                {form.location && !showLocationDrop && (
                  <div
                    className="flex items-center gap-2 mt-2 px-3 py-2 border"
                    style={{ borderColor: T.coral, background: T.coralLight, borderRadius: 4 }}
                  >
                    <MapPin size={12} strokeWidth={1.5} style={{ color: T.coral }} />
                    <span className="text-xs font-medium" style={{ color: T.coral }}>{form.location}</span>
                    <button
                      onClick={() => { setLocationQuery(''); update('location', '') }}
                      className="ml-auto text-xs hover:opacity-70"
                      style={{ color: T.coral }}
                    >
                      Change
                    </button>
                  </div>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Expected Guests" hint="Approx.">
                  <input
                    type="number"
                    value={form.headcount}
                    onChange={e => update('headcount', e.target.value)}
                    placeholder="e.g. 150"
                    min="1"
                    className="w-full px-3 py-2.5 text-sm border outline-none"
                    style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                    onFocus={e => e.target.style.borderColor = T.navy}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                </Field>
                <Field label="Duration (hrs)" hint="Optional">
                  <input
                    type="number"
                    value={form.duration_hours}
                    onChange={e => update('duration_hours', e.target.value)}
                    placeholder="e.g. 4"
                    min="1"
                    max="48"
                    className="w-full px-3 py-2.5 text-sm border outline-none"
                    style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                    onFocus={e => e.target.style.borderColor = T.navy}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ── STEP 3 — Budget ── */}
          {step === 3 && (
            <div className="p-5 sm:p-6 space-y-5">
              <SectionHeader icon={DollarSign} title="What's your budget?" />

              <div className="p-4 border" style={{ borderColor: T.border, borderRadius: 4, background: T.bg }}>
                <p className="text-xs" style={{ color: T.textMuted }}>
                  A clear budget range attracts better bids and saves time. Providers will see this before bidding.
                </p>
              </div>

              {/* Currency selector */}
              <Field label="Currency">
                <div className="relative">
                  <button
                    onClick={() => setCurrencyOpen(!currencyOpen)}
                    className="w-full flex items-center justify-between px-3 py-2.5 border text-sm transition-colors hover:bg-slate-50"
                    style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-semibold" style={{ color: T.coral }}>
                        {selectedCurrency.symbol}
                      </span>
                      <span>{selectedCurrency.code} — {selectedCurrency.label}</span>
                    </span>
                    <ChevronDown
                      size={14}
                      strokeWidth={1.5}
                      style={{ color: T.textLight, transform: currencyOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                    />
                  </button>

                  {currencyOpen && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 bg-white border overflow-hidden z-40 max-h-52 overflow-y-auto"
                      style={{ borderColor: T.border, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    >
                      {CURRENCIES.map(cur => (
                        <button
                          key={cur.code}
                          onClick={() => { update('currency', cur.code); setCurrencyOpen(false) }}
                          className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm border-b last:border-0 transition-colors hover:bg-slate-50"
                          style={{
                            borderColor: T.border,
                            background: form.currency === cur.code ? T.coralLight : '#fff',
                            color: T.navyMid,
                          }}
                        >
                          <span className="font-semibold w-8" style={{ color: T.coral }}>{cur.symbol}</span>
                          <span>{cur.code}</span>
                          <span style={{ color: T.textLight }}>— {cur.label}</span>
                          {form.currency === cur.code && (
                            <CheckCircle size={13} className="ml-auto" style={{ color: T.coral }} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>

              {/* Budget inputs */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Minimum Budget" hint="Optional">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold"
                      style={{ color: T.textLight }}>
                      {selectedCurrency.symbol}
                    </span>
                    <input
                      type="number"
                      value={form.budget_min}
                      onChange={e => update('budget_min', e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full pl-8 pr-3 py-2.5 text-sm border outline-none"
                      style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                      onFocus={e => e.target.style.borderColor = T.navy}
                      onBlur={e => e.target.style.borderColor = T.border}
                    />
                  </div>
                </Field>
                <Field label="Maximum Budget" required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold"
                      style={{ color: T.textLight }}>
                      {selectedCurrency.symbol}
                    </span>
                    <input
                      type="number"
                      value={form.budget_max}
                      onChange={e => update('budget_max', e.target.value)}
                      placeholder="500"
                      min="1"
                      className="w-full pl-8 pr-3 py-2.5 text-sm border outline-none"
                      style={{ borderColor: T.border, borderRadius: 4, color: T.navy }}
                      onFocus={e => e.target.style.borderColor = T.navy}
                      onBlur={e => e.target.style.borderColor = T.border}
                    />
                  </div>
                </Field>
              </div>

              {/* Budget preview */}
              {form.budget_max && (
                <div
                  className="p-4 border"
                  style={{ borderColor: T.coral, background: T.coralLight, borderRadius: 4 }}
                >
                  <p className="text-sm font-semibold" style={{ color: T.coral }}>
                    Budget:{' '}
                    {form.budget_min
                      ? `${selectedCurrency.symbol}${parseInt(form.budget_min).toLocaleString()} — ${selectedCurrency.symbol}${parseInt(form.budget_max).toLocaleString()}`
                      : `Up to ${selectedCurrency.symbol}${parseInt(form.budget_max).toLocaleString()}`
                    }
                    {' '}{form.currency}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
                    This is what providers will see when browsing your job
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4 — Review ── */}
          {step === 4 && (
            <div className="p-5 sm:p-6 space-y-4">
              <SectionHeader icon={CheckCircle} title="Review your job post" />

              <div className="space-y-2">
                {[
                  { icon: FileText,   label: 'Title',           value: form.title },
                  { icon: Briefcase,  label: 'Event Type',      value: form.event_type },
                  { icon: Briefcase,  label: 'Service Needed',  value: categories.find(c => c.id === form.category_id)?.name || '—' },
                  { icon: Calendar,   label: 'Event Date',      value: form.event_date ? new Date(form.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                  { icon: MapPin,     label: 'Location',        value: form.location },
                  { icon: DollarSign, label: 'Budget',          value: form.budget_min ? `${selectedCurrency.symbol}${parseInt(form.budget_min).toLocaleString()} — ${selectedCurrency.symbol}${parseInt(form.budget_max).toLocaleString()} ${form.currency}` : `Up to ${selectedCurrency.symbol}${parseInt(form.budget_max).toLocaleString()} ${form.currency}` },
                  form.headcount     && { icon: Users,  label: 'Guests',   value: `~${form.headcount} people` },
                  form.duration_hours && { icon: Clock, label: 'Duration', value: `${form.duration_hours} hours` },
                ].filter(Boolean).map(item => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 px-4 py-3 border"
                    style={{ borderColor: T.border, borderRadius: 4, background: T.bg }}
                  >
                    <item.icon size={13} strokeWidth={1.5} style={{ color: T.textLight, flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <span className="text-xs" style={{ color: T.textLight }}>{item.label}</span>
                      <p className="text-sm font-medium mt-0.5" style={{ color: T.navy }}>{item.value}</p>
                    </div>
                  </div>
                ))}

                {form.description && (
                  <div className="px-4 py-3 border" style={{ borderColor: T.border, borderRadius: 4, background: T.bg }}>
                    <span className="text-xs" style={{ color: T.textLight }}>Description</span>
                    <p className="text-sm mt-0.5 leading-relaxed" style={{ color: T.textMuted }}>{form.description}</p>
                  </div>
                )}
              </div>

              {error && (
                <div
                  className="flex items-center gap-2 p-3 border text-sm"
                  style={{ borderColor: '#FECACA', background: '#FFF5F5', borderRadius: 4, color: '#DC2626' }}
                >
                  <AlertCircle size={14} strokeWidth={1.5} /> {error}
                </div>
              )}
            </div>
          )}

          {/* Nav buttons */}
          <div
            className="flex items-center justify-between px-5 sm:px-6 py-4 border-t"
            style={{ borderColor: T.border }}
          >
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 border transition-colors hover:bg-slate-50"
              style={{
                borderColor: T.border, borderRadius: 4, color: T.textMuted,
                visibility: step === 1 ? 'hidden' : 'visible'
              }}
            >
              <ArrowLeft size={14} /> Back
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2 text-white transition-opacity"
                style={{ background: canProceed() ? T.navy : T.border, borderRadius: 4 }}
              >
                Continue <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-1.5 text-sm font-semibold px-6 py-2 text-white transition-opacity hover:opacity-90"
                style={{ background: T.coral, borderRadius: 4 }}
              >
                {loading ? 'Posting...' : 'Post Job'}
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 pb-4 border-b" style={{ borderColor: T.border }}>
      <Icon size={14} strokeWidth={1.5} style={{ color: T.textLight }} />
      <h2 className="text-sm font-semibold" style={{ color: T.navy }}>{title}</h2>
    </div>
  )
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline gap-1 mb-1.5">
        <label className="text-xs font-semibold" style={{ color: T.navyMid }}>{label}</label>
        {required && <span className="text-xs" style={{ color: T.coral }}>*</span>}
        {hint && <span className="text-xs" style={{ color: T.textLight }}>— {hint}</span>}
      </div>
      {children}
    </div>
  )
}