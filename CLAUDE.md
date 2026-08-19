# CLAUDE.md — Avenue

Context file for Claude Code. **Read this entire file before touching anything.**

**Repo:** `favour-tamfu/Vogue` (rename pending) · **Owner:** Favour Abignue Tamfu
**Stack:** Next.js 16.1.6 (App Router) · React 19.2.3 · Supabase · Tailwind v4 · framer-motion · lucide-react
**Language:** Mixed `.jsx` / `.tsx`. Most code is JSX. `src/app/layout.tsx` is TS.

---

## 0. How to use this file

Everything in §3 (brand) and §4 (logo) is **locked and decided**. Do not redesign, reinterpret, or "improve" it. Implement it exactly. Values are exact — hex codes, axis settings, path data and spacing are all deliberate.

§1 lists the things you **cannot do yourself** and must stop and ask about. Read it before you start so you don't get halfway through a task and stall.

Everything in §8 (audit) is a real defect found by reading the codebase. Severities are load-bearing.

---

## 1. STOP AND ASK — things Favour must do manually

**Rule: when you hit one of these, stop, do everything around it that you can, and ask. Do not guess, do not stub it silently, do not skip ahead.**

### 1.1 Blocking decisions only Favour can make

| # | Item | Why it blocks | What you can do meanwhile |
|---|---|---|---|
| 1 | ~~**Logo: 7A or 7B?**~~ **RESOLVED — 7A** (Favour, 2026-08-19) | — | `AvenueMark.jsx` ships `VARIANT = '7a'`. SVG set exported. **Still outstanding:** PNG/ICO generation and the outlined-wordmark assets (§1.3, §4.7) |
| 2 | **Final product name** | "Avenue" is provisional and may change | Centralise it: `export const PRODUCT_NAME = 'Avenue'` in `src/lib/brand.js`, import everywhere. **Never** hardcode the literal string in JSX |
| 3 | **Commission rate**, when revenue is switched on | Not needed at launch (rate is 0) | Build the fields and computation now; leave rate at 0 |

### 1.2 Supabase dashboard actions (API access alone won't cover these)

You have Supabase credentials, so most schema work is yours. These specific things still need a human in the dashboard — **ask Favour to do them and confirm before you depend on them:**

- **Create the `payment-proofs` storage bucket** — must be **private**, not public. Access via signed URLs only. Policy: readable only by the hire's `hirer_id`, `provider_id`, and admins.
- **Audit the existing buckets.** `verification-docs` holds government ID scans — confirm it is private and not world-readable. `portfolio` should be public. Report what you find before changing anything.
- **Enable Realtime replication** on `notifications` and `messages` if not already on. `Navbar.jsx` and `Conversation.jsx` both subscribe to postgres_changes and will silently do nothing if replication is off. **Check this early — it may be the actual cause of the empty notification bell.**
- **Auth settings** — confirm the email confirmation redirect URL matches the deployed domain, or signup confirmation breaks in production.
- **Any destructive migration.** Dropping or altering a column on a table with live data: write the migration, show it to Favour, wait for approval.

### 1.3 Assets and tooling

- **Font files.** Download the Fraunces and Source Sans 3 variable fonts, subset them, and self-host (§3.2.4 has the exact commands). If you can fetch and run `pyftsubset`, do it. If the network is blocked, produce the exact commands and ask Favour to run them. **Always commit the `OFL.txt` licence file alongside the fonts** — both are Open Font Licence and this is a licence requirement, not optional.
- **Diacritics visual check (§3.2.5).** This needs human eyes. Render the test string, screenshot it, and ask Favour to confirm the marks sit correctly. Do not assume it passes.
- **Wordmark outlining.** Any standalone `.svg` logo asset for print, social cards, or email needs the wordmark converted to vector outlines in a design tool using the real font file. You cannot do this. Generate the in-app component version, then ask Favour to produce the outlined static assets.
- **PNG/ICO icon generation.** Scriptable from the SVGs (sharp / rsvg-convert), but the small sizes must be eyeballed — the 16px reductions in §4 exist because the full marks turn to mush. Generate, then ask Favour to look at them.

### 1.4 Secrets, infrastructure, accounts

- **Rotating the Grafana password.** `docker-compose.yml` currently has `GF_SECURITY_ADMIN_PASSWORD=vogue2024` committed in plaintext. Change the file to read from env — but the actual new secret must be set by Favour in the deployment environment. Never invent or commit one.
- **All `.env` values.** Write `.env.example` with keys and empty values. Never create a real `.env` with guessed values.
- **GitHub repo rename** `Vogue` → `Avenue`. Favour's action. Remember the remote URL changes.
- **Creating the first admin user** (§6). Needs a real Supabase auth account. Write the migration and the SQL to flip the flag; Favour runs it against their own account.
- **Domain, DNS, deployment target.** Not yours.
- **Payment gateway account** (Paystack / Flutterwave) — only needed when commission goes live. Not at launch.

---

## 2. What this product is

An **event-services marketplace**, currently branded "Vogue Events", being rebranded to **Avenue**.

**Hirers** post jobs → **providers** (photographers, videographers, caterers, DJs, MCs, decor & florals, hair & makeup, sound & lighting, security, staffing, event planning, logistics) bid → hirer accepts a bid → a hire is created → after the event date both sides review each other.

A user's `role` is `hirer`, `provider`, or `both`. Providers must pass ID verification (`is_verified`) before they can bid. Admin reviews verification applications through a separate panel.

**Market: Nigeria first.** This is not cosmetic — see §9.

### Priority order
1. **Rebrand** Vogue → Avenue
2. **Polish** — fix bugs, unify the visual system
3. **Complete** — finish half-built features
4. **Production readiness** — secrets, schema, auth, deploy

Do not start phase 3–4 work before 1–2 unless told. The colour consolidation blocks nearly everything.

---

## 3. Brand system — LOCKED

Rationale lives in the Claude project docs (`avenue-brand-research`, `avenue-design-system`, `avenue-logo-finalists`). This section is authoritative for implementation.

The ornament tradition is **uli** — Igbo linear body and wall painting. The palette below *is* the traditional uli wall pigment set: camwood red-brown, soil/bark yellow, white clay, charcoal. That is why these colours work together and why the motifs sit naturally in them.

### 3.1 Colour

Replaces the old navy `#0F172A` / coral `#E8523A` scheme **entirely**. Both are deleted.

| Token | Hex | Role | Notes |
|---|---|---|---|
| `terracotta` | `#B4502A` | primary brand, primary CTA, links | camwood |
| `terracotta-deep` | `#8E3D1F` | hover / pressed / active | |
| `terracotta-soft` | `#F7E4DA` | tinted backgrounds, selected chips | |
| `ochre` | `#D89B3C` | accent, ntupo dots, secondary highlight | soil / bark |
| `ochre-soft` | `#F7E6CF` | badge backgrounds (e.g. bid count) | |
| `ochre-text` | `#8A5D12` | text on `ochre-soft` — passes contrast | never use raw ochre for text |
| `verified` | `#0B6E4F` | verification badge ONLY | see §3.5 |
| `verified-bg` | `#E3F3EA` | verification badge background | |
| `cream` | `#FBF3E9` | default page surface | white clay |
| `cream-2` | `#F5E9DA` | alternate band / section surface | |
| `sand` | `#F2D9A8` | light accent on dark surfaces, motifs on ink | |
| `ink` | `#2B2118` | primary text, dark hero surface | charcoal |
| `ink-2` | `#6B5E4F` | muted / secondary text | |
| `ink-3` | `#9A8B78` | tertiary text, placeholders, on-dark muted | |
| `line` | `#ECD9BF` | borders, dividers | |
| `surface` | `#FFFFFF` | cards on cream | |
| `danger` | `#9B3B21` | errors, destructive | warm-shifted, not generic red |
| `danger-bg` | `#FBE3DE` | error backgrounds | |

**Radius:** 4px is the house radius for inputs, chips and small elements; 8px for buttons; 10–14px for cards. Never `rounded-2xl` — that came from the off-brand auth pages.

#### 3.1.1 `src/app/globals.css` — replace the entire `@theme` block

