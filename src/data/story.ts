export type StoryTabId = 'history' | 'education' | 'experience' | 'emnurse'

export type StoryTab = {
  id: StoryTabId
  label: string
  image: string
  imageAlt: string
  body: string
}

export const storyTabs: StoryTab[] = [
  {
    id: 'history',
    label: 'History',
    image: '/images/story/story-history.jpg',
    imageAlt: 'Numan working on a computer',
    body: "I've always loved playing around with PCs since I got introduced to it as a teenager in High School. I've been fixing PC software issues since. I've been doing freelance computer software repairs over a decade now. I started dabbling in web design and development about a few years ago and improving by the day.",
  },
  {
    id: 'education',
    label: 'Education',
    image: '/images/story/story-education.jpg',
    imageAlt: 'Graduation and nursing education',
    body: "My journey in healthcare is built on a strong educational foundation, starting with a Diploma in Registered General Nursing from the renowned Berekum Nursing & Midwifery Training College, followed by a BSc in Emergency Nursing from KNUST. In addition to my formal nursing education, I'm a self-taught Web Developer. I've independently developed skills in IT, particularly in web development, to bring digital solutions into healthcare environments. This unique blend of medical and technical expertise enables me to drive efficiency and innovation within emergency care settings.",
  },
  {
    id: 'experience',
    label: 'Experience',
    image: '/images/story/story-experience.jpg',
    imageAlt: 'Clinical and professional experience',
    body: "As an experienced Emergency Nurse and Supervisor in the dynamic AGAHF Emergency Department, I'm dedicated to providing swift, compassionate care during critical situations. My role involves managing first aid posts, 2IC assigning & supervising nursing duties, conducting nursing research, coordinating training, and ensuring smooth operations to support both patients and healthcare staff.",
  },
  {
    id: 'emnurse',
    label: 'EMNurse',
    image: '/images/story/story-emnurse.jpg',
    imageAlt: 'Emergency nursing work',
    body: 'With over a decade of experience and a focus on efficient emergency response and quality care, I aim to make a meaningful impact in every shift. I bring that same urgency and attention to detail to the websites and tools I build for clinics, teams, and small businesses.',
  },
]
