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
          className="section-heading text-center text-white mb-16"
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
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl p-8 text-white max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 font-heading">
              Ready to Bring Your Ideas to Life?
            </h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Let's discuss your project and create a solution that exceeds your expectations.
              I'm here to help you succeed.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-white text-gold-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300 font-heading"
            >
              Let's Talk About Your Project
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default WhatICanDo
