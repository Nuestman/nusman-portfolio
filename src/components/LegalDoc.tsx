import React from 'react'
import { Link } from 'react-router-dom'
import { LEGAL_CONTACT, type LegalSection } from '../content/privacy'

type LegalDocProps = {
  title: string
  intro: React.ReactNode
  lastUpdated: string
  sections: LegalSection[]
  footerNote: React.ReactNode
}

export function LegalDoc({
  title,
  intro,
  lastUpdated,
  sections,
  footerNote,
}: LegalDocProps) {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-white via-gray-50 to-gold-50">
      <article className="container mx-auto px-4 py-16 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600 mb-3">
          Legal
        </p>
        <h1 className="section-heading mb-3 text-dark-950">{title}</h1>
        <p className="text-lg text-gray-700 mb-2">
          {LEGAL_CONTACT.orgName}. Last updated: {lastUpdated}.
        </p>
        <div className="text-sm text-gray-600 mb-10 leading-relaxed space-y-3">
          {intro}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white/90 p-6 mb-12">
          <h2 className="font-heading text-2xl text-dark-950 mb-2">
            Controller &amp; contact
          </h2>
          <p className="font-medium text-dark-950">{LEGAL_CONTACT.orgName}</p>
          <p className="text-xs text-gray-500 mt-1">
            Registered with Ghana ORC and DPC as {LEGAL_CONTACT.registeredName}.
            Practice: {LEGAL_CONTACT.practiceName} ({LEGAL_CONTACT.siteName}).
          </p>
          <p className="text-sm text-gray-700 mt-3">{LEGAL_CONTACT.address}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a
              href={`mailto:${LEGAL_CONTACT.email}?subject=Privacy%20or%20Terms%20enquiry`}
              className="text-gold-600 underline hover:text-gold-700"
            >
              {LEGAL_CONTACT.email}
            </a>
            <a
              href={`tel:${LEGAL_CONTACT.phoneE164}`}
              className="text-gold-600 underline hover:text-gold-700"
            >
              {LEGAL_CONTACT.phone}
            </a>
            <a
              href={LEGAL_CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-600 underline hover:text-gold-700"
            >
              WhatsApp
            </a>
            <Link
              to="/contact"
              className="text-gold-600 underline hover:text-gold-700"
            >
              Contact page
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="font-heading text-2xl text-dark-950 mb-3">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.paragraphs.map((para, index) => (
                  <p
                    key={`${section.id}-${index}`}
                    className="text-gray-700 leading-relaxed text-sm md:text-base"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-600 leading-relaxed">
          {footerNote}
        </div>
      </article>
    </div>
  )
}
