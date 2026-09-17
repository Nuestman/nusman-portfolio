import { Monitor, GraduationCap, Briefcase, HeartPulse, type LucideIcon } from 'lucide-react'

export type StoryTabId = 'history' | 'education' | 'experience' | 'emnurse'

export type StoryTab = {
  id: StoryTabId
  label: string
  icon: LucideIcon
  image: string
  imageAlt: string
  body: string
}

export const storyTabs: StoryTab[] = [
  {
    id: 'history',
    label: 'History',
    icon: Monitor,
    image: '/images/story/story-history.png',
    imageAlt: 'Caricature of Usman tinkering with a computer',
    body: "Computers caught my attention early as a teenager in high school, and I was already opening machines, fixing software problems, and helping anyone who asked. That curiosity turned into over a decade of freelance PC and software repair. When I began building websites and web apps, i felt the same instinct to diagnose a broken system could improve how clinics and emergency teams share information. That thread — from tinkering to tools that serve care — is what pulled me into health informatics.",
  },
  {
    id: 'education',
    label: 'Education',
    icon: GraduationCap,
    image: '/images/story/story-education.png',
    imageAlt: 'Caricature of Usman reading books',
    body: "I trained first as a nurse: a Diploma in Registered General Nursing at Holy Family NMTC, Berekum, then a BSc in Emergency Nursing at KNUST — grounding me in trauma care, triage, and calm decision-making when minutes matter. Today I'm deepening that path with an MSc in Health Informatics at KNUST (in progress, 2026), learning how to design and strengthen the information systems behind safer care. In parallel I've taught myself modern web development, so classroom theory and real products stay connected.",
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: Briefcase,
    image: '/images/story/story-experience.png',
    imageAlt: 'Caricature of Usman in safety helmet and reflective emergency gear with radio and first aid kit',
    body: "My career grew from the casualty floor upward. At Sampa Government Hospital I helped establish the Casualty Unit and run emergency services with limited resources — establishing triage, training staff for mass-casualty roles, and shaping day-to-day protocols. At AGAHF in Obuasi I am currently the Supervisor of the Emergency Response Unit where I've modernized response workflows with digital tools, facilitated BLS training, under mine rescue training, and was named the 2025 GRNMA District Best Nurse for Obuasi East District. Through the Usmaniyya Foundation I also take bystander CPR and basic emergency care into the community.",
  },
  {
    id: 'emnurse',
    label: 'Purpose',
    icon: HeartPulse,
    image: '/images/story/story-purpose.png',
    imageAlt: 'Caricature of Usman demonstrating CPR on a training manikin',
    body: "Emergency nursing taught me to stay steady when everything is urgent. Health informatics and web development let me scale that care beyond a single shift — clearer reporting, better workflows, and tools people can actually use. Whether I'm responding underground, teaching CPR, advocating for road safety, or shipping a website for a clinic or small business, the goal is the same: prompt, reliable help when it counts.",
  },
]
