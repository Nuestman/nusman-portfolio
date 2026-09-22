import React from 'react'
import { Link } from 'react-router-dom'
import { LegalDoc } from '../components/LegalDoc'
import { LEGAL_CONTACT } from '../content/privacy'
import { TERMS_LAST_UPDATED, TERMS_SECTIONS } from '../content/terms'
import { usePageMeta } from '../hooks/usePageMeta'

const TermsPage: React.FC = () => {
  usePageMeta({
    title: 'Terms of Service · Numan Usman',
    description:
      'Terms for nusman.dev, the client Portal, and project engagements with Numan Usman / NUsman Tech Solutions.',
    path: '/terms',
  })

  return (
    <LegalDoc
      title="Terms of Service"
      lastUpdated={TERMS_LAST_UPDATED}
      sections={TERMS_SECTIONS}
      intro={
        <p>
          These Terms govern your use of {LEGAL_CONTACT.siteName} and the
          client Portal, and sit alongside any written project agreement. Read
          them with our{' '}
          <Link
            to="/privacy"
            className="text-gold-600 underline hover:text-gold-700"
          >
            Privacy Policy
          </Link>
          .
        </p>
      }
      footerNote={
        <p>
          Questions about these Terms:{' '}
          <a
            href={`mailto:${LEGAL_CONTACT.email}?subject=Terms%20of%20Service`}
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

export default TermsPage
