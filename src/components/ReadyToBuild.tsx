import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const ReadyToBuild: React.FC = () => {
  return (
    <section className="bg-dark-950 py-20" aria-labelledby="ready-to-build-heading">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2
            id="ready-to-build-heading"
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 font-heading text-white"
          >
            Ready to Bring Your Ideas to Life?
          </h2>
          <p className="text-lg mb-8 text-white/80 max-w-2xl mx-auto">
            Let's discuss your project and create a solution that exceeds your expectations.
            I'm here to help you succeed.
          </p>
          <Link
            to="/start"
            className="inline-block bg-gold-500 text-white px-8 py-4 rounded-full font-bold text-lg font-heading hover:bg-gold-600 transition-colors duration-300"
          >
            Start a project with me
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default ReadyToBuild
