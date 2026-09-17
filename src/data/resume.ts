export const RESUME_PDF_HREF = '/docs/Numan-Usman-Resume-June-2026.pdf'

export const resumeMeta = {
  name: 'Numan Usman',
  titles: [
    'Certified Emergency Nurse',
    'Mining Emergency Responder',
    'Health Informatician',
  ],
  location: 'Obuasi, Ashanti, Ghana',
  phones: ['0206484034', '0546979534'],
  email: 'nusman@agahealthfoundation.org',
  profile:
    'Registered General Nurse specializing in Emergency Nursing with over a decade of frontline trauma and emergency care, including dedicated service at the AngloGold Ashanti Obuasi Mine emergency response. Combines hands-on mining emergency response, mass casualty and disaster management, and medical evacuation with emergency moulage simulations and drills expertise. A calm, physically active team player who performs reliably under strenuous conditions and is committed to safe, prompt responses. Speaks English, Twi, Hausa, and Dagbani.',
}

export const resumeSkills = [
  'Mining Emergency Response',
  'Mass Casualty Incident (MCI) and Disaster Management',
  'Basic & Advanced Life Support (BLS / ACLS) and Advanced Trauma Life Support (ATLS)',
  'Medical Moulage for realistic drills and simulations',
  'Cyanide & Heavy Metals Exposure Response',
  'Medical Evacuation (Helicopter/Air & Ground)',
  'Minor & Major Suturing; POP Application; Burns & Acute/ICU Care',
  'Emergency Operations Plan (EOP) Development',
  'Staff Training & BLS / First Aid / CPR Instruction; community BLS/CPR engagement',
  'Road Traffic, Safety and Accident Prevention Advocacy',
]

export type ResumeRole = {
  title: string
  org: string
  dates: string
  summary?: string
  bullets: string[]
}

export const resumeExperience: ResumeRole[] = [
  {
    title: 'Senior Nursing Officer — Supervisor, Emergency Response Unit',
    org: 'AngloGold Ashanti Health Foundation (AGAHF), Obuasi',
    dates: 'Apr 2023 – Present',
    summary:
      'Provide and supervise emergency care across AGAG first aid posts (FAPs); manage human and material resources, medication and consumable inventory, patient data, analytics, and incident reporting, plus illicit drug and alcohol testing and reporting.',
    bullets: [
      'Completed 6-month underground familiarization at AGA Obuasi Mine (November – April 2026).',
      'Modernized and digitized emergency response operations and instituted prompt incident response and reporting at the FAPs with Mineaid HMS (awaiting official approval/adoption).',
      'Facilitated AGA-organized Basic Life Support training for health workers (Aug 2025).',
      'Named 2025 GRNMA District Best Nurse for Obuasi.',
      'Founded the Usmaniyya Foundation for Basic Emergency Care and bystander CPR training.',
    ],
  },
  {
    title: 'Nursing Officer — Emergency Nurse',
    org: 'AngloGold Ashanti Health Foundation (AGAHF), Obuasi',
    dates: 'Aug 2019 – Apr 2023',
    summary:
      'Provided prompt, safe emergency and trauma care to AGA Obuasi Mine workers and the community at the EMS First Aid Posts and the Emergency; served as clinical coordinator, inventory manager, and ward statistician for the Emergency Department.',
    bullets: [
      'Delivered Basic Life Support and Advanced Trauma Life Support in the ED and underground/mine settings.',
      'Managed road traffic accident cases, major and minor suturing, POP application, and 9-lead EKG/cardiac monitoring.',
      'Triaged patients using the South African Triage Scale; conducted alcohol and illicit drug testing.',
      'Reduced medication wastage through improved stock management and documentation.',
      'Provided monthly and quarterly statistical data that helped reduce ED mortality.',
    ],
  },
  {
    title: 'Ward Manager (Nurse-In-Charge) — Accident & Emergency Unit',
    org: 'GHS / Government Hospital, Sampa – Bono Region',
    dates: 'Sep 2017 – Oct 2019',
    summary:
      'Managed the A&E unit with limited human and material resources; prepared rosters, supervised staff, and developed daily operational protocols.',
    bullets: [
      'Established a triage system using the South African Triage Scale.',
      'Trained over 60% of clinical staff on Mass Casualty Incident management and assigned response roles.',
      'Created emergency care protocols and proposed an emergency operations plan for the hospital.',
      'Conducted workshops on BLS, triage, and oxygen therapy, reducing medical oxygen wastage.',
    ],
  },
  {
    title: 'Charge Nurse — Casualty Unit',
    org: 'GHS / Government Hospital, Sampa',
    dates: 'Feb 2012 – Aug 2015',
    bullets: [
      'Spearheaded the creation of the Casualty Unit, providing prompt emergency care to accident and trauma victims.',
      'Educated hospital staff on health and safety through workshops and advocacy.',
    ],
  },
]

