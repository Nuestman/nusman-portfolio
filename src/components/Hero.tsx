import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'

const Hero: React.FC = () => {
  const [currentText, setCurrentText] = useState(0)

  const texts = [
    'Health Informatician',
    'Emergency Nurse & Web Developer',
    'Healthcare Technology Expert',
    'Freelancer',
    'Award-winning Emergency Nurse',
    'Road Safety & Accident Prevention Advocate',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % texts.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [texts.length])

  return (
    <section className="min-h-screen flex flex-col md:block relative overflow-hidden hero-pattern">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-transparent"></div>

      <div className="relative z-10 shrink-0 pt-24 pb-2 md:absolute md:inset-0 md:flex md:items-center md:justify-center md:pt-0 md:pb-0">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 md:mb-6 font-heading"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Hi! I'm{' '}
              <span className="gradient-text">Numan.</span>
            </motion.h1>

            <motion.div
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium mb-4 md:mb-8 text-dark-950 font-heading"
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
                aria-live="polite"
              >
                {texts[currentText]}
              </motion.span>
            </motion.div>

            <motion.p
              className="text-base sm:text-lg md:text-xl mb-6 md:mb-12 max-w-2xl mx-auto leading-relaxed text-gray-700"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              I care for people and build systems. Based in{' '}
              <span className="text-gold-500 font-semibold">Obuasi, Ghana</span>,
              I help businesses grow by crafting intuitive &amp; amazing web experiences.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Button size="lg" asChild className="px-8 py-4 text-lg">
                <Link to="/contact">Get In Touch</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="px-8 py-4 text-lg">
                <Link to="/about">Learn More</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-[5] flex-1 min-h-0 flex items-end justify-center pointer-events-none md:absolute md:inset-y-0 md:right-0 md:left-auto md:w-auto md:block md:flex-none"
      >
        <img
          src="/images/portraits/numan-caricature-hero-wave.png"
          alt="Caricature of Numan Usman waving"
          className="h-full w-auto max-w-[90vw] object-contain object-bottom md:h-full md:max-w-none md:absolute md:right-0 md:bottom-0"
        />
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden md:block"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-8 h-8 text-gold-500" />
      </motion.div>
    </section>
  )
}

export default Hero
