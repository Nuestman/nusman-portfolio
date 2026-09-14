import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { storyTabs, type StoryTabId } from '../data/story'
import { usePageMeta } from '../hooks/usePageMeta'

const AboutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StoryTabId>('history')
  const activeStory = storyTabs.find((tab) => tab.id === activeTab) ?? storyTabs[0]

  usePageMeta({
    title: 'About Numan Usman | Nurse & Web Developer',
    description: 'Learn about Numan Usman — emergency nurse, supervisor, and web developer based in Obuasi, Ghana.',
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
          <h1 className="section-heading mb-6 text-dark-950">
            About Me
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Learn more about my journey as a nurse and web developer
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <div className="aspect-square flex items-center justify-center p-8">
              {/* <div className="aspect-square bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center p-8"> */}
                <img
                  src="/logos/nusman-logo-square.png"
                  alt="Numan Usman logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gold-600 font-heading">
                  Professional Background
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  I'm a dedicated Emergency Nurse and Supervisor with extensive experience in healthcare,
                  combined with a passion for web development and technology.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Based in Obuasi, Ghana, I bring a unique perspective to web development,
                  combining my healthcare expertise with modern technology solutions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gold-600 font-heading">
                  Education & Training
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-l-4 border-gold-500 pl-4">
                  <h2 className="font-semibold text-dark-950">BSc Emergency Nursing</h2>
                  <p className="text-gray-600">KNUST</p>
                </div>
                <div className="border-l-4 border-gold-500 pl-4">
                  <h2 className="font-semibold text-dark-950">Diploma in Registered General Nursing</h2>
                  <p className="text-gray-600">Berekum Nursing & Midwifery Training College</p>
                </div>
                <div className="border-l-4 border-gold-500 pl-4">
                  <h2 className="font-semibold text-dark-950">Self-Taught Web Development</h2>
                  <p className="text-gray-600">Independent learning and practice</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Card className="bg-gradient-to-br from-gold-500 to-gold-600 border-0 shadow-xl">
            <CardContent className="p-8 text-white">
              <h2 className="text-3xl font-bold text-center mb-8 text-white font-heading">
                Story Of My Life
              </h2>

              <div className="flex flex-wrap justify-center gap-2 mb-8" role="tablist" aria-label="Life story">
                {storyTabs.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                    <motion.button
                      key={tab.id}
                      type="button"
                      role="tab"
                      id={`story-tab-${tab.id}`}
                      aria-selected={isActive}
                      aria-controls={`story-panel-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 rounded-full font-bold uppercase tracking-wider transition-all duration-300 font-heading ${
                        isActive
                          ? 'bg-white text-gold-600 shadow-lg'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {tab.label}
                    </motion.button>
                  )
                })}
              </div>

              <div className="max-w-3xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStory.id}
                    id={`story-panel-${activeStory.id}`}
                    role="tabpanel"
                    aria-labelledby={`story-tab-${activeStory.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-6"
                  >
                    <img
                      src={activeStory.image}
                      alt={activeStory.imageAlt}
                      className="hidden w-full max-h-80 object-cover rounded-xl"
                    />
                    <p className="text-lg leading-relaxed">{activeStory.body}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default AboutPage
