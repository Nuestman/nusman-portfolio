import { LEGAL_CONTACT, type LegalSection } from './privacy'

export const TERMS_LAST_UPDATED = 'September 2026'

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: 'who',
    title: '1. Who these Terms apply to',
    paragraphs: [
      'These Terms apply to visitors of nusman.dev and to clients (and their authorised users) who use the client Portal or engage Numan Usman / NUsman Tech Solutions for project work.',
      'If you use the Portal or request work on behalf of an organisation, you confirm you have authority to bind that organisation to these Terms for that use.',
    ],
  },
  {
    id: 'regulatory',
    title: '2. Regulatory context',
    paragraphs: [
      'Our use of personal data is described in our Privacy Policy, which is designed to align with the EU GDPR (where it applies) and Ghana’s Data Protection Act, 2012 (Act 843).',
      'As Nuestman Links Enterprise, we are registered with Ghana’s Data Protection Commission and maintain internal governance for Act 843 compliance.',
    ],
  },
  {
    id: 'site-portal',
    title: '3. Website and Portal',
    paragraphs: [
      'The public site (nusman.dev) provides information about the practice and ways to start a conversation or project. You agree to use it lawfully and not to attempt unauthorised access or abuse of forms, APIs, or hosting.',
      'The client Portal (portal.nusman.dev) is available only to people we invite for an active or ongoing engagement. Portal access may use magic-link email authentication. You must keep access to your email secure and not share Portal links intended only for you.',
      'The Desk is an internal tool for delivering work. It is not offered as a self-serve public product under these Terms.',
    ],
  },
  {
    id: 'projects',
    title: '4. Project work',
    paragraphs: [
      'Paid design, build, and related services are governed by the proposal, statement of work, invoice, or other written agreement we share with you. Those documents take priority over these Terms if they conflict on fees, scope, timelines, or deliverables.',
      'You are responsible for the accuracy of information you provide, for decisions about your business or clinical operations, and for your own compliance with laws that apply to you. Software and advice we deliver support your work; they do not replace your policies, training, or professional judgement.',
    ],
  },
  {
    id: 'use',
    title: '5. Acceptable use',
    paragraphs: [
      'You agree not to misuse the site or Portal — including attempting to break security, scrape in a way that harms the service, upload unlawful content, or use Portal messaging for emergencies that need immediate medical or safety response.',
    ],
  },
  {
    id: 'ip',
    title: '6. Intellectual property',
    paragraphs: [
      'Unless a written project agreement says otherwise: (a) the nusman.dev site, branding, and practice materials remain ours; (b) deliverables we create for you under a paid engagement are licensed or assigned as set out in that engagement; (c) you keep ownership of materials you supply to us.',
    ],
  },
  {
    id: 'fees',
    title: '7. Fees and payment',
    paragraphs: [
      'Fees, deposits, and payment terms for project work are as set out in your proposal, invoice, or written agreement. Late payment may pause work until payment is received. Fees are generally non-refundable except where required by law or expressly stated in writing.',
    ],
  },
  {
    id: 'confidentiality',
    title: '8. Confidentiality',
    paragraphs: [
      'Each party will treat the other’s confidential information with reasonable care and use it only to provide or receive the services, or as otherwise agreed in writing or required by law.',
    ],
  },
  {
    id: 'warranty',
    title: '9. Warranties and disclaimers',
    paragraphs: [
      'We provide services with reasonable skill and care. To the maximum extent permitted by law, the website and Portal are provided “as is” and “as available,” and we do not guarantee uninterrupted or error-free operation.',
      'We do not warrant that use of the site, Portal, or deliverables alone will ensure your compliance with any particular law or regulation.',
    ],
  },
  {
    id: 'liability',
    title: '10. Limitation of liability',
    paragraphs: [
      'To the maximum extent permitted by law, neither party is liable for indirect, consequential, or special damages (including loss of profits, revenue, or data) arising from the site, Portal, or these Terms.',
      'Our aggregate liability for claims relating to the site, Portal, or these Terms is limited to the amounts you paid us for the relevant services in the 12 months before the claim, unless a different cap is set in a signed project agreement or required by law.',
    ],
  },
  {
    id: 'termination',
    title: '11. Suspension and termination',
    paragraphs: [
      'We may suspend Portal or site access if use poses a security risk, involves abuse, or materially breaches these Terms and is not remedied after notice. Project termination follows your written agreement.',
      'After access ends, we handle remaining data as described in the Privacy Policy and any data return or deletion terms we agreed.',
    ],
  },
  {
    id: 'changes',
    title: '12. Changes',
    paragraphs: [
      'We may update the site, Portal, and these Terms from time to time. Material changes will be indicated by the “Last updated” date and, where appropriate, notice by email or Portal. Continued use after changes take effect means you accept the updated Terms, except where a signed project agreement requires a different process.',
    ],
  },
  {
    id: 'law',
    title: '13. Governing law',
    paragraphs: [
      'Unless a signed commercial agreement says otherwise, these Terms and disputes relating to them or to the site/Portal are governed by the laws of Ghana, and the courts of Ghana have jurisdiction, without prejudice to mandatory rights under other applicable laws.',
    ],
  },
  {
    id: 'contact',
    title: '14. Contact',
    paragraphs: [
      `For questions about these Terms, contact ${LEGAL_CONTACT.orgName} (registered as ${LEGAL_CONTACT.registeredName} with Ghana ORC and DPC) at ${LEGAL_CONTACT.address}, email ${LEGAL_CONTACT.email}, or phone ${LEGAL_CONTACT.phone}.`,
    ],
  },
]
