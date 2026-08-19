'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Anyanwu from '@/components/motifs/Anyanwu'
import Agwo from '@/components/motifs/Agwo'
import Isi from '@/components/motifs/Isi'
import Omumu from '@/components/motifs/Omumu'
import Akwukwo from '@/components/motifs/Akwukwo'
import MotifLayer from '@/components/motifs/MotifLayer'
import {
  Camera, Video, UtensilsCrossed, Disc3, Mic, Flower2, Sparkles, Speaker,
  ShieldCheck, Users, ClipboardList, Truck,
  Hand, MapPin, Target, PenLine, Check, ArrowRight, ArrowLeft,
  PartyPopper, Building2, Tent,
} from 'lucide-react'

const CATEGORIES = [
  { slug: 'photography',    label: 'Photography',     icon: Camera      },
  { slug: 'videography',    label: 'Videography',     icon: Video       },
  { slug: 'catering',       label: 'Catering',        icon: UtensilsCrossed },
  { slug: 'dj-music',       label: 'DJ & Music',      icon: Disc3       },
  { slug: 'mc-hosting',     label: 'MC & Hosting',    icon: Mic         },
  { slug: 'decor-florals',  label: 'Decor & Florals', icon: Flower2     },
  { slug: 'hair-makeup',    label: 'Hair & Makeup',   icon: Sparkles    },
  { slug: 'sound-lighting', label: 'Sound & Lighting',icon: Speaker     },
  { slug: 'security',       label: 'Security',        icon: ShieldCheck },
  { slug: 'staffing',       label: 'Staffing',        icon: Users       },
  { slug: 'event-planning', label: 'Event Planning',  icon: ClipboardList },
  { slug: 'logistics',      label: 'Logistics',       icon: Truck       },
]

const variants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
}

// ── Main component (not exported directly) ──
function OnboardingPage() {
  const supabase = createClient()
  const searchParams = useSearchParams()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [profile, setProfile] = useState({
    full_name: '',
    location: '',
    role: 'hirer',
    org_type: '',
    org_name: '',
    selectedCategories: [],
    years_experience: '',
    bio: '',
    avatar_url: '',
  })

  const update = (field, value) => setProfile(prev => ({ ...prev, [field]: value }))

  // ── Read role from URL on load ──
  useEffect(() => {
    const roleFromUrl = searchParams.get('role')

    if (roleFromUrl) {
      setProfile(prev => ({ ...prev, role: roleFromUrl }))
      return
    }

    // Fallback — fetch from database if no URL param
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(prev => ({
          ...prev,
          full_name: profileData.full_name || '',
          role: profileData.role || 'hirer'
        }))
      }
    }
    loadProfile()
  }, [supabase, searchParams])

  const next = () => {
    setDirection(1)
    setStep(s => s + 1)
  }

  const back = () => {
    setDirection(-1)
    setStep(s => s - 1)
  }

  const handleFinish = async () => {
    setSaving(true)
    setError(null)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user || userError) {
      setError(userError?.message || 'Not authenticated')
      setSaving(false)
      return
    }

    // Upsert so `location` is saved even if the profiles row doesn't exist yet
    const { error: profileUpsertError } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name:        profile.full_name,
        location:         profile.location,
        role:             profile.role,
        org_type:         profile.org_type || null,
        org_name:         profile.org_name || null,
        years_experience: profile.years_experience ? parseInt(profile.years_experience) : null,
        bio:              profile.bio,
      },
      { onConflict: 'id' }
    )

    if (profileUpsertError) {
      console.error('profiles upsert failed', profileUpsertError)
      setError(profileUpsertError.message)
      setSaving(false)
      return
    }

    if (profile.role !== 'hirer' && profile.selectedCategories.length > 0) {
      const { data: cats } = await supabase
        .from('categories')
        .select('id, slug')
        .in('slug', profile.selectedCategories)

      if (cats) {
        const rows = cats.map(c => ({ provider_id: user.id, category_id: c.id }))
        const { error: pcInsertError } = await supabase.from('provider_categories').insert(rows)
        if (pcInsertError) {
          console.error('provider_categories insert failed', pcInsertError)
          // Don't block dashboard redirect; provider_categories is secondary to `location` gating.
        }
      }
    }

    window.location.href = '/dashboard'
  }

  const steps = [
    <StepName key="name" profile={profile} update={update} onNext={next} />,
    <StepLocation key="location" profile={profile} update={update} onNext={next} onBack={back} />,

    ...(profile.role === 'hirer'
      ? [<StepOrgType key="org" profile={profile} update={update} onNext={next} onBack={back} />]
      : profile.role === 'provider'
      ? [<StepCategories key="cats" profile={profile} update={update} onNext={next} onBack={back} />]
      : [
          <StepOrgType key="org" profile={profile} update={update} onNext={next} onBack={back} />,
          <StepCategories key="cats" profile={profile} update={update} onNext={next} onBack={back} />,
        ]
    ),

    <StepBio key="bio" profile={profile} update={update} onNext={next} onBack={back} />,
    <StepDone key="done" profile={profile} onFinish={handleFinish} saving={saving} />,
  ]

  const progress = (step / (steps.length - 1)) * 100

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-12 bg-cream">

      {/* ── Anyanwụ — the sun. Onboarding's motif (§3.3.4). ──
          CSS-only: no animation library, so the ornament costs no JS. */}
      <MotifLayer>
        <Anyanwu
          size={420}
          className="motif-float absolute -top-32 -left-28 text-terracotta opacity-35"
          style={{ '--fd': '21s' }}
        />
        <Omumu
          animate={false}
          size={280}
          className="motif-float2 absolute -bottom-16 -right-16 text-terracotta opacity-30"
          style={{ '--fd': '26s', '--delay': '1.5s' }}
        />
        <Akwukwo
          animate={false}
          size={170}
          className="motif-float absolute top-1/3 -right-8 text-terracotta opacity-20 hidden xl:block"
          style={{ '--fd': '23s', '--delay': '2.8s' }}
        />
      </MotifLayer>

      {/* ── Progress bar ── */}
      {error && (
        <div
          className="w-full max-w-lg mb-6 p-3 bg-danger-bg border border-line text-danger rounded-xs text-sm"
          role="alert"
        >
          {error}
        </div>
      )}
      <div className="w-full max-w-lg mb-8" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex justify-between text-xs text-ink-3 mb-2">
          <span>Setting up your profile</span>
          <span>{step + 1} of {steps.length}</span>
        </div>
        <div className="h-1.5 bg-line rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-terracotta rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* ── Step card ── */}
      <div className="w-full max-w-lg overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────