```css
@import "tailwindcss";

:root {
  /* brand */
  --color-terracotta:      #B4502A;
  --color-terracotta-deep: #8E3D1F;
  --color-terracotta-soft: #F7E4DA;
  --color-ochre:           #D89B3C;
  --color-ochre-soft:      #F7E6CF;
  --color-ochre-text:      #8A5D12;

  /* trust — do not reuse these anywhere else */
  --color-verified:        #0B6E4F;
  --color-verified-bg:     #E3F3EA;

  /* surfaces */
  --color-cream:           #FBF3E9;
  --color-cream-2:         #F5E9DA;
  --color-sand:            #F2D9A8;
  --color-surface:         #FFFFFF;

  /* text */
  --color-ink:             #2B2118;
  --color-ink-2:           #6B5E4F;
  --color-ink-3:           #9A8B78;

  /* structure */
  --color-line:            #ECD9BF;

  /* state */
  --color-danger:          #9B3B21;
  --color-danger-bg:       #FBE3DE;

  /* radii */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  /* type */
  --font-display: 'Fraunces', Georgia, 'Times New Roman', serif;
  --font-ui:      'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

@theme inline {
  --color-terracotta:      var(--color-terracotta);
  --color-terracotta-deep: var(--color-terracotta-deep);
  --color-terracotta-soft: var(--color-terracotta-soft);
  --color-ochre:           var(--color-ochre);
  --color-ochre-soft:      var(--color-ochre-soft);
  --color-ochre-text:      var(--color-ochre-text);
  --color-verified:        var(--color-verified);
  --color-verified-bg:     var(--color-verified-bg);
  --color-cream:           var(--color-cream);
  --color-cream-2:         var(--color-cream-2);
  --color-sand:            var(--color-sand);
  --color-surface:         var(--color-surface);
  --color-ink:             var(--color-ink);
  --color-ink-2:           var(--color-ink-2);
  --color-ink-3:           var(--color-ink-3);
  --color-line:            var(--color-line);
  --color-danger:          var(--color-danger);
  --color-danger-bg:       var(--color-danger-bg);
  --font-display:          var(--font-display);
  --font-sans:             var(--font-ui);
}

body {
  background: var(--color-cream);
  color: var(--color-ink);
  font-family: var(--font-ui);
  font-size: 15px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
```

After this, `bg-terracotta`, `text-ink-2`, `border-line` etc. all work as Tailwind utilities.

#### 3.1.2 Deleting the old colour objects — this is Task 1

**15+ components each declare their own `const T = { navy: '#0F172A', coral: '#E8523A', ... }` and use it via inline `style={{}}`.** Every one must go.

Files (verify the list by grepping for `const T = {`):
`Navbar` · `MobileNav` · `JobBoard` · `JobDetail` · `MyJobs` · `MyBids` · `HirerView` · `ProviderView` · `BothView` · `Feed` · `Conversation` · `ProviderBrowse` · `ProviderProfile` · `ProfileEdit` · `Settings` · `ReviewPrompt` · `VerificationForm` · `PortfolioUpload` · `admin/AdminDashboard` · `admin/login/page` · `jobs/new/page` · `onboarding/page` · `app/page.jsx`

Mapping from old to new:

| Old | New |
|---|---|
| `T.navy` `#0F172A` | `ink` — but if it was a *background*, use `ink`; if text, `ink` |
| `T.navyMid` `#1E293B` | `ink-2` |
| `T.coral` `#E8523A` | `terracotta` |
| `T.coralLight` `#FEF0ED` | `terracotta-soft` |
| `T.border` `#E2E8F0` | `line` |
| `T.bg` `#F8FAFC` | `cream` |
| `T.textMuted` `#64748B` | `ink-2` |
| `T.textLight` `#94A3B8` | `ink-3` |
| `#DC2626` / `#FECACA` / `#FFF5F5` | `danger` / `line` / `danger-bg` |
| `#16A34A` / `#F0FDF4` / `#86EFAC` | `verified` / `verified-bg` — **only** if it is genuinely the verification signal. If it's a generic success state, use `verified` colour but never the badge component |

Replace inline `style={{ color: T.navy }}` with Tailwind classes (`text-ink`). Keep inline styles only where a value is genuinely dynamic.

**Do this in one pass, component by component, and run `npm run build` after each few files.** Do not apply the new palette before the consolidation — that is doing the work twice.

---

### 3.2 Typography

#### 3.2.1 The two faces

**Display / headings: Fraunces** — variable, OFL. Axes: `opsz` 9–144, `wght` 100–900, `SOFT` 0–100, `WONK` 0/1.

Chosen because two axes map directly onto uli's line quality: `SOFT` makes strokes inky and swollen (dye spreading on skin), `WONK` swaps in hand-lettered asymmetric letterforms. `opsz` thickens strokes and opens forms at small sizes rather than merely scaling, which protects legibility on cheap screens.

**UI / body: Source Sans 3** — variable, OFL. Humanist sans; keeps a whisper of calligraphic modulation so it harmonises with Fraunces instead of fighting it, while staying legible at 12px.

**Hard rule: nothing at 15px or below is ever Fraunces.** Its x-height is too low. Body copy is always Source Sans 3.

**Rejected, do not substitute:** Playfair Display (hairlines vanish on low-brightness screens in daylight), Poppins / geometric sans (monoline, mechanical, clashes with hand-drawn ornament), the system stack (renders differently per device, no consistent voice).

#### 3.2.2 Type scale

| Role | Face | Size | Settings |
|---|---|---|---|
| Hero display | Fraunces | `clamp(32px, 5vw, 52px)` | `opsz 110, SOFT 45, WONK 1`, wght 600, tracking `-0.02em`, lh 1.08 |
| Page title (h1) | Fraunces | 28px | `opsz 80, SOFT 40, WONK 1`, wght 600, tracking `-0.015em`, lh 1.15 |
| Section head (h2) | Fraunces | 22px | `opsz 60, SOFT 35, WONK 1`, wght 600, tracking `-0.01em` |
| Card title (h3) | Source Sans 3 | 16px | wght 700 |
| Body | Source Sans 3 | 15px | wght 400, lh 1.55 |
| Body small | Source Sans 3 | 13px | wght 400, lh 1.5 |
| Label / meta | Source Sans 3 | 12px | wght 600 |
| Micro / eyebrow | Source Sans 3 | 11px | wght 800, tracking `0.12em`, uppercase |
| **Logo wordmark** | Fraunces | — | `opsz 90, SOFT 10, WONK 0`, wght 700, tracking `-0.035em` |
| Money / bid amounts | Source Sans 3 | inherits | wght 700, `font-variant-numeric: tabular-nums` |

**Note the wordmark is deliberately the opposite of the editorial setting** — low SOFT, WONK off. Sharp and contemporary. The mark carries the geometry; the wordmark must not fight it. Do not use the inky heading setting on the logo.

Prices and bid amounts must use `tabular-nums` so figures align in lists.

#### 3.2.3 `@font-face` declarations

```css
@font-face {
  font-family: 'Fraunces';
  src: url('/fonts/Fraunces-subset.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-stretch: normal;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0100-017F, U+0180-024F, U+1E00-1EFF, U+0300-036F, U+2000-206F, U+20A0-20CF;
}

@font-face {
  font-family: 'Source Sans 3';
  src: url('/fonts/SourceSans3-subset.woff2') format('woff2-variations');
  font-weight: 200 900;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0100-017F, U+0180-024F, U+1E00-1EFF, U+0300-036F, U+2000-206F, U+20A0-20CF;
}
```

`U+1E00-1EFF` is Latin Extended Additional — it holds `ị ọ ụ ṣ ẹ ṅ`. `U+0300-036F` is combining diacritical marks — needed for stacked tone marks. `U+20A0-20CF` holds `₦`. **Do not drop any of these ranges when subsetting.**

