import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from './ui/card'
import {
  MessageCircle,
  Clock,
  CheckCircle,
  Users,
  RefreshCw,
  Rocket,
  CalendarCheck,
} from 'lucide-react'

const perks = [
  { icon: MessageCircle, label: 'Clear communication' },
  { icon: Clock, label: 'On-time delivery' },
  { icon: CheckCircle, label: 'Quality assurance' },
  { icon: CalendarCheck, label: 'Honest timelines' },
  { icon: Users, label: 'Team collaboration' },
  { icon: RefreshCw, label: 'Regular updates' },
  { icon: Rocket, label: 'Launch support' },
]

const processSteps = [
  {
    step: '01',
    title: 'Discovery & Planning',
    description: 'We start by understanding your vision, goals, and requirements. I analyze your needs and create a detailed project plan with clear milestones.',
  },
  {
    step: '02',
    title: 'Design & Prototyping',
    description: 'I create wireframes and prototypes to visualize your project. This ensures we\'re aligned before development begins, saving time and resources.',
  },
  {
    step: '03',
    title: 'Development & Testing',
    description: 'Using best practices and modern technologies, I build your solution with regular updates and testing to ensure quality at every step.',
  },
  {
    step: '04',
    title: 'Launch & Support',
    description: 'I handle deployment and provide ongoing support. You\'ll receive training and documentation to help you make the most of your new solution.',
  },
]

const MyProcess: React.FC = () => {
  const firstRow = perks.slice(0, 4)
  const secondRow = perks.slice(4)

  return (
    <>
      <section id="what-you-get" className="py-24 bg-dark-950">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-center text-white font-heading mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            What You Get
          </motion.h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {firstRow.map((perk, index) => {
              const Icon = perk.icon
              return (
                <motion.div
                  key={perk.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="rounded-2xl bg-white/[0.06] px-5 py-8 text-center"
                >
                  <Icon className="w-14 h-14 text-gold-400 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-white text-sm md:text-base leading-snug">{perk.label}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-4">
            {secondRow.map((perk, index) => {
              const Icon = perk.icon
              return (
                <motion.div
                  key={perk.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                  className="rounded-2xl bg-white/[0.06] px-5 py-8 text-center"
                >
                  <Icon className="w-14 h-14 text-gold-400 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-white text-sm md:text-base leading-snug">{perk.label}</p>
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

      <section id="my-process" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-16 text-center text-dark-950 font-heading"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            My Process
          </motion.h2>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gold-200 z-0"></div>

              <div className="grid md:grid-cols-2 gap-8 relative z-10">
                {processSteps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`flex ${index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}
                  >
                    <Card className="w-full max-w-sm hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gold-500 text-white rounded-full flex items-center justify-center mr-4 font-bold text-lg">
                            {step.step}
                          </div>
                          <h3 className="text-3xl font-bold text-dark-950 font-heading">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}

export default MyProcess