// STEP 1 — Name
// ─────────────────────────────────────────
function StepName({ profile, update, onNext }) {
  return (
    <Card>
      <StepIcon icon={Hand} />
      <Title>What should we call you?</Title>
      <Subtitle>This is how you'll appear to others on the platform</Subtitle>

      <input
        type="text"
        value={profile.full_name}
        onChange={e => update('full_name', e.target.value)}
        placeholder="Your full name"
        className="w-full px-4 py-3 text-lg border-2 border-line rounded-xs text-ink focus:outline-none focus:border-terracotta transition-colors mt-6"
      />

      <div className="mt-4 p-3 bg-terracotta-soft rounded-xs">
        <span className="text-terracotta text-sm font-medium">
          Joining as: {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
        </span>
      </div>

      <div className="mt-6">
        <NextButton onClick={onNext} disabled={!profile.full_name.trim()} />
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────
// STEP 2 — Location
// ─────────────────────────────────────────
function StepLocation({ profile, update, onNext, onBack }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef(null)

  const search = (value) => {
    setQuery(value)
    update('location', value)
    setShowDropdown(true)

    clearTimeout(debounceRef.current)
    if (value.length < 2) { setResults([]); return }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=6&featuretype=city`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data = await res.json()
        const formatted = data.map(item => {
          const city = item.address.city || item.address.town || item.address.village || item.address.county || item.name
          const country = item.address.country
          return { label: `${city}, ${country}`, full: item.display_name }
        }).filter((item, index, self) =>
          index === self.findIndex(t => t.label === item.label)
        )
        setResults(formatted)
      } catch (e) {
        setResults([])
      }
      setSearching(false)
    }, 400)
  }

  const select = (label) => {
    setQuery(label)
    update('location', label)
    setShowDropdown(false)
    setResults([])
  }

  return (
    <Card>
      <StepIcon icon={MapPin} />
      <Title>Where are you based?</Title>
      <Subtitle>Start typing your city — we'll find it for you</Subtitle>

      <div className="relative mt-6">
        <input
          type="text"
          value={query}
          onChange={e => search(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true) }}
          placeholder="e.g. Lagos, Nairobi, London..."
          className="w-full px-4 py-3 text-lg border-2 border-line rounded-xs text-ink focus:outline-none focus:border-terracotta transition-colors"
          autoComplete="off"
        />

        {searching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Agwo size={18} className="text-terracotta" />
          </div>
        )}

        {showDropdown && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xs border border-line overflow-hidden shadow-lg"
            style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', zIndex: 50 }}
          >
            {results.map((result, i) => (
              <button
                key={i}
                onClick={() => select(result.label)}
                className="w-full text-left px-4 py-3 text-sm text-ink hover:bg-terracotta-soft hover:text-terracotta transition-colors flex items-center gap-3 border-b border-line last:border-0"
              >
                <MapPin size={14} strokeWidth={1.5} className="text-ink-3 flex-shrink-0" />
                <span>{result.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {profile.location && !showDropdown && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 p-3 bg-terracotta-soft rounded-xs flex items-center gap-2"
        >
          <MapPin size={14} strokeWidth={1.5} className="text-terracotta flex-shrink-0" />
          <span className="text-terracotta text-sm font-medium">{profile.location}</span>
          <button
            onClick={() => { setQuery(''); update('location', ''); }}
            className="ml-auto text-terracotta hover:text-terracotta text-xs"
          >
            change
          </button>
        </motion.div>
      )}

      <div className="flex gap-3 mt-6">
        <BackButton onClick={onBack} />
        <NextButton onClick={onNext} disabled={!profile.location.trim()} />
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────
// STEP 3A — Org Type (Hirers)
// ─────────────────────────────────────────
function StepOrgType({ profile, update, onNext, onBack }) {
  const ORG_TYPES = [
    { value: 'individual', label: 'Personal',      desc: 'Birthday parties, weddings, house events',  icon: PartyPopper, example: 'e.g. "I need a photographer for my wedding"' },
    { value: 'company',    label: 'Event Business', desc: 'You run or manage events professionally',   icon: Tent, example: "e.g. \"I'm an event planner hiring a caterer\"" },
    { value: 'corporate',  label: 'Corporate',      desc: 'Company events, launches, conferences',     icon: Building2, example: 'e.g. "Our company needs staff for a product launch"' },
  ]

  return (
    <Card>
      <StepIcon icon={Target} />
      <Title>What kind of events do you organise?</Title>
      <Subtitle>This helps providers understand your needs before they even bid</Subtitle>

      <div className="grid gap-3 mt-6">
        {ORG_TYPES.map(opt => (
          <button
            key={opt.value}
            onClick={() => update('org_type', opt.value)}
            className={`p-4 rounded-xs border-2 text-left transition-all ${
              profile.org_type === opt.value
                ? 'border-terracotta bg-terracotta-soft'
                : 'border-line hover:border-ink-3 bg-white/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <opt.icon size={20} strokeWidth={1.5} className="mt-0.5 flex-shrink-0 text-terracotta" />
              <div className="flex-1">
                <div className="font-semibold text-ink">{opt.label}</div>
                <div className="text-sm text-ink-2 mt-0.5">{opt.desc}</div>
                <div className={`text-xs mt-1.5 italic ${profile.org_type === opt.value ? 'text-terracotta' : 'text-ink-3'}`}>
                  {opt.example}
                </div>
              </div>
              {profile.org_type === opt.value && (
                <Check size={18} strokeWidth={2.5} className="text-terracotta self-center flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      {(profile.org_type === 'company' || profile.org_type === 'corporate') && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
          <input
            type="text"
            value={profile.org_name}
            onChange={e => update('org_name', e.target.value)}
            placeholder={profile.org_type === 'company' ? 'Your business name' : 'Your company name'}
            className="w-full px-4 py-3 border-2 border-line rounded-xs text-ink focus:outline-none focus:border-terracotta transition-colors"
          />
        </motion.div>
      )}

      <div className="flex gap-3 mt-6">
        <BackButton onClick={onBack} />
        <NextButton onClick={onNext} disabled={!profile.org_type} />
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────
// STEP 3B — Categories (Providers)
// ─────────────────────────────────────────
function StepCategories({ profile, update, onNext, onBack }) {
  const toggle = (slug) => {
    const current = profile.selectedCategories
    const updated = current.includes(slug)
      ? current.filter(s => s !== slug)
      : [...current, slug]
    update('selectedCategories', updated)
  }

  return (
    <Card>
      <StepIcon icon={Target} />
      <Title>What services do you offer?</Title>
      <Subtitle>Pick all that apply — you can change this later</Subtitle>

      <div className="grid grid-cols-3 gap-2 mt-6">
        {CATEGORIES.map(cat => {
          const selected = profile.selectedCategories.includes(cat.slug)
          return (
            <button
              key={cat.slug}
              onClick={() => toggle(cat.slug)}
              className={`p-3 rounded-xs border-2 text-center transition-all ${
                selected ? 'border-terracotta bg-terracotta-soft' : 'border-line hover:border-ink-3 bg-white'
              }`}
            >
              <cat.icon size={18} strokeWidth={1.5} className={`mx-auto mb-1.5 ${selected ? 'text-terracotta' : 'text-ink-3'}`} />
              <div className={`text-xs font-medium leading-tight ${selected ? 'text-terracotta' : 'text-ink-2'}`}>
                {cat.label}
              </div>
            </button>
          )
        })}
      </div>

      {profile.selectedCategories.length > 0 && (
        <p className="text-sm text-terracotta font-medium mt-3 text-center">
          {profile.selectedCategories.length} service{profile.selectedCategories.length > 1 ? 's' : ''} selected
        </p>
      )}

      <div className="flex gap-3 mt-6">
        <BackButton onClick={onBack} />
        <NextButton onClick={onNext} disabled={profile.selectedCategories.length === 0} />
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────
// STEP 4 — Bio + Experience
// ─────────────────────────────────────────
function StepBio({ profile, update, onNext, onBack }) {
  const isProvider = profile.role !== 'hirer'

  return (
    <Card>
      <StepIcon icon={PenLine} />
      <Title>Tell people about yourself</Title>
      <Subtitle>
        {isProvider ? 'This shows on your profile — make it count' : 'Help providers understand what kind of events you run'}
      </Subtitle>

      <textarea
        value={profile.bio}
        onChange={e => update('bio', e.target.value)}
        placeholder={isProvider
          ? "e.g. Award-winning photographer with 6 years specialising in weddings and corporate events across West Africa..."
          : "e.g. I organise corporate retreats and brand activations for mid-size companies..."}
        rows={4}
        className="w-full px-4 py-3 border-2 border-line rounded-xs text-ink focus:outline-none focus:border-terracotta transition-colors mt-6 resize-none"
      />

      {isProvider && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-ink-2 mb-2">Years of experience</label>
          <div className="flex gap-2 flex-wrap">
            {['1', '2', '3', '4', '5', '6–10', '10+'].map(yr => (
              <button
                key={yr}
                onClick={() => update('years_experience', yr)}
                className={`px-4 py-2 rounded-xs border-2 text-sm font-medium transition-all ${
                  profile.years_experience === yr
                    ? 'border-terracotta bg-terracotta-soft text-terracotta'
                    : 'border-line text-ink-2 hover:border-ink-3'
                }`}
              >
                {yr} {yr === '1' ? 'year' : 'years'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <BackButton onClick={onBack} />
        <NextButton onClick={onNext} disabled={!profile.bio.trim()} />
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────
// STEP 5 — Done
// ─────────────────────────────────────────
function StepDone({ profile, onFinish, saving }) {
  return (
    <Card>
      <div className="text-center py-4">
        {/* Ìsì — the knot, two lines becoming one. Setup complete. */}
        <Isi size={64} className="text-terracotta mx-auto mb-6" />
        <h2 className="t-h1 text-ink">
          You&apos;re all set, {profile.full_name.split(' ')[0]}
        </h2>
        <p className="text-ink-2 mt-2 mb-8">
          {profile.role === 'hirer'
            ? "Your account is ready. Start posting jobs and finding great talent."
            : "Your profile is ready. Start browsing jobs and winning contracts."}
        </p>

        <div className="bg-cream rounded-md p-4 text-left mb-8 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-ink-2">Name</span>
            <span className="font-medium text-ink">{profile.full_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-2">Location</span>
            <span className="font-medium text-ink">{profile.location}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-2">Role</span>
            <span className="font-medium text-ink capitalize">{profile.role}</span>
          </div>
          {profile.selectedCategories.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-ink-2">Services</span>
              <span className="font-medium text-ink">{profile.selectedCategories.length} selected</span>
            </div>
          )}
        </div>

        <button
          onClick={onFinish}
          disabled={saving}
          className="w-full bg-terracotta hover:bg-terracotta-deep text-white py-3 rounded-sm font-semibold text-base transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Go to my dashboard'}
        </button>
      </div>
    </Card>
  )
}

// ─────────────────────────────────────────
// Shared UI primitives
// ─────────────────────────────────────────
function Card({ children }) {
  return (
    <div className="rounded-md border border-line bg-surface p-8"
      style={{ boxShadow: '0 8px 32px rgba(43, 33, 24, 0.06), 0 2px 8px rgba(43, 33, 24, 0.04)' }}
    >
      {children}
    </div>
  )
}

function StepIcon({ icon: Icon }) {
  return (
    <div className="w-11 h-11 flex items-center justify-center mb-4 rounded-sm
                    bg-terracotta-soft text-terracotta">
      <Icon size={20} strokeWidth={1.5} />
    </div>
  )
}

function Title({ children }) {
  return <h2 className="text-2xl font-bold text-ink">{children}</h2>
}

function Subtitle({ children }) {
  return <p className="text-ink-2 mt-1 text-sm">{children}</p>
}

function NextButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 bg-terracotta hover:bg-terracotta-deep disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 px-6 rounded-sm font-semibold transition-colors"
    >
      Continue <ArrowRight size={15} strokeWidth={2} />
    </button>
  )
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 rounded-sm border-2 border-line text-ink-2 font-medium hover:border-ink-3 transition-colors"
    >
      <ArrowLeft size={15} strokeWidth={2} /> Back
    </button>
  )
}

// ── Wrapper required by Next.js for useSearchParams ──
export default function OnboardingPageWrapper() {
  return (
    <Suspense>
      <OnboardingPage />
    </Suspense>
  )
}