> **FINDING (2026-08-19, verified against the upstream Google Fonts files).**
> Fraunces has only 624 codepoints and **does not contain**:
> `ṅ` / `Ṅ` (U+1E45 / U+1E44) · `ǹ` / `Ǹ` (U+01F9 / U+01F8) · combining dot below (U+0323).
> This is an upstream gap, not a subsetting error — requesting those ranges cannot add
> glyphs the font never had. It *does* have `ị ọ ụ ẹ ṣ`, `₦`, and combining acute/grave.
> Source Sans 3 (1,615 codepoints) has **full** coverage of all of the above.
>
> Practical effect: body/UI text is safe. Only **display text set in Fraunces** (hero, h1,
> h2, the logo wordmark) will fall back mid-word on `ṅ` or `Ǹ` — note the brand's own motif
> name `Ǹkụ́` cannot render in Fraunces. Decide before shipping Igbo/Yorùbá display copy:
> either scope a `unicode-range` fallback for those codepoints, or take the documented
> Noto Serif + Noto Sans pair (§3.2.5). **Unresolved — needs Favour.**

Preload both in `layout.tsx`:
```html
<link rel="preload" href="/fonts/Fraunces-subset.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
<link rel="preload" href="/fonts/SourceSans3-subset.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
```

#### 3.2.4 Self-hosting and subsetting

Do **not** hotlink Google Fonts in production — a third-party DNS + TLS round-trip is the slow part on a weak mobile connection.

```bash
pip install fonttools brotli

pyftsubset Fraunces[SOFT,WONK,opsz,wght].ttf \
  --output-file=public/fonts/Fraunces-subset.woff2 \
  --flavor=woff2 \
  --layout-features='*' \
  --unicodes="U+0000-00FF,U+0100-017F,U+0180-024F,U+1E00-1EFF,U+0300-036F,U+2000-206F,U+20A0-20CF" \
  --no-hinting --desubroutinize

pyftsubset SourceSans3[wght].ttf \
  --output-file=public/fonts/SourceSans3-subset.woff2 \
  --flavor=woff2 \
  --layout-features='*' \
  --unicodes="U+0000-00FF,U+0100-017F,U+0180-024F,U+1E00-1EFF,U+0300-036F,U+2000-206F,U+20A0-20CF" \
  --no-hinting --desubroutinize
```

`--layout-features='*'` is **mandatory** — it preserves the GPOS mark-attachment tables that position stacked diacritics. Dropping it is the single most common way to break Yorùbá rendering.

Target: ~35–50KB each. Expect ~80–100KB total for the type system, cached after first visit. Commit `OFL.txt` for both.

**Lean fallback if the budget is rejected:** load Fraunces for display only and keep the system stack for body/UI (~40KB). Ask Favour before taking this path.

#### 3.2.5 Diacritics gate — MUST PASS BEFORE SHIPPING

Igbo needs `ị ọ ụ ṅ`. Yorùbá needs `ẹ ọ ṣ` **plus tone marks stacked over dot-below vowels**. Stacked marks are where fonts fail — collisions, crooked placement, or a mid-word fallback to another typeface.

Render this string in both faces, at both large and 13px, and inspect:

```
Ọmụmụ Akwụkwọ Ǹkụ́ Ẹ̀kọ́ Ọ̀ṣun Ilé Ìjọba ₦450,000
```

Check: dots sit centred under their vowel · acute/grave sit cleanly *above* a dot-below vowel without collision · no glyph visibly jumps to a different typeface · the naira sign renders.

**This needs human eyes — screenshot it and ask Favour to confirm.** If either font fails, the documented fallback pair is **Noto Serif + Noto Sans**, which exist specifically to guarantee this coverage at some cost in character.

---

### 3.3 The uli motif system — 14 motifs

Line character: **swelling and tapering** strokes. Achieved by varying `stroke-width` between path segments — thick stems ~7, fine tendrils ~3, always `stroke-linecap="round"`. Spiral terminals. Ochre *ntupo* dot trails that shrink along a curve.

Build these as `src/components/motifs/*.jsx`, each accepting `className` and `style`. Default stroke `currentColor` where practical so they inherit; dots are `ochre`.

**Colour convention:** strokes `terracotta` on light, `sand` on dark. Dots always `ochre`.

#### 3.3.1 Primary flourishes

**Ọmụmụ** — "growth", the rising tendril. Hero left anchor. `viewBox="0 0 180 400"`
```svg
<g fill="none" stroke="#B4502A" stroke-linecap="round">
  <path d="M90 396C84 340 80 300 92 262 104 224 130 202 140 172" stroke-width="7"/>
  <path d="M140 172c9-27 1-54-20-61-16-5-30 7-26 22 3 10 14 15 22 10" stroke-width="5"/>
  <path d="M92 262c-26-10-46-36-46-66 24 8 42 36 46 66" stroke-width="4"/>
  <path d="M80 300c-22 2-38-12-38-30 18 0 32 14 38 30" stroke-width="3.2"/>
</g>
<circle cx="150" cy="212" r="6"   fill="#D89B3C"/>
<circle cx="158" cy="240" r="4.6" fill="#D89B3C"/>
<circle cx="162" cy="266" r="3.4" fill="#D89B3C"/>
<circle cx="164" cy="288" r="2.4" fill="#D89B3C"/>
```

**Eke** — python, the double sweep. Hero right anchor. `viewBox="0 0 240 420"`
```svg
<g fill="none" stroke="#B4502A" stroke-linecap="round">
  <path d="M66 412c38-60 50-116 36-172-14-56 0-108 44-140" stroke-width="7"/>
  <path d="M146 100c30-22 64-10 68 18 3 22-16 37-34 30-12-5-16-20-6-27" stroke-width="5"/>
  <path d="M102 240c36 14 76 4 98-26 18-25 14-56-2-68" stroke-width="4.2"/>
  <path d="M108 330c-30 6-54-8-60-30 24-4 48 10 60 30" stroke-width="3.2"/>
</g>
<circle cx="204" cy="248" r="7"   fill="#D89B3C"/>
<circle cx="212" cy="278" r="5.4" fill="#D89B3C"/>
<circle cx="216" cy="306" r="4"   fill="#D89B3C"/>
<circle cx="217" cy="330" r="2.8" fill="#D89B3C"/>
<circle cx="80"  cy="120" r="5"   fill="#D89B3C"/>
<circle cx="66"  cy="146" r="3.6" fill="#D89B3C"/>
```

**Akwụkwọ** — leaf spray. Empty states. `viewBox="0 0 200 320"`
```svg
<g fill="none" stroke="#B4502A" stroke-linecap="round">
  <path d="M100 314C100 250 100 200 100 140" stroke-width="6"/>
  <path d="M100 250c-26-4-44-24-48-50 26 4 44 24 48 50" stroke-width="3.6"/>
  <path d="M100 250c26-4 44-24 48-50-26 4-44 24-48 50" stroke-width="3.6"/>
  <path d="M100 196c-22-4-38-20-42-42 22 4 38 20 42 42" stroke-width="3.2"/>
  <path d="M100 196c22-4 38-20 42-42-22 4-38 20-42 42" stroke-width="3.2"/>
  <path d="M100 140c-12-16-10-38 4-52 12 16 10 38-4 52" stroke-width="3"/>
</g>
<circle cx="100" cy="76"  r="6" fill="#D89B3C"/>
<circle cx="76"  cy="290" r="4" fill="#D89B3C"/>
<circle cx="124" cy="290" r="4" fill="#D89B3C"/>
```

**Ǹkụ́** — corner flourish. Section edges. `viewBox="0 0 260 300"`
```svg
<g fill="none" stroke="#B4502A" stroke-linecap="round">
  <path d="M14 286c60 4 108-14 140-54 30-38 34-84 18-110" stroke-width="6.5"/>
  <path d="M172 122c-10-24-2-50 20-58 16-6 32 4 30 20-2 12-14 18-23 13" stroke-width="4.6"/>
  <path d="M154 232c34 6 66-6 84-34" stroke-width="3.6"/>
  <path d="M96 268c14 18 38 26 62 20" stroke-width="3"/>
</g>
<circle cx="248" cy="192" r="6"   fill="#D89B3C"/>
<circle cx="240" cy="216" r="4.4" fill="#D89B3C"/>
<circle cx="228" cy="236" r="3"   fill="#D89B3C"/>
```

