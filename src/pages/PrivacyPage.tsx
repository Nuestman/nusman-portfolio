import React from 'react'
import { Link } from 'react-router-dom'
import { LegalDoc } from '../components/LegalDoc'
import {
  LEGAL_CONTACT,
  PRIVACY_LAST_UPDATED,
  PRIVACY_SECTIONS,
} from '../content/privacy'
import { usePageMeta } from '../hooks/usePageMeta'

const PrivacyPage: React.FC = () => {
  usePageMeta({
    title: 'Privacy Policy · Numan Usman',
    description:
      'How NUsman Tech Solutions / nusman.dev collects, uses, and protects personal data — Ghana Act 843 and GDPR where applicable.',
    path: '/privacy',
  })

  return (
    <LegalDoc
      title="Privacy Policy"
      lastUpdated={PRIVACY_LAST_UPDATED}
      sections={PRIVACY_SECTIONS}
      intro={
        <p>
          This policy describes how we collect, use, and protect personal data
          in connection with {LEGAL_CONTACT.siteName}, the Start a project and
          Contact flows, and the client Portal. It is designed to align with
          the EU GDPR (where it applies) and Ghana’s Data Protection Act, 2012
          (Act 843). See also our{' '}
          <Link
            to="/terms"
            className="text-gold-600 underline hover:text-gold-700"
          >
            Terms of Service
          </Link>
          .
        </p>
      }
      footerNote={
        <p>
          For a copy of this policy or any privacy enquiry, contact{' '}
          <a
            href={`mailto:${LEGAL_CONTACT.email}?subject=Privacy%20policy`}
            className="text-gold-600 underline hover:text-gold-700"
          >
            {LEGAL_CONTACT.email}
          </a>{' '}
          or {LEGAL_CONTACT.phone}.
        </p>
      }
    />
  )
}

export default PrivacyPage
