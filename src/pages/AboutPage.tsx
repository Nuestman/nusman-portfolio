import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

const AboutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('history')

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-white via-gray-50 to-gold-50">
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-dark-950 font-heading">
            About Me
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Learn more about my journey as a nurse and web developer
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center p-8">
                <img 
                  src="/logos/nusman-logo-square.png" 
                  alt="Numan Usman" 
                  className="w-full h-full object-contain"
                />
              </div>
            </Card>
          </motion.div>

          {/* About Content */}
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
                  <h4 className="font-semibold text-dark-950">BSc Emergency Nursing</h4>
                  <p className="text-gray-600">KNUST</p>
                </div>
                <div className="border-l-4 border-gold-500 pl-4">
                  <h4 className="font-semibold text-dark-950">Diploma in Registered General Nursing</h4>
                  <p className="text-gray-600">Berekum Nursing & Midwifery Training College</p>
                </div>
                <div className="border-l-4 border-gold-500 pl-4">
                  <h4 className="font-semibold text-dark-950">Self-Taught Web Development</h4>
                  <p className="text-gray-600">Independent learning and practice</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Story of My Life Section */}
        <motion.div 
          className="mt-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Card className="bg-gradient-to-br from-gold-500 to-gold-600 border-0 shadow-xl">
            <CardContent className="p-8 text-white">
              <h3 className="text-3xl font-bold text-center mb-8 text-white font-heading">
                Story Of My Life
              </h3>
              
              {/* Tab Navigation */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <motion.button
                  onClick={() => setActiveTab('history')}
                 className={`px-6 py-3 rounded-full font-bold uppercase tracking-wider transition-all duration-300 font-heading ${
                   activeTab === 'history' 
                     ? 'bg-white text-gold-600 shadow-lg' 
                     : 'bg-white/20 text-white hover:bg-white/30'
                 }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  History
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab('education')}
                 className={`px-6 py-3 rounded-full font-bold uppercase tracking-wider transition-all duration-300 font-heading ${
                   activeTab === 'education' 
                     ? 'bg-white text-gold-600 shadow-lg' 
                     : 'bg-white/20 text-white hover:bg-white/30'
                 }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Education
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab('emnurse')}
                 className={`px-6 py-3 rounded-full font-bold uppercase tracking-wider transition-all duration-300 font-heading ${
                   activeTab === 'emnurse' 
                     ? 'bg-white text-gold-600 shadow-lg' 
                     : 'bg-white/20 text-white hover:bg-white/30'
                 }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  EMNurse
                </motion.button>
              </div>
              
              {/* Tab Content */}
              <div className="max-w-3xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    {activeTab === 'history' && (
                      <p className="text-lg leading-relaxed">
                        I've always loved playing around with PCs since I got introduced to it as a teenager in High School. 
                        I've been fixing PC software issues since. I've been doing freelance computer software repairs over a decade now. 
                        I started dabbling in web design and development about a few years ago and improving by the day.
                      </p>
                    )}
                    
                    {activeTab === 'education' && (
                      <p className="text-lg leading-relaxed">
                        My journey in healthcare is built on a strong educational foundation, starting with a Diploma in Registered General Nursing 
                        from the renowned Berekum Nursing & Midwifery Training College, followed by a BSc in Emergency Nursing from KNUST. 
                        In addition to my formal nursing education, I'm a self-taught Web Developer. I've independently developed skills in IT, 
                        particularly in web development, to bring digital solutions into healthcare environments. 
                        This unique blend of medical and technical expertise enables me to drive efficiency and innovation within emergency care settings.
                      </p>
                    )}
                    
                    {activeTab === 'emnurse' && (
                      <p className="text-lg leading-relaxed">
                        As an experienced Emergency Nurse and Supervisor in the dynamic AGAHF Emergency Department, I'm dedicated to providing swift, 
                        compassionate care during critical situations. My role involves managing first aid posts, 2IC assigning & supervising nursing duties, 
                        conducting nursing research, coordinating training, and ensuring smooth operations to support both patients and healthcare staff. 
                        With over a decade of experience, a focus on efficient emergency response and quality care, I aim to make a meaningful impact in every shift.
                      </p>
                    )}
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