**Ọdụ** — tusk curve. Hero accent. `viewBox="0 0 220 300"`
```svg
<g fill="none" stroke="#B4502A" stroke-linecap="round">
  <path d="M110 290c0-50-6-92 14-124 20-32 56-40 62-68" stroke-width="6"/>
  <path d="M186 98c6-26-10-48-34-48-18 0-30 14-26 30 3 11 15 17 24 12" stroke-width="4.4"/>
  <path d="M124 166c-28 2-52-14-58-40 28-2 52 14 58 40" stroke-width="3.6"/>
  <path d="M116 226c22 4 42-6 50-26" stroke-width="3"/>
</g>
<circle cx="52"  cy="116" r="5.6" fill="#D89B3C"/>
<circle cx="40"  cy="140" r="4.2" fill="#D89B3C"/>
<circle cx="34"  cy="164" r="3"   fill="#D89B3C"/>
<circle cx="176" cy="216" r="4.6" fill="#D89B3C"/>
```

**Nnyọ** — mirror spiral. Avatar frames, decorative. `viewBox="0 0 240 300"`
```svg
<g fill="none" stroke="#B4502A" stroke-linecap="round">
  <path d="M120 262c-38 0-68-28-68-64 0-30 24-54 52-54 24 0 42 18 42 40 0 18-14 32-30 32-13 0-23-10-23-22 0-9 7-16 15-16" stroke-width="6"/>
  <path d="M120 262c38 0 70-24 78-58" stroke-width="3.6"/>
</g>
<circle cx="196" cy="230" r="6"   fill="#D89B3C"/>
<circle cx="176" cy="248" r="4.4" fill="#D89B3C"/>
<circle cx="154" cy="260" r="3"   fill="#D89B3C"/>
<circle cx="46"  cy="122" r="4.4" fill="#D89B3C"/>
```

#### 3.3.2 Structural — rules and separators

**Ntupo** — dot-and-curl divider. Section separator. `viewBox="0 0 420 42"`, render full-width.
```svg
<g fill="none" stroke="#B4502A" stroke-linecap="round" stroke-width="2.6">
  <path d="M6 21c48 0 78 0 118 0"/>
  <path d="M296 21c40 0 70 0 118 0"/>
  <path d="M124 21c14-10 26-14 36-8 8 5 6 15-3 16-6 1-10-4-8-9"/>
  <path d="M296 21c-14-10-26-14-36-8-8 5-6 15 3 16 6 1 10-4 8-9"/>
</g>
<circle cx="182" cy="21" r="3.2" fill="#D89B3C"/>
<circle cx="196" cy="21" r="5"   fill="#D89B3C"/>
<circle cx="210" cy="21" r="3.2" fill="#D89B3C"/>
<circle cx="224" cy="21" r="5"   fill="#D89B3C"/>
```

**Mbubu** — scarification band, alternating crosses and circles between two rules. Header/footer rule. `viewBox="0 0 420 46"`
```svg
<path d="M6 13h408M6 33h408" stroke="#B4502A" stroke-width="2.2" stroke-linecap="round"/>
<g stroke="#D89B3C" stroke-width="2.4" stroke-linecap="round">
  <path d="M30 18l8 10M38 18l-8 10"/><path d="M110 18l8 10M118 18l-8 10"/>
  <path d="M190 18l8 10M198 18l-8 10"/><path d="M270 18l8 10M278 18l-8 10"/>
  <path d="M350 18l8 10M358 18l-8 10"/>
</g>
<g fill="none" stroke="#B4502A" stroke-width="2.2">
  <circle cx="74" cy="23" r="5.5"/><circle cx="154" cy="23" r="5.5"/>
  <circle cx="234" cy="23" r="5.5"/><circle cx="314" cy="23" r="5.5"/>
  <circle cx="394" cy="23" r="5.5"/>
</g>
```

#### 3.3.3 Functional — state and feedback

**Agwọ** — the coil. **This is the app's loading spinner.** Replace every generic spinner with it. `viewBox="0 0 120 120"`
```svg
<g class="agwo-spin">
  <path d="M60 12c26 0 48 21 48 48s-22 48-48 48c-23 0-42-19-42-42 0-19 15-34 34-34 16 0 28 12 28 28 0 12-10 22-22 22-9 0-17-8-17-17"
        fill="none" stroke="#B4502A" stroke-width="7" stroke-linecap="round"/>
  <circle cx="60" cy="12" r="5" fill="#D89B3C"/>
</g>
```
```css
.agwo-spin { animation: agwo-rotate 2.4s linear infinite; transform-origin: 60px 60px; }
@keyframes agwo-rotate { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .agwo-spin { animation: none; } }
```

**Ìsì** — the knot, two lines becoming one. **Hired / match confirmed.** Use it on the hire confirmation state. `viewBox="0 0 120 120"`
```svg
<g fill="none" stroke="#B4502A" stroke-width="6.5" stroke-linecap="round">
  <path d="M60 22c22 0 38 16 38 34 0 16-13 28-29 28-13 0-24-11-24-24 0-11 9-19 19-19"/>
  <path d="M60 22c-22 0-38 16-38 34 0 16 13 28 29 28 13 0 24-11 24-24 0-11-9-19-19-19"/>
</g>
<circle cx="60" cy="41" r="5.5" fill="#D89B3C"/>
```

**Ọnụ ụzọ** — threshold. Empty states. `viewBox="0 0 200 200"`
```svg
<g fill="none" stroke="#B4502A" stroke-linecap="round">
  <path d="M100 168c-34 0-60-24-60-56 0-26 20-46 44-46" stroke-width="6"/>
  <path d="M100 168c34 0 60-24 60-56 0-26-20-46-44-46" stroke-width="6"/>
  <path d="M84 66c4-16 14-26 16-32 2 6 12 16 16 32" stroke-width="4.6" stroke-linejoin="round"/>
</g>
<circle cx="100" cy="120" r="7" fill="#D89B3C"/>
<circle cx="72"  cy="150" r="4" fill="#D89B3C"/>
<circle cx="128" cy="150" r="4" fill="#D89B3C"/>
```

#### 3.3.4 Emblematic — status and identity

**Ugo** — eagle feather. Top-rated provider. `viewBox="0 0 140 300"`
```svg
<g fill="none" stroke="#B4502A" stroke-linecap="round">
  <path d="M70 290C70 220 66 150 78 100c8-34 26-58 30-84" stroke-width="6"/>
  <g stroke-width="3.2">
    <path d="M74 240c-18-6-30-22-32-42"/><path d="M74 240c18-10 28-28 28-48"/>
    <path d="M72 196c-16-6-26-20-28-38"/><path d="M72 196c16-10 26-26 26-44"/>
    <path d="M76 152c-14-6-22-18-24-34"/><path d="M76 152c14-10 22-24 22-40"/>
  </g>
</g>
<circle cx="112" cy="30" r="6" fill="#D89B3C"/>
<circle cx="104" cy="52" r="4" fill="#D89B3C"/>
```

**Ọsisi** — the tree. Stats and growth panels. `viewBox="0 0 200 280"`
```svg
<g fill="none" stroke="#B4502A" stroke-linecap="round">
  <path d="M100 272V150" stroke-width="7"/>
  <path d="M100 178c-20-4-34-20-38-42" stroke-width="4.6"/>
  <path d="M100 178c20-4 34-20 38-42" stroke-width="4.6"/>
  <path d="M100 150c-14-14-16-36-6-52" stroke-width="4"/>
  <path d="M100 150c14-14 16-36 6-52" stroke-width="4"/>
</g>
<circle cx="58"  cy="128" r="6" fill="#D89B3C"/>
<circle cx="142" cy="128" r="6" fill="#D89B3C"/>
<circle cx="100" cy="86"  r="7" fill="#D89B3C"/>
```

**Anyanwụ** — the sun, spiral core radiating. Onboarding / new. `viewBox="0 0 200 200"`
```svg
<g fill="none" stroke="#B4502A" stroke-linecap="round">
  <path d="M100 142c-24 0-42-18-42-42 0-18 14-32 32-32 14 0 24 10 24 24 0 10-8 18-18 18-7 0-13-6-13-13" stroke-width="6"/>
  <g stroke-width="4">
    <path d="M100 24v-14"/><path d="M154 46l10-10"/><path d="M176 100h14"/><path d="M154 154l10 10"/>
    <path d="M100 176v14"/><path d="M46 154l-10 10"/><path d="M24 100H10"/><path d="M46 46L36 36"/>
  </g>
</g>
<circle cx="164" cy="72"  r="4" fill="#D89B3C"/>
<circle cx="36"  cy="128" r="4" fill="#D89B3C"/>
```

