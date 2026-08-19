// ── Currency ─────────────────────────────────────────────────────────────
// Nigeria first. NGN is the default everywhere; the list is ordered so the
// home market sits at the top of every picker.

export const DEFAULT_CURRENCY = 'NGN'

export const CURRENCY_SYMBOLS = {
  NGN:  '₦',
  USD:  '$',
  GBP:  '£',
  EUR:  '€',
  GHS:  'GH₵',
  XAF:  'FCFA',
  KES:  'KSh',
  ZAR:  'R',
}

export const CURRENCIES = Object.keys(CURRENCY_SYMBOLS)

export function symbolFor(currency) {
  return CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS[DEFAULT_CURRENCY]
}

/** A single amount, e.g. ₦450,000 */
export function formatMoney(amount, currency) {
  if (amount === null || amount === undefined || amount === '') return ''
  return `${symbolFor(currency)}${Number(amount).toLocaleString()}`
}

/** A budget range, e.g. ₦200,000 – ₦450,000 */
export function formatBudget(min, max, currency) {
  const sym = symbolFor(currency)
  if (min && max) return `${sym}${Number(min).toLocaleString()} – ${sym}${Number(max).toLocaleString()}`
  if (max)        return `Up to ${sym}${Number(max).toLocaleString()}`
  if (min)        return `From ${sym}${Number(min).toLocaleString()}`
  return 'Budget not set'
}
