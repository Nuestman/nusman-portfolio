import React from 'react'
import { motion } from 'framer-motion'
import { Code, Palette, Wrench } from 'lucide-react'

const toolboxGroups = [
  {
    id: 'development',
    title: 'Development',
    icon: Code,
    tools: ['React', 'TypeScript', 'Node.js', 'Express', 'Vite', 'Next.js'],
  },
  {
    id: 'design',
    title: 'Design',
    icon: Palette,
    tools: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator'],
  },
  {
    id: 'tools',
    title: 'Tools & More',
    icon: Wrench,
    tools: ['Git', 'Render', 'Railway', 'PostgreSQL', 'Vercel'],
  },
] as const

const iconStyles = [
  { wrap: 'bg-dark-950', icon: 'text-gold-400' },
  { wrap: 'bg-gray-400', icon: 'text-white' },
  { wrap: 'bg-gray-200', icon: 'text-dark-950' },
] as const

const Skills: React.FC = () => {
  return (
    <section id="skills" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="section-heading mb-6 text-dark-950">What I Work With</h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
            Technologies I use to design, build, and ship websites and web apps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10 lg:gap-12 max-w-6xl mx-auto">
          {toolboxGroups.map((group, groupIndex) => {
            const Icon = group.icon
            const style = iconStyles[groupIndex % iconStyles.length]
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: groupIndex * 0.1 }}
                className="text-center"
              >
                <div className={`w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center ${style.wrap}`}>
                  <Icon className={`w-7 h-7 ${style.icon}`} aria-hidden="true" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-5 text-dark-950 font-heading">
                  {group.title}
                </h3>
                <ul className="flex flex-wrap justify-center gap-2">
                  {group.tools.map((tool) => (
                    <li
                      key={tool}
                      className="px-3.5 py-1.5 text-sm font-medium rounded-md border border-gold-200 bg-white text-dark-950"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Skills