---

### 3.4 Motif animation

Three behaviours. All CSS, no JS, no animation library. `framer-motion` is already a dependency but **do not use it for motifs** — it costs JS on a bundle that is a product constraint.

```css
/* GROW — lines draw themselves on, like a vine climbing */
.motif-draw {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1.02;      /* 1.02 not 1 — avoids a hairline gap at the join */
  stroke-dashoffset: 1.02;
  animation: motif-grow var(--dur, 4.4s) cubic-bezier(.22,.62,.28,1) var(--delay, 0s) forwards;
}
@keyframes motif-grow { to { stroke-dashoffset: 0; } }

/* BLOOM — ntupo dots pop in after their parent stroke finishes */
.motif-dot {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  animation: motif-bloom .62s cubic-bezier(.34,1.4,.5,1) var(--delay, 0s) forwards;
}
@keyframes motif-bloom {
  from { opacity: 0; transform: scale(.15); }
  to   { opacity: 1; transform: scale(1); }
}

/* FLOAT — perpetual drift after growth completes */
.motif-float  { animation: motif-drift  var(--fd, 19s) ease-in-out var(--delay, 0s) infinite; }
.motif-float2 { animation: motif-drift2 var(--fd, 23s) ease-in-out var(--delay, 0s) infinite; }
@keyframes motif-drift {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  50%     { transform: translate(5px,-13px) rotate(.8deg); }
}
@keyframes motif-drift2 {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  50%     { transform: translate(-7px,-9px) rotate(-1deg); }
}

@media (prefers-reduced-motion: reduce) {
  .motif-draw  { animation: none; stroke-dashoffset: 0; }
  .motif-dot   { animation: none; opacity: 1; }
  .motif-float, .motif-float2 { animation: none; }
}
```

**Every animated path must carry `pathLength="1"`.** That normalises the path length so `stroke-dasharray: 1.02` works regardless of the actual geometry. Without it the draw animation breaks on every motif.

Rules:
- Per-path grow duration 2.2–5s, **staggered** — set `--dur` and `--delay` per path so the stem draws before its tendrils
- Dots bloom *after* their parent stroke finishes — set `--delay` accordingly
- Float durations 17–26s, **varied per motif** so they never sync up. Alternate `.motif-float` / `.motif-float2`
- **Opacity 30–55%**, anchored to layout edges, `pointer-events: none`
- Hero background SVG: `preserveAspectRatio="xMidYMax slice"`, absolutely positioned, `inset: 0`

**Hard rule: ornament never competes with a bid amount, a price, or the verified badge.** If a motif overlaps any of those, move the motif.

---

### 3.5 The verified badge — NEVER decorate this

Emerald check on a pale pill, uppercase label. **Flat and identical everywhere.** No motifs, no gradients, no variants, no animation, no size variations beyond the icon scaling with the text.

It is the platform's core trust signal and the main differentiator against Bark and Thumbtack, which don't verify at all.

```jsx
export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-verified-bg
                     px-2.5 py-1 text-[10.5px] font-extrabold tracking-wide text-verified">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="3.4"
              strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      VERIFIED
    </span>
  )
}
```

Use this component everywhere. Never re-implement it inline. `verified` and `verified-bg` are reserved for it — do not reuse those two tokens for generic success states.

---

## 4. The logo

**Favour has not yet chosen between 7A and 7B.** Build both, ship neither until told. See §1.1.

### 4.1 The concept

The mark is an **aisle in perspective** — two rows receding toward a point, the ochre dot as the destination (altar / stage / head table). It reads at once as a road lined on both sides (the literal definition of an *avenue*) and as the processional aisle of an event.

**The lockup rule follows from the name: `a·venue`.** Drop the "a" and the name already spells **venue**. The mark **replaces the leading "a"** — `[mark]venue`. This is the primary lockup, not an alternate. The aisle is the thing that turns a venue into an avenue.

### 4.2 Mark 7A — "Seated rows"

Rows of seating flanking the aisle, shortening and thinning as they recede. The segmentation is what makes it read as an aisle rather than an abstract chevron.

`public/brand/avenue-mark-7a.svg`
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 114" role="img" aria-label="Avenue">
  <g fill="none" stroke="#B4502A" stroke-linecap="round">
    <path d="M8 104h26"  stroke-width="11"/>
    <path d="M86 104h26" stroke-width="11"/>
    <path d="M16 87h22"  stroke-width="9.5"/>
    <path d="M82 87h22"  stroke-width="9.5"/>
    <path d="M24 70h18"  stroke-width="8"/>
    <path d="M78 70h18"  stroke-width="8"/>
    <path d="M32 53h14"  stroke-width="6.5"/>
    <path d="M74 53h14"  stroke-width="6.5"/>
    <path d="M40 36h10"  stroke-width="5"/>
    <path d="M70 36h10"  stroke-width="5"/>
  </g>
  <circle cx="60" cy="18" r="8.5" fill="#D89B3C"/>
</svg>
```

| Variant | Change |
|---|---|
| **On dark** | rows `#F2D9A8`, dot stays `#D89B3C` |
| **Monochrome** | everything `#2B2118`, or `currentColor` |
| **Favicon / ≤24px** | see below — five rows turn to mush |

`public/brand/avenue-favicon-7a.svg`
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 114" role="img" aria-label="Avenue">
  <g fill="none" stroke="#B4502A" stroke-linecap="round">
    <path d="M6 102h30" stroke-width="15"/><path d="M84 102h30" stroke-width="15"/>
    <path d="M22 74h20" stroke-width="12"/><path d="M78 74h20" stroke-width="12"/>
  </g>
  <circle cx="60" cy="30" r="13" fill="#D89B3C"/>
</svg>
```

### 4.3 Mark 7B — "Runner"

Solid rows flanking an ochre runner; the aisle floor is a positive shape. Bolder, reads faster, holds up better small — at the cost of the seating detail.

`public/brand/avenue-mark-7b.svg`
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 114" role="img" aria-label="Avenue">
  <path d="M30 106 L90 106 L69 28 L51 28 Z"  fill="#D89B3C"/>
  <path d="M4 106 L26 106 L49 28 L42 28 Z"   fill="#B4502A"/>
  <path d="M116 106 L94 106 L71 28 L78 28 Z" fill="#B4502A"/>
  <circle cx="60" cy="15" r="8" fill="#B4502A"/>
</svg>
```

| Variant | Change |
|---|---|
| **On dark** | rows and dot `#F2D9A8`, runner stays `#D89B3C` |
| **Monochrome** | rows and dot `#2B2118`, runner `#6B5E4F` — **needs the tonal split to stay legible, do not flatten to one value** |
| **Favicon / ≤24px** | widen the runner, drop the dot |

`public/brand/avenue-favicon-7b.svg`
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 114" role="img" aria-label="Avenue">
  <path d="M28 108 L92 108 L70 26 L50 26 Z"  fill="#D89B3C"/>
  <path d="M2 108 L24 108 L48 26 L40 26 Z"   fill="#B4502A"/>
  <path d="M118 108 L96 108 L72 26 L80 26 Z" fill="#B4502A"/>
</svg>
```

### 4.4 Lockup rules — get this exactly right

| Rule | Value |
|---|---|
| Mark height | **0.80em** of the wordmark font-size |
| Vertical alignment | mark's bottom edge sits **on the baseline** |
| Gap, mark → "venue" | **0.03em**. Tight — they must read as one word, not a logo beside a word |
| Wordmark face | Fraunces, `opsz 90, SOFT 10, WONK 0`, wght 700, letter-spacing `-0.035em` |
| Wordmark colour | `ink #2B2118` on light · `#FFFFFF` on dark |
| Capitalisation | the "v" of "venue" is **lowercase, always**. `[mark]Venue` breaks the wordplay |
| Minimum clear space | the diameter of the mark's ochre dot, on all four sides |
| Minimum legible size | **96px wide**. Below that use the mark alone |
| Forbidden backgrounds | never on ochre or terracotta. Cream, white or ink only |
| Forbidden | do not outline, add shadows, rotate, skew, recolour, or animate the lockup |

