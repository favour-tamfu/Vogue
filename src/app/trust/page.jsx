import ContentPage, { Section } from '@/components/layout/ContentPage'
import { PRODUCT_NAME } from '@/lib/brand'
import { ShieldCheck, IdCard, MessageSquareWarning, Landmark, Star } from 'lucide-react'

export const metadata = {
  title:       `Trust & Safety · ${PRODUCT_NAME}`,
  description: `How ${PRODUCT_NAME} verifies providers, how payments work, and what we can and cannot do.`,
}

const PILLARS = [
  {
    icon: IdCard,
    title: 'Identity is checked before anyone can bid',
    body: 'Every provider submits a government-issued ID and at least one link to their professional work. An administrator reviews both. Until that review passes, a provider cannot place a single bid.',
  },
  {
    icon: Landmark,
    title: 'Payment goes directly between the two parties',
    body: `Hirers pay providers by bank transfer, the rail this market already trusts. ${PRODUCT_NAME} never holds, moves, or takes custody of your money.`,
  },
  {
    icon: Star,
    title: 'Both sides review each other',
    body: 'After the event date, the hirer reviews the provider and the provider reviews the hirer. Accountability runs in both directions, so a rating is harder to game.',
  },
]

export default function TrustPage() {
  return (
    <ContentPage
      eyebrow="Trust & Safety"
      title="What we check, and what we can't"
      intro={`Stranger-to-stranger hiring only works if someone goes first. Here is exactly what ${PRODUCT_NAME} does to make that safer — and, just as importantly, where our protection ends.`}
    >
      {/* Pillars */}
      <div className="space-y-3 mb-12">
        {PILLARS.map(p => (
          <div key={p.title} className="flex items-start gap-4 p-5 border border-line rounded-md bg-surface">
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-xs
                            bg-verified-bg text-verified">
              <p.icon size={17} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="t-h3 text-ink mb-1">{p.title}</h3>
              <p className="text-sm leading-relaxed text-ink-2">{p.body}</p>
            </div>
          </div>
        ))}
      </div>

      <Section title="What the verified badge means">
        <p>
          The badge means an administrator has seen a government-issued ID for that
          account and matched it to the name on the profile. It means the person is
          who they say they are.
        </p>
        <p>
          It is not a guarantee of quality, availability, or honesty about a
          particular job. Read their reviews and their portfolio too. A verified
          identity is what makes consequences possible — it is not a promise that
          nothing will go wrong.
        </p>
      </Section>

      <Section title="How payment actually works">
        <p>
          Once you accept a bid, a hire is created and the provider&apos;s bank details
          become visible to you. You agree a deposit and a balance between yourselves,
          then transfer in your own banking app.
        </p>
        <p>
          When you have sent a payment you mark it as sent, and the provider confirms
          it only after checking their own bank. A screenshot is never proof of
          payment and never moves a payment to &ldquo;paid&rdquo; on its own — forged
          transfer receipts are a known scam, and we will not build the affordance
          that scam relies on.
        </p>
        <p className="font-semibold text-ink">
          {PRODUCT_NAME} records payments but does not hold or transfer funds. We
          cannot reverse a bank transfer, and we cannot refund you.
        </p>
      </Section>

      <Section title="What happens in a dispute">
        <p>
          If something goes wrong, tell us. We can act on the account: we can suspend
          it, remove its verification, and delist it. Because both sides review each
          other, a pattern of bad behaviour becomes visible to everyone who looks.
        </p>
        <p>
          What we cannot do is return your money. We never held it. Any service that
          tells you otherwise about a direct bank transfer is misleading you.
        </p>
      </Section>

      <Section title="Warning signs worth taking seriously">
        <div className="space-y-2">
          {[
            'Someone pushes to move the conversation to WhatsApp or SMS before a hire exists. Keeping it on Avenue is what gives you a record.',
            'A provider asks for the full amount up front, before any work or any agreed deposit terms.',
            'The name on the bank account does not match the name on the verified profile. Stop and ask.',
            'You are pressured to decide immediately, or told an offer expires in minutes.',
            'Someone sends you a payment screenshot and asks you to release work or goods on the strength of it. Check your own bank first.',
          ].map(w => (
            <div key={w} className="flex items-start gap-3 p-3 border border-line rounded-xs bg-surface">
              <MessageSquareWarning size={15} strokeWidth={1.5} className="text-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed text-ink-2">{w}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Reporting an account">
        <p>
          Use the Support page to report an account, a job post, or a message. Include
          the job or conversation so we can see the same thread you did. Reports about
          identity, payment pressure, or off-platform contact are looked at first.
        </p>
      </Section>

      <div className="flex items-start gap-3 p-5 border border-line rounded-md bg-verified-bg">
        <ShieldCheck size={18} strokeWidth={1.5} className="text-verified flex-shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed text-verified">
          Verification is the single strongest signal on this platform, and it is the
          thing most competitors do not do at all. If a provider is not verified, they
          cannot bid — and you should ask why.
        </p>
      </div>
    </ContentPage>
  )
}
