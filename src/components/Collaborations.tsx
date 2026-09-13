import React from 'react'
import { motion } from 'framer-motion'

const collaborations = [
  {
    name: 'AngloGold Ashanti Ghana',
    logo: '/logos/collaborations/aga-logo-white.png',
  },
  {
    name: 'AGA Health Foundation',
    logo: '/logos/collaborations/agahf-logo.png',
  },
  {
    name: 'EM Nurses Society of Ghana',
    logo: '/logos/collaborations/ensog-logo-green.png',
  },
]

const Collaborations: React.FC = () => {
  return (
    <section className="py-20 bg-dark-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            I've Collaborated With...
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {collaborations.map((collab, index) => (
            <motion.div
              key={collab.name}
              className="group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 text-center hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-gold-500/30 group-hover:shadow-xl group-hover:shadow-gold-500/10">
                <motion.div
                  className={`${collab.logo.includes('aga-logo-white') ? 'bg-dark-950' : 'bg-white'} w-36 h-20 mx-auto mb-4 rounded-xl flex items-center justify-center p-2 shadow-lg ring-1 ring-black/5 group-hover:shadow-gold-500/20 transition-all duration-300`}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={collab.logo}
                    alt={`${collab.name} Logo`}
                    className="w-[85%] h-[85%] object-contain"
                  />
                </motion.div>

                <h3 className="text-base md:text-lg font-bold text-white font-heading group-hover:text-gold-400 transition-colors">
                  {collab.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Collaborations