### 4.5 `src/components/brand/AvenueMark.jsx`

```jsx
// Single source of truth for the mark. Switch VARIANT once Favour decides.
const VARIANT = '7a'   // '7a' | '7b'  ← see §1.1, do not change without asking

const TONES = {
  '7a': {
    default: { row: '#B4502A', dot: '#D89B3C' },
    dark:    { row: '#F2D9A8', dot: '#D89B3C' },
    mono:    { row: '#2B2118', dot: '#2B2118' },
  },
  '7b': {
    default: { row: '#B4502A', runner: '#D89B3C', dot: '#B4502A' },
    dark:    { row: '#F2D9A8', runner: '#D89B3C', dot: '#F2D9A8' },
    mono:    { row: '#2B2118', runner: '#6B5E4F', dot: '#2B2118' },
  },
}

export default function AvenueMark({ tone = 'default', compact = false, ...props }) {
  const c = TONES[VARIANT][tone]

  if (VARIANT === '7a') {
    return compact ? (
      <svg viewBox="0 0 120 114" fill="none" role="img" aria-label="Avenue" {...props}>
        <g stroke={c.row} strokeLinecap="round">
          <path d="M6 102h30" strokeWidth="15"/><path d="M84 102h30" strokeWidth="15"/>
          <path d="M22 74h20" strokeWidth="12"/><path d="M78 74h20" strokeWidth="12"/>
        </g>
        <circle cx="60" cy="30" r="13" fill={c.dot}/>
      </svg>
    ) : (
      <svg viewBox="0 0 120 114" fill="none" role="img" aria-label="Avenue" {...props}>
        <g stroke={c.row} strokeLinecap="round">
          <path d="M8 104h26"  strokeWidth="11"/><path d="M86 104h26" strokeWidth="11"/>
          <path d="M16 87h22"  strokeWidth="9.5"/><path d="M82 87h22"  strokeWidth="9.5"/>
          <path d="M24 70h18"  strokeWidth="8"/><path d="M78 70h18"    strokeWidth="8"/>
          <path d="M32 53h14"  strokeWidth="6.5"/><path d="M74 53h14"  strokeWidth="6.5"/>
          <path d="M40 36h10"  strokeWidth="5"/><path d="M70 36h10"    strokeWidth="5"/>
        </g>
        <circle cx="60" cy="18" r="8.5" fill={c.dot}/>
      </svg>
    )
  }

  return compact ? (
    <svg viewBox="0 0 120 114" role="img" aria-label="Avenue" {...props}>
      <path d="M28 108 L92 108 L70 26 L50 26 Z"  fill={c.runner}/>
      <path d="M2 108 L24 108 L48 26 L40 26 Z"   fill={c.row}/>
      <path d="M118 108 L96 108 L72 26 L80 26 Z" fill={c.row}/>
    </svg>
  ) : (
    <svg viewBox="0 0 120 114" role="img" aria-label="Avenue" {...props}>
      <path d="M30 106 L90 106 L69 28 L51 28 Z"  fill={c.runner}/>
      <path d="M4 106 L26 106 L49 28 L42 28 Z"   fill={c.row}/>
      <path d="M116 106 L94 106 L71 28 L78 28 Z" fill={c.row}/>
      <circle cx="60" cy="15" r="8" fill={c.dot}/>
    </svg>
  )
}
```

### 4.6 `src/components/brand/Logo.jsx`

```jsx
import AvenueMark from './AvenueMark'

/**
 * variant: 'full'      → [mark]venue   (primary lockup)
 *          'mark'      → mark alone
 *          'wordmark'  → "avenue" as text, no mark
 * tone:    'default' | 'dark' | 'mono'
 * size:    font-size in px; the mark scales from it
 */
export default function Logo({ variant = 'full', tone = 'default', size = 32, className }) {
  const color = tone === 'dark' ? '#FFFFFF' : '#2B2118'

  if (variant === 'mark') {
    return <AvenueMark tone={tone} style={{ height: size, width: 'auto' }} className={className} />
  }

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'flex-end',
        gap: '0.03em',
        fontSize: size,
        lineHeight: 0.78,
      }}
    >
      {variant === 'full' && (
        <AvenueMark tone={tone} style={{ height: '0.80em', width: 'auto', display: 'block' }} />
      )}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontVariationSettings: "'opsz' 90, 'SOFT' 10, 'WONK' 0",
          fontWeight: 700,
          letterSpacing: '-0.035em',
          lineHeight: 0.78,
          color,
        }}
      >
        {variant === 'wordmark' ? 'avenue' : 'venue'}
      </span>
    </span>
  )
}
```

Use `<Logo />` everywhere a logo appears: navbar, footer, auth pages, admin header, emails. Delete the current `"V"` box + `"VOGUE"` text in `src/app/page.jsx` and the `"VOGUE EVENTS"` string in `src/app/admin/login/page.jsx`.

### 4.7 Required exports — `public/brand/`

```
avenue-mark-7a.svg              avenue-mark-7b.svg
avenue-mark-7a-dark.svg         avenue-mark-7b-dark.svg
avenue-mark-7a-mono.svg         avenue-mark-7b-mono.svg
avenue-favicon-7a.svg           avenue-favicon-7b.svg
favicon.ico                     (32 + 16, from the compact variant)
apple-touch-icon.png            (180×180, mark on cream, 18% padding)
icon-192.png  icon-512.png      (maskable: mark on terracotta, 20% safe-area padding)
avenue-lockup.svg               (outlined text — MANUAL, see §1.3)
avenue-lockup-dark.svg          avenue-lockup-mono.svg
og-image.png                    (1200×630, lockup on cream, motif at the edges)
```

**Static SVG warning:** an `.svg` containing `<text font-family="Fraunces">` only renders correctly where Fraunces is loaded. For print, social cards, or any distributable asset, the wordmark must be **converted to outlines** in a vector editor with the real font file. Do not ship a `<text>`-based SVG as a standalone asset. In-app, always use `<Logo />` — it composes live text and stays crisp at every size.

Also create `src/app/manifest.json` — none exists today.

---

## 5. Payment model — DECIDED, build this

Modelled on **inDrive**, which deliberately never holds funds: passengers pay drivers directly, and in Nigeria inDrive simply surfaces the driver's bank details in-app for a direct transfer. Avenue does the same, plus the protections that events need and ride-hailing doesn't.

**Avenue never holds money.** No escrow, no gateway, no wallet at launch. This keeps the product out of CBN licensing territory and matches how the market already pays.

### 5.1 Flow

1. Hirer accepts a bid → hire created
2. Both agree payment terms, recorded on the hire: **deposit amount**, **balance amount**, due dates
3. Provider's bank details are revealed to the hirer (only after the hire exists — never before)
4. Hirer transfers in their own banking app
5. Hirer taps **"I've sent the deposit"**, optionally uploading a receipt screenshot → posts as a structured system message into the existing conversation thread
6. Provider checks their **real bank app**, then taps **"Received"** or **"Not received"**
7. Both timestamps land on the hire. Repeat for the balance.

### 5.2 The two rules that must not be got wrong

**A receipt upload is never proof and never a state change.**
Forged bank transfer screenshots are a documented scam pattern in this market. The status after an upload is **"deposit marked as sent"** — never "paid", never a green tick. Status flips to paid **only** when the provider confirms from their own bank app. If the UI ever renders an upload as a confirmed-payment state, it has built the exact affordance the scam relies on.

**Avenue cannot enforce anything, and the UI must not imply otherwise.**
Binance can arbitrate because it holds the crypto. Avenue holds nothing. A dispute produces evidence and consequences — trust signals, suspension, delisting — **not a refund**. Never use wording like "protected", "guaranteed", "secured" or "we'll refund you". Accurate wording: *"Avenue records payments but does not hold or transfer funds."* Put that line where payment terms are agreed.

