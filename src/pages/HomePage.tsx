import React from 'react'
import Hero from '../components/Hero'
import Skills from '../components/Skills'
import WhatICanDo from '../components/WhatICanDo'
import MyProcess from '../components/MyProcess'
import Testimonials from '../components/Testimonials'
import Collaborations from '../components/Collaborations'
import FAQ from '../components/FAQ'
import { usePageMeta } from '../hooks/usePageMeta'

const HomePage: React.FC = () => {
  usePageMeta({
    title: 'Numan Usman - Nurse & Web Developer | Portfolio',
    description: 'Numan Usman is a professional nurse and web developer based in Obuasi, Ghana. Specializing in responsive web design, healthcare technology, and freelance development services.',
    path: '/',
  })

  return (
    <>
      <Hero />
      <WhatICanDo />
      <Skills />
      <MyProcess />
      <Testimonials />
      <Collaborations />
      <FAQ />
    </>
  )
}

export default HomePage
