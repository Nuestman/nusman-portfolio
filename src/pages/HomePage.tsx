import React from 'react'
import Hero from '../components/Hero'
import Skills from '../components/Skills'
import WhatICanDo from '../components/WhatICanDo'
import MyProcess from '../components/MyProcess'
import Testimonials from '../components/Testimonials'
import Collaborations from '../components/Collaborations'
import FAQ from '../components/FAQ'
import Contact from '../components/Contact'

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <WhatICanDo />
      <Skills />
      <MyProcess />
      <Testimonials />
      <Collaborations />
      <FAQ />
      <Contact />
    </>
  )
}

export default HomePage