### 5.3 Anti-fraud requirements

- **The provider's payout account name must match the name on their verified government ID.** You already collect that ID at verification. This is the single cheapest anti-fraud lever available — it stops payouts into mule accounts and attaches a verified identity to any money that goes missing.
- **Bank detail changes require re-verification.** Account swapping is a classic account-takeover move. Changing bank details resets `is_verified` to false, or at minimum flags the account and notifies the user by email.
- **Warn on off-platform pressure.** If either party proposes moving the conversation off Avenue, surface a warning — moving off-app early is itself a documented scam signal.
- **Never reveal bank details before a hire exists.** They live behind the hire, not on the public profile.

### 5.4 Schema

```sql
-- Payout details, on profiles
alter table profiles add column payout_bank_name    text;
alter table profiles add column payout_account_no   text;
alter table profiles add column payout_account_name text;
alter table profiles add column payout_verified_at  timestamptz;

-- Payment terms + commission, on hires
alter table hires add column deposit_amount   numeric;
alter table hires add column balance_amount   numeric;
alter table hires add column deposit_due_at   date;
alter table hires add column balance_due_at   date;
alter table hires add column currency         text not null default 'NGN';
alter table hires add column commission_rate  numeric not null default 0;
alter table hires add column commission_amount numeric not null default 0;

create type payment_kind   as enum ('deposit','balance');
create type payment_status as enum ('pending','marked_sent','confirmed','disputed');

create table payments (
  id            uuid primary key default gen_random_uuid(),
  hire_id       uuid not null references hires(id) on delete cascade,
  kind          payment_kind   not null,
  amount        numeric        not null,
  currency      text           not null default 'NGN',
  status        payment_status not null default 'pending',
  proof_path    text,                       -- private bucket path, NOT a public URL
  reference     text,                       -- bank transfer reference, optional
  marked_sent_at  timestamptz,
  confirmed_at    timestamptz,
  disputed_at     timestamptz,
  dispute_reason  text,
  created_at    timestamptz not null default now(),
  unique (hire_id, kind)
);
```

**Commission is computed and stored on every hire from day one at rate 0.** That way switching revenue on later is a config change plus a top-up flow, not a migration. Do not skip the fields because the rate is zero.

RLS: a `payments` row is readable and writable only by the parent hire's `hirer_id` and `provider_id`, plus admins. `proof_path` points into the **private** `payment-proofs` bucket — serve via signed URLs with a short TTL, never a public URL. These screenshots contain account numbers and balances.

### 5.5 Revenue — free at launch

No commission, no subscription, no fees. The fields exist and compute at zero.

Reasoning: marketplaces die of empty supply, not missing revenue. Charging providers before there are jobs worth winning is how you never get providers — and Bark's pay-per-lead model applied too early is the cautionary tale in the research.

When Favour switches it on, the planned mechanism is inDrive's: providers hold a small prepaid balance, commission debits per confirmed hire, zero balance blocks new bids. That needs Paystack or Flutterwave for top-ups. **Do not build any of it now.**

---

## 6. Admin auth — DECIDED, replace entirely

**Current state is a P0 vulnerability.** `POST /api/admin/auth` compares a password to `process.env.ADMIN_PASSWORD` and sets `admin_session=authenticated` — a static, unsigned cookie value. Anyone who sets that cookie by hand gets full admin, including the service-role-backed verification approval endpoint. There is no rate limiting.

**Decision: real admin accounts. No interim patch.**

1. `alter table profiles add column is_admin boolean not null default false;`
2. Delete `src/app/api/admin/auth/route.js` entirely
3. Delete `src/app/admin/login/page.jsx` — admins log in through the normal login page
4. `src/proxy.js`: replace the `admin_session` cookie check with a Supabase session lookup + `is_admin` check
5. `src/app/admin/page.jsx` and `src/app/api/admin/verify/route.js`: **drop the service-role client** wherever RLS can do the job. Service role bypasses all RLS; with real admin identities you can write policies instead and shrink the blast radius enormously. Keep service role only where genuinely unavoidable, and document why at the call site
6. RLS policies: admins can read all `verification_applications` and update `profiles.is_verified` / `verification_status`. Nothing else
7. Remove `ADMIN_PASSWORD` from `.env.example` and `docker-compose.yml`

**MANUAL (§1.4):** creating the first admin needs a real Supabase auth account. Write the migration and the one-line SQL to set the flag; Favour runs it against their own account.

---

## 7. Database — verify before you change

You have Supabase access. **Do this before writing any application code that depends on the schema.**

### 7.1 Export what exists

Introspect the live database and write everything into `supabase/migrations/` as versioned SQL. **There are currently no migrations in the repo at all** — the schema exists only in the dashboard, which means no review, no reproducibility, no rollback.

Capture: all table definitions, every RLS policy, every trigger and function, indexes, enums, and storage bucket policies.

### 7.2 Answer these five questions and report back

Each of these columns is **read by the UI but written by no application code**. Either an invisible DB trigger maintains it, or the feature is silently broken. Find out which:

| Column | Read by | Verify |
|---|---|---|
| `notifications` (whole table) | `Navbar.jsx` — fetch + realtime subscribe | Does any trigger insert rows? Is Realtime replication enabled on the table? |
| `jobs.bids_count` | `JobBoard`, `MyJobs`, dashboards | Trigger on `bids` insert/delete? |
| `profiles.average_rating` | provider cards, profiles, top-providers | Trigger on `reviews` insert? |
| `profiles.completed_events` | provider cards, profiles | Trigger on `hires` completion? |
| `conversations.hirer_unread` / `provider_unread` | message badges | **Provably broken** — `messages/[id]/page.jsx` zeroes them, `POST /api/messages` never increments. Confirm and fix |

If triggers exist → export them to migrations, done. If they don't → implement them as triggers, not route-level inserts, so the invariant holds no matter what writes the row. Commit as migrations either way.

Notification types the UI already renders (`Navbar.jsx` `NOTIF_CONFIG`), so match these exactly: `new_bid`, `bid_accepted`, `hire_confirmed`, `new_message`, `new_review`.

Required inserts: `POST /api/bids` → `new_bid` to hirer · `POST /api/hires` → `bid_accepted` to winner, `bid_rejected` to others · `POST /api/reviews` → `new_review` to reviewee · `POST /api/messages` → `new_message` to recipient **plus increment their unread counter**.

### 7.3 Report before changing

Post a summary of what you found — which triggers exist, which don't, what RLS looks like, which buckets are public — and wait for Favour's go-ahead before applying anything destructive.

---

## 8. Audit findings

Severity: **P0** blocks launch · **P1** visible breakage · **P2** polish/debt.

**Confirmed non-issue:** `src/proxy.js` is correct. Next.js 16 renamed middleware to `proxy`. Don't "fix" it.

### P0
- **Notifications never created** — see §7.2. The bell is the app's main activity surface and is currently guaranteed empty.
- **`/api/metrics` is completely unauthenticated** and exposes process memory, uptime, host load average and Node version to the public internet. Restrict to the internal network.
- **Prometheus (`:9090`) and Grafana (`:4000`) are published on all interfaces** in `docker-compose.yml`. Bind to localhost or an internal network.
- **Plaintext credential committed:** `GF_SECURITY_ADMIN_PASSWORD=vogue2024`. Move to env; Favour rotates the actual value (§1.4).
- **Admin auth is forgeable** — see §6.

