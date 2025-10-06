import React from 'react'
import { motion } from 'framer-motion'

const Collaborations: React.FC = () => {
  const collaborations = [
    {
      name: "AngloGold Ashanti Ghana",
      logo: "/logos/collaborations/aga-logo-white.png",
      description: "Leading gold mining company"
    },
    {
      name: "AGA Health Foundation",
      logo: "/logos/collaborations/agahf-logo.png",
      description: "Healthcare and community development"
    },
    {
      name: "EM Nurses Society of Ghana",
      logo: "/logos/collaborations/ensog-logo-green.png",
      description: "Professional body for emergency nurses in Ghana"
    }
  ]

  return (
    <section className="py-20 bg-dark-950">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white font-heading"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            I've Collaborated With...
          </motion.h2>
          {/* <motion.p 
            className="text-xl md:text-2xl text-white/80 font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Trusted by leading organizations
          </motion.p> */}
        </div>

        {/* Collaboration Logos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {collaborations.map((collab, index) => (
            <motion.div
              key={collab.name}
              className="group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-10 text-center hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-gold-500/30 group-hover:shadow-2xl group-hover:shadow-gold-500/10">
                {/* Logo Container */}
                <motion.div 
                  className={`${collab.logo.includes('aga-logo-white') ? 'bg-dark-950' : 'bg-white'} w-56 h-28 md:h-32 mx-auto mb-8 rounded-xl flex items-center justify-center p-3 shadow-lg ring-1 ring-black/5 group-hover:shadow-gold-500/20 transition-all duration-300`}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ duration: 0.3 }}
                >
                  <img 
                    src={collab.logo} 
                    alt={`${collab.name} Logo`}
                    className="w-[85%] h-[85%] object-contain"
                  />
                </motion.div>

                {/* Company Info */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white font-heading mb-2 group-hover:text-gold-400 transition-colors">
                    {collab.name}
                  </h3>
                  {/* <p className="text-white/70 text-lg">
                    {collab.description}
                  </p> */}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gold-500 rounded-full"></div>
              <span className="text-lg">Trusted Partnership</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gold-500 rounded-full"></div>
              <span className="text-lg">Quality Deliverables</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gold-500 rounded-full"></div>
              <span className="text-lg">Long-term Relationships</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Collaborations
