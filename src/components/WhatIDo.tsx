import React from 'react'
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

const WhatIDo: React.FC = () => {
  return (
    <section id="what-i-do" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <motion.h2
            className="section-heading mb-6 text-dark-950"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            What I Do
          </motion.h2>
          <motion.p
            className="mx-auto max-w-xl text-lg leading-relaxed text-dark-950/75 md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            I build practical systems and tools for people and organizations
            that help teams care, sell, serve, and stay organised.
          </motion.p>
        </div>

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
                className="rounded-tl-[1.75rem] rounded-tr-md rounded-bl-md rounded-br-[1.75rem] bg-white px-5 py-8 text-center border border-gray-200/80"
              >
                <Icon className="w-14 h-14 text-gold-500 mx-auto mb-4" aria-hidden="true" />
                <p className="text-dark-950 text-sm md:text-base leading-snug">{service.label}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WhatIDo
