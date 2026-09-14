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
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden hero-pattern pt-20 pb-16">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto grid max-w-6xl md:grid-cols-[auto_minmax(0,1fr)] gap-0 items-center justify-items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-2 md:order-1 flex justify-center w-[18rem] sm:w-[22rem] md:w-[24rem] lg:w-[28rem] shrink-0 overflow-visible"
          >
            <img
              src="/images/portraits/numan-caricature-hero-wave.png"
              alt="Caricature of Numan Usman waving"
              className="w-[26rem] sm:w-[30rem] md:w-[34rem] lg:w-[38rem] max-w-none h-auto object-contain"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="order-1 md:order-2 w-full max-w-2xl text-center md:text-left md:-ml-6 lg:-ml-10"
          >
            <motion.h1
              className="section-heading mb-4 md:mb-6 text-dark-950"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Hi! I'm{' '}
              <span className="gradient-text">Numan.</span>
            </motion.h1>

            <motion.div
              className="text-2xl sm:text-3xl md:text-4xl font-medium mb-4 md:mb-6 text-dark-950 font-heading"
              initial={{ opacity: 0, y: 30 }}
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
              className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 leading-relaxed text-gray-700 max-w-xl mx-auto md:mx-0"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Based in{' '}
              <span className="text-gold-500 font-semibold">Obuasi, Ghana</span>, I turn
              emergency-care experience and health informatics into digital systems and tools
              that help hospitals and businesses work faster and safer.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start items-center"
              initial={{ opacity: 0, y: 24 }}
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:block"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-8 h-8 text-gold-500" />
      </motion.div>
    </section>
  )
}

export default Hero
