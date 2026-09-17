import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/button'
import { storyTabs, type StoryTabId } from '../data/story'
import { usePageMeta } from '../hooks/usePageMeta'

const AboutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StoryTabId>('history')
  const activeStory = storyTabs.find((tab) => tab.id === activeTab) ?? storyTabs[0]
  const ActiveIcon = activeStory.icon
  const chapterIndex = storyTabs.findIndex((tab) => tab.id === activeStory.id)
  const chapterNumber = String(chapterIndex + 1).padStart(2, '0')
  const isDarkChapter = chapterIndex % 2 === 1

  usePageMeta({
    title: 'About Numan Usman | Health Informatician & Emergency Nurse',
    description:
      'Numan Usman is a health informatician, emergency nurse, and web developer based in Obuasi, Ghana — currently pursuing an MSc in Health Informatics at KNUST.',
    path: '/about',
  })

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-white via-gray-50 to-gold-50">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="section-heading mb-6 text-dark-950">About Me</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Health informatician, emergency nurse, and web developer — building safer care with people and systems
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="px-8">
              <Link to="/start">Start a project with me</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link to="/resume">View Resume</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto mb-16 flex max-w-xs justify-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <img
            src="/images/portraits/numan-caricature.png"
            alt="Caricature portrait of Numan Usman"
            className="w-full h-auto object-contain"
          />
        </motion.div>

        <motion.section
          className="mt-8 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          aria-labelledby="my-story-heading"
        >
          <div className="text-center mb-12">
            <h2 id="my-story-heading" className="section-heading text-dark-950 mb-4">
              My Story
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Four chapters from tinkering with PCs to emergency care, informatics, and building for people
            </p>
          </div>

          <div
            className="flex flex-wrap justify-center gap-x-2 gap-y-2 mb-10 border-b border-gray-200"
            role="tablist"
            aria-label="My story chapters"
          >
            {storyTabs.map((tab, index) => {
              const isActive = activeTab === tab.id
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`story-tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`story-panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-3 font-heading text-sm md:text-base font-bold tracking-wide transition-colors duration-300 flex items-center gap-2 ${
                    isActive ? 'text-gold-600' : 'text-gray-500 hover:text-dark-950'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-xs font-medium text-gray-400 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {tab.label}
                  {isActive && (
                    <motion.span
                      layoutId="story-tab-underline"
                      className="absolute inset-x-2 -bottom-px h-0.5 bg-gold-500"
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStory.id}
              id={`story-panel-${activeStory.id}`}
              role="tabpanel"
              aria-labelledby={`story-tab-${activeStory.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className={`rounded-3xl p-5 md:p-8 ${isDarkChapter ? 'bg-dark-950' : 'bg-gray-100'}`}
            >
              <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-center">
                <div className="md:col-span-1">
                  <img
                    src={activeStory.image}
                    alt={activeStory.imageAlt}
                    className="w-full h-auto max-h-[22rem] md:max-h-none object-cover object-center rounded-2xl"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                        isDarkChapter ? 'bg-gold-500/15' : 'bg-dark-950'
                      }`}
                    >
                      <ActiveIcon className="h-6 w-6 text-gold-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium uppercase tracking-[0.2em] ${
                          isDarkChapter ? 'text-gold-400/80' : 'text-gold-600'
                        }`}
                      >
                        Chapter {chapterNumber}
                      </p>
                      <h3
                        className={`font-heading text-2xl md:text-3xl font-bold ${
                          isDarkChapter ? 'text-white' : 'text-dark-950'
                        }`}
                      >
                        {activeStory.label}
                      </h3>
                    </div>
                  </div>
                  <p
                    className={`text-base md:text-lg leading-relaxed ${
                      isDarkChapter ? 'text-white/85' : 'text-gray-700'
                    }`}
                  >
                    {activeStory.body}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.section>
      </div>
    </div>
  )
}

export default AboutPage
