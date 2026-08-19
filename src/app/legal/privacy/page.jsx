import ContentPage, { Section, NeedsReview } from '@/components/layout/ContentPage'
import { PRODUCT_NAME } from '@/lib/brand'

export const metadata = {
  title:       `Privacy · ${PRODUCT_NAME}`,
  description: `What data ${PRODUCT_NAME} collects, why, and who can see it.`,
}

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      title="Privacy"
      intro={`What ${PRODUCT_NAME} collects, why we collect it, and who can see it.`}
    >
      <NeedsReview>
        This page describes what the product actually does today, and it is accurate
        on that. It is <strong>not</strong> a finished privacy notice. Before launch it
        needs review against the Nigeria Data Protection Act 2023 — including the
        lawful basis for processing government ID, the retention period for those
        documents, the data-subject request process, and a named data controller with
        contact details.
      </NeedsReview>

      <Section title="What we collect">
        <p>
          <strong className="text-ink">Account details.</strong> Your name, email
          address, phone number if you provide one, location, role, and anything you
          choose to put in your bio or profile photo.
        </p>
        <p>
          <strong className="text-ink">Verification documents.</strong> If you apply to
          become a provider, a government-issued ID and the links you supply to your
          professional work.
        </p>
        <p>
          <strong className="text-ink">Activity on the platform.</strong> Jobs you post,
          bids you place, hires, reviews you write and receive, portfolio uploads, and
          messages you send through the platform.
        </p>
        <p>
          <strong className="text-ink">Payment records.</strong> The amounts and dates
          you record against a hire, and any transfer receipt you upload. We do not
          collect or store card details, and we never take custody of your money.
        </p>
      </Section>

      <Section title="Who can see what">
        <p>
          <strong className="text-ink">Public.</strong> Your name, profile photo,
          location, bio, service categories, portfolio, average rating, and reviews.
          Anyone can see these, including people who are not logged in.
        </p>
        <p>
          <strong className="text-ink">Only the other party to a hire.</strong> Bank
          details are revealed to the hirer only after a hire exists — never from a
          public profile — and the conversation is visible only to the two of you.
        </p>
        <p>
          <strong className="text-ink">Only administrators.</strong> Your government ID
          is stored in a private bucket, is served only through short-lived signed
          links, and is never shown to hirers or other providers.
        </p>
      </Section>

      <Section title="Your choices">
        <p>
          You can edit or remove most profile information at any time from your profile
          settings. Changing your payout bank details will require re-verification,
          because account swapping is a common account-takeover technique.
        </p>
        <NeedsReview>
          Account deletion and data export are not built yet. Both are required before
          this page can honestly claim to describe your rights.
        </NeedsReview>
      </Section>

      <Section title="Third parties">
        <p>
          The platform runs on Supabase, which hosts the database, authentication, and
          file storage. Location search is powered by OpenStreetMap&apos;s Nominatim
          service.
        </p>
      </Section>
    </ContentPage>
  )
}
