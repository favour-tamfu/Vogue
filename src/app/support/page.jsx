import Link from 'next/link'
import ContentPage, { Section, NeedsReview } from '@/components/layout/ContentPage'
import { PRODUCT_NAME } from '@/lib/brand'
import { LifeBuoy, Flag, KeyRound, Receipt } from 'lucide-react'

export const metadata = {
  title:       `Support · ${PRODUCT_NAME}`,
  description: `Get help with your account, a job, a bid, or a payment on ${PRODUCT_NAME}.`,
}

const TOPICS = [
  {
    icon: KeyRound,
    title: 'Account and verification',
    body: 'Verification usually takes 1–2 business days. If yours was rejected, the reason is on your verification page and you can correct your submission and reapply.',
    action: { label: 'Go to verification', href: '/verification/apply' },
  },
  {
    icon: Receipt,
    title: 'A payment problem',
    body: 'Check your bank first — a transfer can take time to land, and a screenshot from the other party is not confirmation. If the money genuinely has not arrived, raise it in the hire conversation so there is a record.',
    action: { label: 'Open messages', href: '/messages' },
  },
  {
    icon: Flag,
    title: 'Reporting someone',
    body: 'Report an account, a job post, or a message if you see identity mismatch, pressure to pay off-platform, or anything that looks like a scam. Include the job or conversation.',
    action: { label: 'Read the warning signs', href: '/trust' },
  },
]

export default function SupportPage() {
  return (
    <ContentPage
      eyebrow="Support"
      title="Get help"
      intro="Most questions fall into one of three buckets. Start here — and if none of these fit, get in touch directly."
    >
      <div className="space-y-3 mb-10">
        {TOPICS.map(t => (
          <div key={t.title} className="p-5 border border-line rounded-md bg-surface">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-xs
                              bg-terracotta-soft text-terracotta">
                <t.icon size={17} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="t-h3 text-ink mb-1">{t.title}</h3>
                <p className="text-sm leading-relaxed text-ink-2 mb-3">{t.body}</p>
                <Link
                  href={t.action.href}
                  className="inline-flex text-xs font-semibold text-terracotta hover:text-terracotta-deep"
                >
                  {t.action.label} →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Section title="Contact us">
        <p>
          If your question is not covered above, or you need to report something
          urgent, contact the team directly.
        </p>
        <NeedsReview>
          A real support channel still needs to be set up — a monitored inbox, a
          response-time commitment, and an escalation path for suspected fraud.
          Publishing a support page without a working address behind it is worse
          than not having one, so wire this up before launch.
        </NeedsReview>
      </Section>

      <Section title="What we can and cannot do">
        <p>
          We can suspend accounts, remove verification, delist providers, and preserve
          the record of a conversation. Those are real consequences and we use them.
        </p>
        <p className="font-semibold text-ink">
          We cannot recover or refund money. {PRODUCT_NAME} never holds your funds —
          payment goes directly from hirer to provider by bank transfer, and a
          completed transfer cannot be reversed by us.
        </p>
      </Section>

      <div className="flex items-start gap-3 p-5 border border-line rounded-md bg-cream-2">
        <LifeBuoy size={18} strokeWidth={1.5} className="text-ink-2 flex-shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed text-ink-2">
          Keeping your conversation on {PRODUCT_NAME} is the single most useful thing
          you can do for your own protection. If a dispute happens, the thread is the
          evidence.
        </p>
      </div>
    </ContentPage>
  )
}
