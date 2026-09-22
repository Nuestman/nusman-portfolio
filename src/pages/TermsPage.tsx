import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LegalDoc } from '../components/LegalDoc'
import { LEGAL_CONTACT } from '../content/privacy'
import { TERMS_DOC } from '../content/terms'
import type { LegalDocument } from '../content/privacy'
import { usePageMeta } from '../hooks/usePageMeta'
import { fetchLegalDocument } from '../lib/legal-api'

const TermsPage: React.FC = () => {
  const [doc, setDoc] = useState<LegalDocument>(TERMS_DOC)

  usePageMeta({
    title: 'Terms of Service · Numan Usman',
    description:
      'Terms for nusman.dev, the client Portal, and project engagements with Numan Usman / Nuestman Tech Solutions.',
    path: '/terms',
  })

  useEffect(() => {
    let cancelled = false
    void fetchLegalDocument('terms', TERMS_DOC).then((next) => {
      if (!cancelled) {
        setDoc(next)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <LegalDoc
      title={doc.title}
      lastUpdated={doc.lastUpdated}
      sections={doc.sections}
      intro={
        <>
          <p>{doc.intro}</p>
          <p>
            Read them with our{' '}
            <Link
              to="/privacy"
              className="text-gold-600 underline hover:text-gold-700"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </>
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
