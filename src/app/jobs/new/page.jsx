'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Agwo from '@/components/motifs/Agwo'
import {
  Briefcase, MapPin, Calendar, DollarSign,
  Users, Clock, FileText, ChevronRight,
  CheckCircle, AlertCircle, ArrowLeft, ChevronDown
} from 'lucide-react'
import { DEFAULT_CURRENCY, symbolFor } from '@/lib/currency'

const EVENT_TYPES = [
  'Wedding', 'Corporate Event', 'Birthday Party',
  'Concert / Live Show', 'Conference', 'Product Launch',
  'Funeral / Memorial', 'Festival', 'Private Dinner', 'Other',
]

// Nigeria first — NGN leads the list and is the default.
const CURRENCIES = [
  { code: 'NGN', symbol: '₦',   label: 'Nigerian Naira'      },
  { code: 'GHS', symbol: 'GH₵', label: 'Ghanaian Cedi'       },
  { code: 'KES', symbol: 'KSh', label: 'Kenyan Shilling'     },
  { code: 'ZAR', symbol: 'R',   label: 'South African Rand'  },
  { code: 'XAF', symbol: 'FCFA',label: 'Central African CFA' },
  { code: 'XOF', symbol: 'CFA', label: 'West African CFA'    },
  { code: 'USD', symbol: '$',   label: 'US Dollar'           },
  { code: 'GBP', symbol: '£',   label: 'British Pound'       },
  { code: 'EUR', symbol: '€',   label: 'Euro'                },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar'     },
  { code: 'AUD', symbol: 'A$',  label: 'Australian Dollar'   },
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
    currency:       DEFAULT_CURRENCY,
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
  // TODO(CLAUDE.md §8 P1): this calls Nominatim directly from the browser, which
  // OSM's usage policy does not allow (no identifying User-Agent) and rate-limits
  // hard. Move behind an API route with a proper User-Agent and caching.
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
  const sym = symbolFor(form.currency)

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
    <div className="min-h-screen pb-20 md:pb-0 bg-cream">
      <Navbar profile={profile} />

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-16">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70 text-ink-2"
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Back
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="t-h1 text-ink">Post a Job</h1>
          <p className="text-sm mt-1 text-ink-2">
            The more specific you are, the better bids you&apos;ll receive.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-7 h-7 flex items-center justify-center text-xs font-bold border-2
                              rounded-xs transition-all ${
                    step > s.id  ? 'border-terracotta bg-terracotta text-white'
                  : step === s.id ? 'border-ink bg-ink text-white'
                  :                 'border-line bg-surface text-ink-3'
                  }`}
                >
                  {step > s.id ? <CheckCircle size={13} /> : s.id}
                </div>
                <span className={`text-xs mt-1 font-medium hidden sm:block ${
                  step === s.id ? 'text-ink' : 'text-ink-3'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 mx-1 mb-4 sm:mb-6 ${
                  step > s.id ? 'bg-terracotta' : 'bg-line'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-surface border border-line rounded-md">

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
                  className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none text-ink
                             placeholder:text-ink-3 focus:border-terracotta transition-colors"
                />
              </Field>

              <Field label="Event Type" required>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EVENT_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => update('event_type', type)}
                      className={`px-3 py-2 text-xs font-medium text-left border rounded-xs transition-all ${
                        form.event_type === type
                          ? 'border-ink bg-ink text-white'
                          : 'border-line bg-surface text-ink-2'
                      }`}
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
                      className={`px-3 py-2 text-xs font-medium text-left border rounded-xs transition-all ${
                        form.category_id === cat.id
                          ? 'border-terracotta bg-terracotta-soft text-terracotta'
                          : 'border-line bg-surface text-ink-2'
                      }`}
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
                  placeholder="Include style preferences, equipment needed, dress code, special requirements…"
                  rows={4}
                  className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none resize-none
                             text-ink placeholder:text-ink-3 focus:border-terracotta transition-colors"
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
                  className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none text-ink
                             focus:border-terracotta transition-colors"
                />
              </Field>

              <Field label="Event Time" hint="Optional">
                <input
                  type="time"
                  value={form.event_time}
                  onChange={e => update('event_time', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none text-ink
                             focus:border-terracotta transition-colors"
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
                    className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none text-ink
                               placeholder:text-ink-3 focus:border-terracotta transition-colors"
                    onFocus={() => { if (locationResults.length > 0) setShowLocationDrop(true) }}
                  />

                  {/* Spinner */}
                  {locationSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Agwo size={16} className="text-terracotta" />
                    </div>
                  )}

                  {/* Dropdown */}
                  {showLocationDrop && locationResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-line
                                    rounded-xs overflow-hidden z-40 shadow-lg">
                      {locationResults.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => selectLocation(r.label)}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 text-sm
                                     border-b border-line last:border-0 text-ink-2 transition-colors hover:bg-cream"
                        >
                          <MapPin size={12} strokeWidth={1.5} className="text-ink-3 flex-shrink-0" />
                          {r.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirmed location pill */}
                {form.location && !showLocationDrop && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 border border-terracotta
                                  rounded-xs bg-terracotta-soft">
                    <MapPin size={12} strokeWidth={1.5} className="text-terracotta" />
                    <span className="text-xs font-medium text-terracotta">{form.location}</span>
                    <button
                      onClick={() => { setLocationQuery(''); update('location', '') }}
                      className="ml-auto text-xs hover:opacity-70 text-terracotta"
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
                    className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none text-ink
                               placeholder:text-ink-3 focus:border-terracotta transition-colors"
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
                    className="w-full px-3 py-2.5 text-sm border border-line rounded-xs outline-none text-ink
                               placeholder:text-ink-3 focus:border-terracotta transition-colors"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ── STEP 3 — Budget ── */}
          {step === 3 && (
            <div className="p-5 sm:p-6 space-y-5">
              <SectionHeader icon={DollarSign} title="What's your budget?" />

              <div className="p-4 border border-line rounded-xs bg-cream">
                <p className="text-xs text-ink-2">
                  A clear budget range attracts better bids and saves time. Providers will see this before bidding.
                </p>
              </div>

              {/* Currency selector */}
              <Field label="Currency">
                <div className="relative">
                  <button
                    onClick={() => setCurrencyOpen(!currencyOpen)}
                    className="w-full flex items-center justify-between px-3 py-2.5 border border-line
                               rounded-xs text-sm text-ink transition-colors hover:bg-cream"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-terracotta">
                        {selectedCurrency.symbol}
                      </span>
                      <span>{selectedCurrency.code} — {selectedCurrency.label}</span>
                    </span>
                    <ChevronDown
                      size={14}
                      strokeWidth={1.5}
                      className="text-ink-3 transition-transform"
                      style={{ transform: currencyOpen ? 'rotate(180deg)' : 'none' }}
                    />
                  </button>

                  {currencyOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-line
                                    rounded-xs overflow-hidden z-40 max-h-52 overflow-y-auto shadow-lg">
                      {CURRENCIES.map(cur => (
                        <button
                          key={cur.code}
                          onClick={() => { update('currency', cur.code); setCurrencyOpen(false) }}
                          className={`w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm
                                      border-b border-line last:border-0 text-ink-2 transition-colors
                                      hover:bg-cream ${
                            form.currency === cur.code ? 'bg-terracotta-soft' : 'bg-surface'
                          }`}
                        >
                          <span className="font-semibold w-8 text-terracotta">{cur.symbol}</span>
                          <span>{cur.code}</span>
                          <span className="text-ink-3">— {cur.label}</span>
                          {form.currency === cur.code && (
                            <CheckCircle size={13} className="ml-auto text-terracotta" />
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-3">
                      {sym}
                    </span>
                    <input
                      type="number"
                      value={form.budget_min}
                      onChange={e => update('budget_min', e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full pl-8 pr-3 py-2.5 text-sm border border-line rounded-xs outline-none
                                 text-ink placeholder:text-ink-3 focus:border-terracotta transition-colors"
                    />
                  </div>
                </Field>
                <Field label="Maximum Budget" required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-3">
                      {sym}
                    </span>
                    <input
                      type="number"
                      value={form.budget_max}
                      onChange={e => update('budget_max', e.target.value)}
                      placeholder="250000"
                      min="1"
                      className="w-full pl-8 pr-3 py-2.5 text-sm border border-line rounded-xs outline-none
                                 text-ink placeholder:text-ink-3 focus:border-terracotta transition-colors"
                    />
                  </div>
                </Field>
              </div>

              {/* Budget preview */}
              {form.budget_max && (
                <div className="p-4 border border-terracotta rounded-xs bg-terracotta-soft">
                  <p className="text-sm font-semibold t-money text-terracotta">
                    Budget:{' '}
                    {form.budget_min
                      ? `${sym}${parseInt(form.budget_min).toLocaleString()} — ${sym}${parseInt(form.budget_max).toLocaleString()}`
                      : `Up to ${sym}${parseInt(form.budget_max).toLocaleString()}`
                    }
                    {' '}{form.currency}
                  </p>
                  <p className="text-xs mt-0.5 text-ink-2">
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
                  { icon: DollarSign, label: 'Budget',          value: form.budget_min ? `${sym}${parseInt(form.budget_min).toLocaleString()} — ${sym}${parseInt(form.budget_max).toLocaleString()} ${form.currency}` : `Up to ${sym}${parseInt(form.budget_max).toLocaleString()} ${form.currency}` },
                  form.headcount     && { icon: Users,  label: 'Guests',   value: `~${form.headcount} people` },
                  form.duration_hours && { icon: Clock, label: 'Duration', value: `${form.duration_hours} hours` },
                ].filter(Boolean).map(item => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 px-4 py-3 border border-line rounded-xs bg-cream"
                  >
                    <item.icon size={13} strokeWidth={1.5} className="text-ink-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-ink-3">{item.label}</span>
                      <p className="text-sm font-medium mt-0.5 text-ink">{item.value}</p>
                    </div>
                  </div>
                ))}

                {form.description && (
                  <div className="px-4 py-3 border border-line rounded-xs bg-cream">
                    <span className="text-xs text-ink-3">Description</span>
                    <p className="text-sm mt-0.5 leading-relaxed text-ink-2">{form.description}</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 border border-line rounded-xs text-sm
                                bg-danger-bg text-danger">
                  <AlertCircle size={14} strokeWidth={1.5} /> {error}
                </div>
              )}
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-line">
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 border border-line
                         rounded-sm text-ink-2 transition-colors hover:bg-cream"
              style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
            >
              <ArrowLeft size={14} /> Back
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className={`flex items-center gap-1.5 text-sm font-semibold px-5 py-2 text-white
                            rounded-sm transition-colors ${
                  canProceed() ? 'bg-ink hover:opacity-90' : 'bg-line cursor-not-allowed'
                }`}
              >
                Continue <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 text-sm font-semibold px-6 py-2 text-white rounded-sm
                           bg-terracotta transition-colors hover:bg-terracotta-deep disabled:opacity-50"
              >
                {loading && <Agwo size={14} className="text-white" />}
                {loading ? 'Posting…' : 'Post Job'}
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
    <div className="flex items-center gap-2 pb-4 border-b border-line">
      <Icon size={14} strokeWidth={1.5} className="text-ink-3" />
      <h2 className="t-h3 text-ink">{title}</h2>
    </div>
  )
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline gap-1 mb-1.5">
        <label className="t-label text-ink-2">{label}</label>
        {required && <span className="text-xs text-terracotta">*</span>}
        {hint && <span className="text-xs text-ink-3">— {hint}</span>}
      </div>
      {children}
    </div>
  )
}
