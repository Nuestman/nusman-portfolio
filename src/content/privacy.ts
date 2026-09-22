/**
 * Privacy policy for nusman.dev / Nuestman practice.
 * Adapted from MineAid HMS legal content (same controller entity).
 */

const PHONE_E164 = '233206484034'
const WHATSAPP_PREFILL =
  'Hello, I have a privacy enquiry about nusman.dev / Portal.'

export const LEGAL_CONTACT = {
  orgName: 'NUsman Tech Solutions',
  /** Registered with Ghana ORC and DPC under this name */
  registeredName: 'Nuestman Links Enterprise',
  practiceName: 'Numan Usman',
  siteName: 'nusman.dev',
  address: 'AN758, Ivory Street, MVSS 27, Moinsi Valley Estate',
  email: 'nuestman@icloud.com',
  phone: '+233 20 648 4034',
  phoneE164: PHONE_E164,
  whatsappUrl: `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(WHATSAPP_PREFILL)}`,
} as const

export const PRIVACY_LAST_UPDATED = 'September 2026'

export type LegalSection = {
  id: string
  title: string
  paragraphs: string[]
}

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'controller',
    title: '1. Data controller and contact',
    paragraphs: [
      'Data controller: NUsman Tech Solutions (trading as the Numan Usman / nusman.dev practice). We are registered with the Office of the Registrar of Companies (ORC), Ghana, as Nuestman Links Enterprise, and the same entity is registered with the Data Protection Commission (DPC) for data protection compliance.',
      `Address: ${LEGAL_CONTACT.address}. For privacy requests, complaints, or questions (including data subject rights and Data Protection Commission matters), please use the contact details on this page.`,
      "Under Ghana's Data Protection Act, 2012 (Act 843), we are registered with the Data Protection Commission and ensure that our processing of personal data complies with the Act.",
    ],
  },
  {
    id: 'scope',
    title: '2. What this policy covers',
    paragraphs: [
      'This policy covers personal data processed through the public website (nusman.dev), the Start a project and Contact flows, email and related communications, and the client Portal (portal.nusman.dev) when you are invited to use it.',
      'The operator Desk (desk.nusman.dev) is a private workbench used to deliver projects. Data you share with us for a project may be stored there so we can manage the engagement. Desk is not a public product you sign up for.',
      'If a separate written agreement (for example a proposal, statement of work, or data processing terms) says otherwise for a specific project, that agreement controls for that engagement.',
    ],
  },
  {
    id: 'data-we-collect',
    title: '3. Personal data we collect and why',
    paragraphs: [
      'Contact and enquiry data: name, email, phone, organisation, and the messages or project brief you send (including Start a project answers such as problem, what you want built, timeline, and budget). Legal basis (GDPR where it applies): contract and/or legitimate interest. Under Ghana Act 843, processing follows the data protection principles.',
      'Client Portal data: when Portal access is enabled for you, we process account identifiers (name, email), project updates, messages, schedule responses, and related files you or we share in the Portal. Legal basis: contract and legitimate interest in delivering the project.',
      'Technical and usage data: logs, IP address, device/browser data, and similar information needed for security, availability, and abuse prevention. Legal basis: legitimate interest. We do not sell your personal data.',
      'Project delivery data: material you provide so we can design, build, or support a system (which may include operational or health-related information if your project requires it). We process that only as needed for the engagement and under any written terms we agree.',
    ],
  },
  {
    id: 'how-we-use',
    title: '4. How we use personal data',
    paragraphs: [
      'We use the data to respond to enquiries; evaluate and deliver projects; operate and secure the website, Portal, and Desk; send service messages (for example email confirmation, receipts, Portal magic links, and project updates); comply with law; and improve how we work, in line with applicable law.',
    ],
  },
  {
    id: 'legal-basis',
    title: '5. Legal basis for processing (GDPR)',
    paragraphs: [
      'Where GDPR applies: Contract (delivering services you request); Legal obligation; Legitimate interest (security, support, improving the practice); Consent (where we rely on it, you may withdraw it at any time).',
    ],
  },
  {
    id: 'retention',
    title: '6. Data retention',
    paragraphs: [
      'We retain personal data only as long as needed for the purposes in this policy. Enquiry and lead data: for the sales/enquiry cycle and a reasonable period afterwards. Project and Portal records: for the life of the engagement and a reasonable archive period (or longer if law or a written agreement requires). Logs and security data: as needed for security and compliance. We then delete or anonymise data except where we must keep it for legal reasons.',
    ],
  },
  {
    id: 'rights',
    title: '7. Your rights',
    paragraphs: [
      'GDPR (EEA/UK): You may have rights of access, rectification, erasure, restriction, portability, and objection; you may withdraw consent and lodge a complaint with a supervisory authority.',
      "Ghana's Data Protection Act 843: Data subjects have rights including access, correction, and deletion in accordance with the Act. We will respond in line with the Act and the Data Protection Commission's guidelines.",
      'To exercise these rights, contact us using the details in section 1.',
    ],
  },
  {
    id: 'security',
    title: '8. Security and confidentiality',
    paragraphs: [
      'We implement technical and organisational measures appropriate to the risk, including access control, encryption in transit (TLS) where the Service is served over HTTPS, and careful handling of client and Portal credentials. Measures are aligned with GDPR Article 32 where it applies and Ghana Act 843.',
    ],
  },
  {
    id: 'breaches',
    title: '9. Data breaches',
    paragraphs: [
      'Where a breach is likely to result in a risk to rights and freedoms, we will notify the relevant authority and affected people as required by applicable law (including Ghana Act 843 reporting to the Data Protection Commission where required, and GDPR supervisory authority notice where it applies).',
    ],
  },
  {
    id: 'transfers',
    title: '10. International transfers',
    paragraphs: [
      'Personal data may be processed or stored in countries outside your country of residence (for example hosting or email providers). Where we transfer data from the EEA or UK, we use appropriate safeguards where required (for example standard contractual clauses). Where we transfer data from Ghana, we comply with cross-border requirements under Act 843. More detail is available on request.',
    ],
  },
  {
    id: 'dpo-ghana',
    title: '11. Data protection oversight (Ghana Act 843)',
    paragraphs: [
      'In line with Ghana Act 843, we maintain internal oversight for data protection compliance. For enquiries about Act 843 compliance or to exercise rights under the Act, contact us at the details in section 1.',
    ],
  },
  {
    id: 'changes',
    title: '12. Changes to this policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. The current version will be posted on nusman.dev with a “Last updated” date. Material changes may also be communicated by email or through the Portal when relevant. Please review this policy periodically.',
    ],
  },
  {
    id: 'contact',
    title: '13. Contact',
    paragraphs: [
      `NUsman Tech Solutions, ${LEGAL_CONTACT.address}. For privacy, data subject rights, or Data Protection Commission–related enquiries, use the contact details on this page or email ${LEGAL_CONTACT.email}.`,
    ],
  },
]
