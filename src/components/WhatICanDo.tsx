import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Globe, ShoppingCart, Database, Smartphone, Monitor, Code } from 'lucide-react'

const services = [
  { icon: Globe, label: 'Websites & apps' },
  { icon: Database, label: 'Hospital systems' },
  { icon: ShoppingCart, label: 'E-commerce & POS' },
  { icon: Monitor, label: 'Business dashboards' },
  { icon: Smartphone, label: 'Mobile-first apps' },
  { icon: Code, label: 'Custom development' },
]

const WhatICanDo: React.FC = () => {
  return (
    <section id="what-i-can-do" className="py-24 bg-dark-950">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-center text-white font-heading mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          What I Can Do
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-2xl bg-white/[0.06] px-5 py-8 text-center"
              >
                <Icon className="w-14 h-14 text-gold-400 mx-auto mb-4" aria-hidden="true" />
                <p className="text-white text-sm md:text-base leading-snug">{service.label}</p>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Link
            to="/contact"
            className="inline-flex items-center rounded-full bg-gold-500 px-8 py-3 text-sm font-bold text-dark-950 hover:bg-gold-400 transition-colors duration-300"
          >
            Let's talk
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default WhatICanDo