export const resumeAdditionalExperience = [
  'Emergency Operations Planning (EOP): helped develop EOPs for 7 selected hospitals in Greater Kumasi.',
  'MCI Moulage Simulation: KATH A & E and TTH A & E.',
]

export type ResumeCredential = {
  title: string
  detail: string
}

export const resumeCertifications: ResumeCredential[] = [
  { title: 'AGA – Cyanide Drills & Evacuation Management', detail: 'Obuasi, Jul 2024' },
  { title: 'AGA – Heavy Metals Management', detail: 'Obuasi, Jul 2024' },
  { title: 'BLS Provider & Ambulance Training', detail: 'EMS, AGAG Obuasi Mine, May 2024' },
  { title: 'St. John First Aid at Work', detail: 'St John Ambulance, Kumasi, Jun 2026' },
  { title: 'AHA Certified BLS Provider', detail: 'American Heart Association, 2021–2023' },
  { title: 'Medical Evacuation – Survival Flight', detail: '37 Military Camp, Accra, Oct 2023' },
  { title: 'Plastics & Burns Nursing Care', detail: 'KATH Burns ICU, Nov 2023' },
  {
    title: 'Certificate in Occupational Health & Safety Management',
    detail: 'GIMPA, Accra, Aug 2020',
  },
  {
    title: 'Certificate in Leadership and Management in Health',
    detail: 'University of Washington, E-Learning, July 2019',
  },
  { title: 'Emergency Medicine Bootcamp & Ultrasound Training', detail: 'KATH, Kumasi, Apr 2019' },
  {
    title: 'Disaster Medicine and MCI Management',
    detail: 'KNUST / Tamale Teaching Hospital, Oct 2018',
  },
]

export const resumeEducation: ResumeCredential[] = [
  { title: 'MSc Health Informatics', detail: 'KNUST, Kumasi — 2026 (in progress)' },
  { title: 'BSc Emergency Nursing', detail: 'KNUST, Kumasi — 2015–2017' },
  {
    title: 'Diploma in Registered General Nursing',
    detail: 'Holy Family NMTC, Berekum — 2007–2010',
  },
]

export const resumeAffiliations = [
  'Member: Emergency Nurses Society of Ghana (ENSOG), Emergency Medicine Society of Ghana (EMSOG), Ghana Registered Nurses & Midwives Association (GRNMA), Islamic Medical Association, Ghana (IMAGH).',
  'Founder, Usmaniyya Foundation for Basic Emergency Care — multiple BLS and First Aid sessions.',
  'Advocate for road safety and accident prevention.',
  'First aider at 6th March parades, Presby Church and community events; community health screenings.',
]

export type ResumeReference = {
  name: string
  title: string
  phone: string
  email: string
}

export const resumeReferences: ResumeReference[] = [
  {
    name: 'Mrs. Sirina Mohammed',
    title: 'DDNS – AGAHF, Obuasi',
    phone: '+233244588091',
    email: 'smohammed@agahealthfoundation.org',
  },
  {
    name: 'Mr. Eric Boateng',
    title: 'Senior Nursing Officer (ED/CDU/ERT/ICU Block-In-Charge AGAHF)',
    phone: '+233549663356',
    email: 'erboatrn@gmail.com',
  },
  {
    name: 'Dr. John G. G. Banin, MD',
    title: 'Emergency Physician Specialist (HOD – AGAHF Emergency Department)',
    phone: '+233206818588',
    email: 'jbanin@agahealthfoundation.org',
  },
]
