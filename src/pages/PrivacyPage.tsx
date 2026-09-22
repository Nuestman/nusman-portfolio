import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LegalDoc } from '../components/LegalDoc'
import {
  LEGAL_CONTACT,
  PRIVACY_DOC,
  type LegalDocument,
} from '../content/privacy'
import { usePageMeta } from '../hooks/usePageMeta'
import { fetchLegalDocument } from '../lib/legal-api'

const PrivacyPage: React.FC = () => {
  const [doc, setDoc] = useState<LegalDocument>(PRIVACY_DOC)

  usePageMeta({
    title: 'Privacy Policy · Numan Usman',
    description:
      'How Nuestman Tech Solutions / nusman.dev collects, uses, and protects personal data — Ghana Act 843 and GDPR where applicable.',
    path: '/privacy',
  })

  useEffect(() => {
    let cancelled = false
    void fetchLegalDocument('privacy', PRIVACY_DOC).then((next) => {
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
            See also our{' '}
            <Link
              to="/terms"
              className="text-gold-600 underline hover:text-gold-700"
            >
              Terms of Service
            </Link>
            .
          </p>
        </>
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
