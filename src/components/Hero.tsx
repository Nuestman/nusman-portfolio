import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'

const Hero: React.FC = () => {
  const [currentText, setCurrentText] = useState(0)
  
  const texts = [
    'Emergency Nurse & Web Developer',
    'Healthcare Technology Expert',
    'Freelancer',
    'Award-winning EMNurse',
    'Road Safety & Accident Prevention Advocate'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % texts.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [texts.length])

  // No need for scroll functions since we're using React Router now

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden hero-pattern">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-transparent"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Hero Title */}
          <motion.h1 
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 font-heading"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Hi! I'm{' '}
            <span className="gradient-text">Numan.</span>
          </motion.h1>
          
          {/* Dynamic Subtitle */}
          <motion.div 
            className="text-2xl md:text-3xl lg:text-4xl font-medium mb-8 text-dark-950 font-heading"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span
              key={currentText}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="inline-block"
            >
              {texts[currentText]}
            </motion.span>
          </motion.div>
          
          {/* Hero Description */}
          <motion.p 
            className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-gray-700"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            I care for people and build websites. Based in{' '}
            <span className="text-gold-500 font-semibold">Obuasi, Ghana</span>, 
            I help businesses grow by crafting intuitive &amp; amazing web experiences.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button 
              size="lg" 
              asChild
              className="px-8 py-4 text-lg"
            >
              <Link to="/contact">Get In Touch</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              asChild
              className="px-8 py-4 text-lg"
            >
              <Link to="/about">Learn More</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Floating Elements */}
      <motion.div 
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="w-8 h-8 text-gold-500" />
      </motion.div>
    </section>
  )
}

export default Hero
