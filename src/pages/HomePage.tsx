import React from 'react'
import Hero from '../components/Hero'
import Skills from '../components/Skills'
import WhatICanDo from '../components/WhatICanDo'
import MyProcess from '../components/MyProcess'
import Contact from '../components/Contact'

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <WhatICanDo />
      <Skills />
      <MyProcess />
      <Contact />
    </>
  )
}

export default HomePage
