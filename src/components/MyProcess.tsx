import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MessageCircle,
  Clock,
  CheckCircle,
  Users,
  RefreshCw,
  Rocket,
  CalendarCheck,
  ArrowRightCircle,
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
    title: 'Discover & Plan',
    description: 'Align on the goal, constraints, and a clear plan.',
  },
  {
    title: 'Build & Test',
    description: 'Develop, test, and share progress as we go.',
  },
  {
    title: 'Launch & Support',
    description: 'Ship it, walk you through it, and stay available.',
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
            className="section-heading text-center text-white mb-16"
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

      <section id="how-i-work" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-[1.35fr_0.65fr] gap-6 md:gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center md:text-left"
              >
                <h2 className="section-heading text-dark-950 mb-6">
                  How I Work
                </h2>
                <p className="text-lg md:text-xl text-dark-950/75 leading-relaxed max-w-xl md:max-w-none mx-auto md:mx-0">
                  Every project follows a simple path: discover what matters,
                  build with clear checkpoints, then launch with support so you
                  are never left guessing.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex justify-center items-center"
              >
                <img
                  src="/images/portraits/numan-caricature-how-i-work.png"
                  alt="Caricature of Numan Usman working on a laptop"
                  className="w-80 sm:w-96 md:w-[28rem] lg:w-[30rem] h-auto"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative flex justify-center py-10 md:py-12"
            >
              <div
                className="absolute left-[10%] right-[10%] md:left-[14%] md:right-[14%] top-0 bottom-0 rounded-3xl bg-gray-200"
                aria-hidden="true"
              />

              <ol className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row items-stretch md:items-center justify-center gap-4 md:gap-3 px-0">
                {processSteps.map((step, index) => (
                  <React.Fragment key={step.title}>
                    <li className="flex-1 min-w-0">
                      <div className="rounded-2xl bg-dark-950 px-5 py-6 md:px-6 md:py-7 text-center shadow-lg">
                        <h3 className="font-heading text-2xl md:text-3xl font-bold bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm md:text-base text-white/75 leading-snug">
                          {step.description}
                        </p>
                      </div>
                    </li>
                    {index < processSteps.length - 1 && (
                      <li className="hidden md:flex items-center justify-center shrink-0" aria-hidden="true">
                        <ArrowRightCircle className="w-8 h-8 md:w-10 md:h-10 text-dark-950/45" />
                      </li>
                    )}
                  </React.Fragment>
                ))}
              </ol>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}

export default MyProcess