### P1
- **`/jobs/[id]/edit` does not exist** but `JobDetail.jsx` links to it under "Manage Job" → 404. There is also **no way to close, cancel or delete a job** anywhere in the product.
- **Mobile bottom nav shows to logged-out visitors.** `MobileNav` is mounted unconditionally in `layout.tsx` and only hides on `/login`, `/signup`, `/onboarding`, `/forgot-password` — so a logged-out visitor on the marketing landing page gets a bar linking to Dashboard, Messages and Profile. It also links "Profile" to `/profile/edit` rather than the user's public profile.
- **Two parallel colour systems** — §3.1.2. This is Task 1.
- **Login and signup look like a different product** — `(auth)/login` and `(auth)/signup` use indigo (`focus:ring-indigo-500`, `bg-indigo-600`), `rounded-2xl` cards, `bg-gray-50`, and an emoji (📬) on the confirmation screen, against the 4px-radius system used everywhere else *including* the admin login. These are the two highest-traffic conversion pages in the product.
- **Currency defaults to USD in a Nigeria-first product.** `POST /api/jobs` → `currency: body.currency || 'USD'`; `jobs/new/page.jsx` initialises `currency: 'USD'`. Default to **NGN**, order the currency list Nigeria-first. The symbol map already has `NGN: '₦'`.
- **`MyBids.jsx` hardcodes `${Number(bid.amount)}`** with a literal dollar sign, ignoring the job's currency entirely. Correctness bug, not a preference.
- **Nominatim called client-side** from `jobs/new` and `onboarding` on a 400ms debounce. OSM's policy requires an identifying User-Agent (impossible from a browser) and rate-limits hard; failures are swallowed (`catch { setResults([]) }`) so the user just sees nothing. This is in the critical path of both onboarding and job posting. Proxy through an API route with a proper User-Agent and caching.
- **`.env.example` exists locally but is gitignored.** `.gitignore` has a blanket `.env*`, which swallows the example file too — so nobody cloning the repo ever gets it. Add an exception: `!.env.example`. Verify the committed version contains **keys with empty values only**, never real secrets.
- **`terraform/` is untracked entirely.** `main.tf`, `variables.tf` and `outputs.tf` exist on Favour's machine but `git ls-files terraform/` returns nothing — the infrastructure definition lives on one laptop and is not version controlled. Commit those three files. (`terraform.tfstate`, `terraform.tfstate.backup`, `terraform.tfvars` and `.terraform/` are correctly ignored and **must stay ignored** — tfstate routinely contains plaintext secrets.)

### P2
- Native `confirm()` in the hire flow (`JobDetail.jsx`) — blocking, unstyleable, and this is the highest-stakes action in the product. Replace with a real modal.
- `console.log('Realtime status:', status)` left in `Conversation.jsx`.
- `.single()` where zero rows is a normal outcome (`/api/conversations` existence check, `verification/apply` lookup) → `.maybeSingle()`.
- `POST /api/bids` hardcodes `availability_confirmed: true` — never actually collected from the provider.
- `Feed.jsx` share text hardcodes `"open for bids on Vogue Events"`.
- `POST /api/jobs` doesn't validate that `event_date` is in the future.
- No `loading.jsx`, `error.jsx` or `not-found.jsx` anywhere in the App Router tree — every failure is an unstyled Next.js default.
- `ProfileEdit` can't change `role`; a user who picks wrong at signup is stuck forever.
- No tests of any kind.

---

## 9. Nigeria-first — what it means in code

From real research (`avenue-brand-research` in the project). Not decoration.

**Trust is the product's core problem.** In stranger-to-stranger transactions, someone has to go first. Reviews are easy to fake; bank transfers have no chargeback. The dominant scam is **advance-payment fraud**. Avenue's ID verification is a genuine differentiator over Bark and Thumbtack, which don't verify at all — surface it everywhere, never bury it.

**Keep conversations in-platform.** Moving a chat off-app early is itself a scam signal. The existing realtime messaging is an asset — make it feel like a familiar chat (WhatsApp is the mental model), not a ticketing form.

**Performance is a hard requirement.** Entry-level Android on metered data:
- Lazy-load and compress all portfolio media. `PortfolioUpload` currently accepts video with no transcoding or size cap — fix that.
- Keep the JS payload small. Motifs are CSS-only for this reason. Don't add animation libraries.
- Design explicit offline states — "saved, will send when the connection returns".
- Test on a throttled connection and a low-end device, not a laptop.

**Bank transfer is the trusted rail.** That's why the payment model is built on it rather than card payments.

---

## 10. Code conventions

- Functional components, hooks. `'use client'` only where genuinely needed; keep data fetching in Server Components.
- **Aligned-colon object formatting is house style** — keep it:
  ```js
  const { data } = await supabase.from('hires').insert({
    job_id,
    hirer_id:    user.id,
    provider_id: bid.provider_id,
  })
  ```
- Section comments use `// ── Label ──`.
- Imports via the `@/` alias.
- **Prefer Tailwind utilities.** The inline `style={{}}` colour objects are being *removed* — never add more.
- **API routes:** `getUser()` first → verify the caller owns the resource → validate input → return `{ error }` with a real status code. Follow the shape in `src/app/api/*/route.js`.

### Non-negotiables
- Never commit secrets. Check `docker-compose.yml` and `.env*` before every commit.
- Never restyle the verified badge.
- Never use Fraunces at 15px or below.
- Never add another local `const T = {...}` colour object.
- Never hardcode the literal string "Avenue" in JSX — import `PRODUCT_NAME`.
- Respect `prefers-reduced-motion` on every animation.
- Never imply Avenue holds, protects or guarantees money.
- Don't add dependencies without asking — bundle size is a product constraint.

**Before marking anything done:** `npm run lint`, `npm run build`, and `npx tsc --noEmit` must all pass. CI runs all three.

---

## 11. Roadmap

### Phase 1 — Foundation
1. **Consolidate the colour system** (§3.1.2). One source of truth; delete every local `T` object. *Blocks everything below.*
2. **Verify and export the database** (§7). Report findings before changing anything.
3. **Apply the Avenue palette** to the consolidated tokens.
4. **Typography** — self-host and subset both fonts, wire the type scale, run the diacritics gate (§3.2.5) and get Favour's confirmation.
5. **Rename Vogue → Avenue.** `package.json`, `package-lock.json`, `src/lib/brand.js` (new), `layout.tsx` metadata, footer wordmark in `app/page.jsx`, admin login header, `Feed.jsx` share text, `docker-compose.yml` service + container names, `monitoring/prometheus.yml` job name, `monitoring/grafana/provisioning/dashboards/vogue-events.json` title + filename, `.github/workflows/ci.yml` name.
6. **Logo + icons** — `AvenueMark.jsx`, `Logo.jsx`, asset exports, `manifest.json`. Ask about 7A vs 7B first.

### Phase 2 — Polish
7. Rebuild `(auth)/login` and `(auth)/signup` on the design system.
8. Fix the mobile nav auth and route bugs.
9. Implement the motif system — hero animation, `Ntupo` dividers, `Agwọ` spinner, `Ọnụ ụzọ` empty states, `Ìsì` on hire confirmation.
10. Add `loading.jsx` / `error.jsx` / `not-found.jsx` across the route tree, using the motifs.
11. Replace `confirm()` with a real modal; remove the stray `console.log`.

### Phase 3 — Completion
12. Notifications and counters (§7.2) — triggers, committed as migrations.
13. Build or remove `/jobs/[id]/edit`; add close / cancel / delete for jobs.
14. Default currency to NGN; fix the hardcoded `$` in `MyBids`.
15. Proxy Nominatim server-side with caching and real error states.
16. **Payment model** (§5) — schema, bank details with ID name match, deposit/balance terms, proof upload to the private bucket, two-sided confirmation, dispute flag.

### Phase 4 — Production readiness
17. **Admin accounts** (§6) — this is P0, pull it earlier if launch nears.
18. Secrets: rotate Grafana out of the repo; un-ignore `.env.example` (`!.env.example`) and confirm it holds empty values only; commit `terraform/*.tf` while keeping state and tfvars ignored.
19. Lock down `/api/metrics` and the Prometheus/Grafana ports.
20. Tests. Start with API route auth boundaries: bids, hires, reviews, payments.

---

## 12. Open decisions

| # | Decision | Status |
|---|---|---|
| 1 | **Logo 7A or 7B** | **DECIDED — 7A** ("Seated rows"), 2026-08-19. `AvenueMark.jsx` pins `VARIANT = '7a'`; 7B kept in the component for reference only |
| 2 | **Product name** | "Avenue" is provisional and may change. Keep it centralised |
| 3 | Payment model | **DECIDED** — inDrive-style direct pay + deposit protection (§5) |
| 4 | Revenue | **DECIDED** — free at launch, commission fields at rate 0 (§5.5) |
| 5 | Admin model | **DECIDED** — real admin accounts, no interim patch (§6) |
