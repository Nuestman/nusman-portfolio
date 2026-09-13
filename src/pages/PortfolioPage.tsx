import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code, Palette, Globe } from 'lucide-react'
import { Button } from '../components/ui/button'
import { usePageMeta } from '../hooks/usePageMeta'

const PortfolioPage: React.FC = () => {
  usePageMeta({
    title: 'Portfolio | Numan Usman',
    description: 'Selected work and the technologies Numan Usman uses for web development and design.',
    path: '/portfolio',
  })

  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 bg-gradient-to-br from-gold-500 to-gold-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white font-heading">
              Portfolio
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Case studies are being prepared. In the meantime, this site itself is the live example
              of my current React, TypeScript, and Tailwind work.
            </p>
            <Button asChild className="bg-white text-gold-600 hover:bg-gray-100">
              <Link to="/contact">Discuss a project</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-dark-950 font-heading">
              Technologies I Work With
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tools I use to design, build, and ship websites and web apps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-dark-950 font-heading">Development</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {['React', 'TypeScript', 'Node.js', 'Express', 'Vite', 'Next.js'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-dark-950 font-heading">Design</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {['Figma', 'Adobe XD', 'Photoshop', 'Illustrator'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-dark-950 font-heading">Tools & More</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {['Git', 'Render', 'AWS', 'PostgreSQL', 'Vercel'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PortfolioPage
