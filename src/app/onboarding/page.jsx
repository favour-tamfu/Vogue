'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { slug: 'photography',    label: 'Photography',     emoji: '📸' },
  { slug: 'videography',    label: 'Videography',     emoji: '🎥' },
  { slug: 'catering',       label: 'Catering',        emoji: '🍽️' },
  { slug: 'dj-music',       label: 'DJ & Music',      emoji: '🎵' },
  { slug: 'mc-hosting',     label: 'MC & Hosting',    emoji: '🎤' },
  { slug: 'decor-florals',  label: 'Decor & Florals', emoji: '💐' },
  { slug: 'hair-makeup',    label: 'Hair & Makeup',   emoji: '💄' },
  { slug: 'sound-lighting', label: 'Sound & Lighting',emoji: '🔊' },
  { slug: 'security',       label: 'Security',        emoji: '🛡️' },
  { slug: 'staffing',       label: 'Staffing',        emoji: '👥' },
  { slug: 'event-planning', label: 'Event Planning',  emoji: '📋' },
  { slug: 'logistics',      label: 'Logistics',       emoji: '🚚' },
]

const variants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
}

// ── Main component (not exported directly) ──
function OnboardingPage() {
  const router = useRouter()
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
  }, [])

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
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #fff5f4 0%, #fff 50%, #fff8f0 100%)' }}
    >

      {/* ── Floating background shapes ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>

        <motion.div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(253,94,83,0.35), rgba(253,94,83,0.05))' }}
          animate={{ x: [0, 40, 15, -10, 0], y: [0, 20, 50, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -top-20 -right-40 w-[420px] h-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,180,80,0.30), rgba(255,140,50,0.05))' }}
          animate={{ x: [0, -35, -60, -20, 0], y: [0, 40, 15, 60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 -left-32 w-[320px] h-[320px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,180,180,0.25), rgba(253,94,83,0.04))' }}
          animate={{ x: [0, 50, 20, 70, 0], y: [0, -30, -60, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
        <motion.div
          className="absolute -bottom-40 -right-20 w-[460px] h-[460px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(235,90,60,0.28), rgba(253,94,83,0.04))' }}
          animate={{ x: [0, -40, -70, -30, 0], y: [0, -40, -20, -70, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-[280px] h-[280px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,210,80,0.22), rgba(255,180,50,0.03))' }}
          animate={{ x: [0, 30, 60, 20, 0], y: [0, -50, -20, -60, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
        <motion.div
          className="absolute top-1/3 -right-20 w-[200px] h-[200px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,150,140,0.20), rgba(253,94,83,0.03))' }}
          animate={{ x: [0, -25, -50, -15, 0], y: [0, 30, 60, 25, 0] }}
          transition={{ duration: 23, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />

        {[
          { top: '18%', left: '12%', size: 'w-3 h-3', color: 'rgba(253,94,83,0.4)',   duration: 6, delay: 0   },
          { top: '65%', left: '82%', size: 'w-4 h-4', color: 'rgba(255,180,80,0.4)',  duration: 8, delay: 1   },
          { top: '38%', left: '88%', size: 'w-2 h-2', color: 'rgba(253,94,83,0.35)',  duration: 5, delay: 3   },
          { top: '78%', left: '18%', size: 'w-3 h-3', color: 'rgba(255,140,80,0.4)',  duration: 7, delay: 2   },
          { top: '12%', left: '65%', size: 'w-2 h-2', color: 'rgba(235,90,60,0.35)',  duration: 9, delay: 4   },
          { top: '50%', left: '5%',  size: 'w-2 h-2', color: 'rgba(253,94,83,0.30)',  duration: 6, delay: 1.5 },
          { top: '85%', left: '55%', size: 'w-3 h-3', color: 'rgba(255,180,80,0.35)', duration: 7, delay: 2.5 },
        ].map((dot, i) => (
          <motion.div
            key={i}
            className={`absolute ${dot.size} rounded-full`}
            style={{ top: dot.top, left: dot.left, background: dot.color }}
            animate={{ y: [0, -15, 5, -10, 0], x: [0, 8, -5, 10, 0], opacity: [0.4, 0.7, 0.3, 0.6, 0.4] }}
            transition={{ duration: dot.duration, repeat: Infinity, ease: 'easeInOut', delay: dot.delay }}
          />
        ))}

      </div>

      {/* ── Progress bar ── */}
      {error && (
        <div
          className="w-full max-w-lg mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}
      <div className="w-full max-w-lg mb-8" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Setting up your profile</span>
          <span>{step + 1} of {steps.length}</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-500 rounded-full"
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
      <Emoji>👋</Emoji>
      <Title>What should we call you?</Title>
      <Subtitle>This is how you'll appear to others on the platform</Subtitle>

      <input
        type="text"
        value={profile.full_name}
        onChange={e => update('full_name', e.target.value)}
        placeholder="Your full name"
        className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-brand-500 transition-colors mt-6"
      />

      <div className="mt-4 p-3 bg-brand-50 rounded-xl">
        <span className="text-brand-500 text-sm font-medium">
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
      <Emoji>📍</Emoji>
      <Title>Where are you based?</Title>
      <Subtitle>Start typing your city — we'll find it for you</Subtitle>

      <div className="relative mt-6">
        <input
          type="text"
          value={query}
          onChange={e => search(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder="e.g. Lagos, Nairobi, London..."
          className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-brand-500 transition-colors"
          autoComplete="off"
        />

        {searching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <motion.div
              className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}

        {showDropdown && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-gray-200 overflow-hidden shadow-lg"
            style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', zIndex: 50 }}
          >
            {results.map((result, i) => (
              <button
                key={i}
                onClick={() => select(result.label)}
                className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-brand-50 hover:text-brand-600 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0"
              >
                <span className="text-base">📍</span>
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
          className="mt-3 p-3 bg-brand-50 rounded-xl flex items-center gap-2"
        >
          <span>📍</span>
          <span className="text-brand-600 text-sm font-medium">{profile.location}</span>
          <button
            onClick={() => { setQuery(''); update('location', ''); }}
            className="ml-auto text-brand-400 hover:text-brand-600 text-xs"
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
    { value: 'individual', label: 'Personal',      desc: 'Birthday parties, weddings, house events',  emoji: '🎉', example: 'e.g. "I need a photographer for my wedding"' },
    { value: 'company',    label: 'Event Business', desc: 'You run or manage events professionally',   emoji: '🎪', example: "e.g. \"I'm an event planner hiring a caterer\"" },
    { value: 'corporate',  label: 'Corporate',      desc: 'Company events, launches, conferences',     emoji: '🏢', example: 'e.g. "Our company needs staff for a product launch"' },
  ]

  return (
    <Card>
      <Emoji>🎯</Emoji>
      <Title>What kind of events do you organise?</Title>
      <Subtitle>This helps providers understand your needs before they even bid</Subtitle>

      <div className="grid gap-3 mt-6">
        {ORG_TYPES.map(opt => (
          <button
            key={opt.value}
            onClick={() => update('org_type', opt.value)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              profile.org_type === opt.value
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200 hover:border-gray-300 bg-white/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl mt-0.5">{opt.emoji}</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{opt.label}</div>
                <div className="text-sm text-gray-500 mt-0.5">{opt.desc}</div>
                <div className={`text-xs mt-1.5 italic ${profile.org_type === opt.value ? 'text-brand-400' : 'text-gray-400'}`}>
                  {opt.example}
                </div>
              </div>
              {profile.org_type === opt.value && (
                <span className="text-brand-500 font-bold text-lg self-center">✓</span>
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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-brand-500 transition-colors"
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
      <Emoji>🎯</Emoji>
      <Title>What services do you offer?</Title>
      <Subtitle>Pick all that apply — you can change this later</Subtitle>

      <div className="grid grid-cols-3 gap-2 mt-6">
        {CATEGORIES.map(cat => {
          const selected = profile.selectedCategories.includes(cat.slug)
          return (
            <button
              key={cat.slug}
              onClick={() => toggle(cat.slug)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                selected ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="text-2xl mb-1">{cat.emoji}</div>
              <div className={`text-xs font-medium leading-tight ${selected ? 'text-brand-600' : 'text-gray-700'}`}>
                {cat.label}
              </div>
            </button>
          )
        })}
      </div>

      {profile.selectedCategories.length > 0 && (
        <p className="text-sm text-brand-500 font-medium mt-3 text-center">
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
      <Emoji>✍️</Emoji>
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
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-brand-500 transition-colors mt-6 resize-none"
      />

      {isProvider && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Years of experience</label>
          <div className="flex gap-2 flex-wrap">
            {['1', '2', '3', '4', '5', '6–10', '10+'].map(yr => (
              <button
                key={yr}
                onClick={() => update('years_experience', yr)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  profile.years_experience === yr
                    ? 'border-brand-500 bg-brand-50 text-brand-600'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
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
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="text-6xl mb-6"
        >
          🎉
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900">
          You're all set, {profile.full_name.split(' ')[0]}!
        </h2>
        <p className="text-gray-500 mt-2 mb-8">
          {profile.role === 'hirer'
            ? "Your account is ready. Start posting jobs and finding great talent."
            : "Your profile is ready. Start browsing jobs and winning contracts."}
        </p>

        <div className="bg-gray-50 rounded-xl p-4 text-left mb-8 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Name</span>
            <span className="font-medium text-gray-900">{profile.full_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Location</span>
            <span className="font-medium text-gray-900">{profile.location}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Role</span>
            <span className="font-medium text-gray-900 capitalize">{profile.role}</span>
          </div>
          {profile.selectedCategories.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Services</span>
              <span className="font-medium text-gray-900">{profile.selectedCategories.length} selected</span>
            </div>
          )}
        </div>

        <button
          onClick={onFinish}
          disabled={saving}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-semibold text-base transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Go to my dashboard →'}
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
    <div className="rounded-2xl border border-white/40 p-8"
      style={{
        background: 'rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 8px 32px rgba(253, 94, 83, 0.08), 0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {children}
    </div>
  )
}

function Emoji({ children }) {
  return <div className="text-4xl mb-4">{children}</div>
}

function Title({ children }) {
  return <h2 className="text-2xl font-bold text-gray-900">{children}</h2>
}

function Subtitle({ children }) {
  return <p className="text-gray-500 mt-1 text-sm">{children}</p>
}

function NextButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold transition-colors"
    >
      Continue →
    </button>
  )
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-gray-300 transition-colors"
    >
      ← Back
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