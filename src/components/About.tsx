import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Card, CardContent } from './ui/card'

const About: React.FC = () => {
  const [activeTab, setActiveTab] = useState('history')

  const tabs = [
    { id: 'history', label: 'History', content: 'history' },
    { id: 'education', label: 'Education', content: 'education' },
    { id: 'experience', label: 'Experience', content: 'experience' }
  ]

  const tabContent = {
    history: (
      <p className="text-lg leading-relaxed">
        I've always loved playing around with PCs since I got introduced to it as a teenager in High School. 
        I've been fixing PC software issues since. I've been doing freelance computer software repairs over a decade now. 
        I started dabbling in web design and development about a few years ago and improving by the day.
      </p>
    ),
    education: (
      <p className="text-lg leading-relaxed">
        My journey in healthcare is built on a strong educational foundation, starting with a Diploma in Registered General Nursing 
        from the renowned Berekum Nursing & Midwifery Training College, followed by a BSc in Emergency Nursing from KNUST. 
        In addition to my formal nursing education, I'm a self-taught Web Developer. I've independently developed skills in IT, 
        particularly in web development, to bring digital solutions into healthcare environments.
      </p>
    ),
    experience: (
      <p className="text-lg leading-relaxed">
        As an experienced Emergency Nurse and Supervisor in the dynamic AGAHF Emergency Department, I'm dedicated to providing swift, 
        compassionate care during critical situations. My role involves managing first aid posts, 2IC assigning & supervising nursing duties, 
        conducting nursing research, coordinating training, and ensuring smooth operations to support both patients and healthcare staff.
      </p>
    )
  }

  return (
    <section id="about" className="py-32 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-dark-950 font-heading">
            Hi!
          </h2>
          <p className="text-lg md:text-xl max-w-4xl mx-auto leading-relaxed text-gray-700">
            I'm a <span className="text-gold-500 font-bold">Web Developer / Designer</span> based in 
            <span className="text-gold-500 font-bold"> Obuasi, Ghana</span>. I help businesses grow by crafting intuitive &amp; amazing web experiences. 
            I'm a professional nurse and a tech-enthusiast. I'm available for 
             <span className="text-gold-500 font-bold"> Freelance Work</span> so if you have a project in mind,  
            <Link to="/contact" className="text-gold-500 hover:text-gold-600 underline transition-colors duration-300">
              Let's discuss it.
            </Link>
          </p>
        </motion.div>
        
        {/* About Tabs */}
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-gold-500 to-gold-600 border-0 shadow-xl">
            <CardContent className="p-8 text-white">
              <h3 className="text-3xl font-bold text-center mb-8 text-white font-heading">
                Story Of My Life
              </h3>
              
              {/* Tab Navigation */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-full font-bold uppercase tracking-wider transition-all duration-300 ${
                      activeTab === tab.id 
                        ? 'bg-white text-gold-600 shadow-lg' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tab.label}
                  </motion.button>
                ))}
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
                    {tabContent[activeTab as keyof typeof tabContent]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

export default About
