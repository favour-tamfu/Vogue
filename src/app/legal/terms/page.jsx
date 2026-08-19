import ContentPage, { Section, NeedsReview } from '@/components/layout/ContentPage'
import { PRODUCT_NAME } from '@/lib/brand'

export const metadata = {
  title:       `Terms · ${PRODUCT_NAME}`,
  description: `The terms that govern use of ${PRODUCT_NAME}.`,
}

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      title="Terms of use"
      intro={`The rules for using ${PRODUCT_NAME}, and the limits of what we do.`}
    >
      <NeedsReview>
        This is a plain-language description of how the product works. It has{' '}
        <strong>not</strong> been drafted or reviewed by a lawyer and is not yet an
        enforceable agreement. Before launch it needs proper terms covering governing
        law and jurisdiction, liability limits, dispute resolution, account termination,
        and the contractual relationship between hirer and provider.
      </NeedsReview>

      <Section title="What Avenue is">
        <p>
          {PRODUCT_NAME} is a marketplace. We introduce hirers to event-service
          providers and give them the tools to agree terms, message each other, record
          payments, and review each other afterwards.
        </p>
        <p>
          The contract for the actual work is between the hirer and the provider. We
          are not a party to it, we do not supply event services, and we do not employ
          providers.
        </p>
      </Section>

      <Section title="Money">
        <p className="font-semibold text-ink">
          {PRODUCT_NAME} does not hold, transfer, or take custody of funds. There is no
          escrow. Hirers pay providers directly by bank transfer.
        </p>
        <p>
          Because we never hold the money, we cannot reverse a payment or issue a
          refund. Marking a payment as sent is a claim by the payer; a payment is only
          confirmed when the recipient verifies it in their own bank. A screenshot is
          not proof.
        </p>
        <p>
          {PRODUCT_NAME} is free to use at launch. No commission is charged on hires.
        </p>
      </Section>

      <Section title="Verification">
        <p>
          Providers must pass identity verification before bidding. Verification
          confirms identity only — it is not an endorsement of skill, availability, or
          conduct on any particular job.
        </p>
        <p>
          Submitting false documents, or using an account that belongs to someone else,
          will result in removal from the platform.
        </p>
      </Section>

      <Section title="What we expect from you">
        <div className="space-y-2">
          {[
            'Give accurate information about who you are and what you can do.',
            'Keep job conversations on the platform until a hire exists.',
            'Pay what you agreed, when you agreed to pay it.',
            'Show up to the job you accepted, or give the other party real notice.',
            'Leave reviews that reflect what actually happened.',
          ].map(rule => (
            <p key={rule}>— {rule}</p>
          ))}
        </div>
      </Section>

      <Section title="What we can do about breaches">
        <p>
          We can suspend or remove an account, revoke verification, and delist a
          provider. We can preserve records of a conversation for use in a dispute.
        </p>
        <p>
          We cannot compel payment, recover funds, or guarantee that any job is
          performed.
        </p>
      </Section>
    </ContentPage>
  )
}
