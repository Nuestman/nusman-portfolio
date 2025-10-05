import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from './ui/card'
import { 
  Palette, 
  Code, 
  MessageCircle, 
  Figma, 
  Globe, 
  Image, 
  FileCode,
  Github,
  Database,
  Monitor,
  Zap,
  Layers,
  Smartphone,
  Search
} from 'lucide-react'

const Skills: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('design')

  const categories = [
    { id: 'design', label: 'iDesign', icon: Palette },
    { id: 'develop', label: 'iDevelop', icon: Code },
    { id: 'speak', label: 'iSpeak', icon: MessageCircle }
  ]

  const skills = {
    design: [
      { name: 'Figma', icon: Figma, color: 'text-gold-600' },
      { name: 'Webflow', icon: Globe, color: 'text-gold-600' },
      { name: 'Photoshop', icon: Image, color: 'text-gold-500' },
      { name: 'Adobe XD', icon: Layers, color: 'text-gold-600' },
      { name: 'Illustrator', icon: Palette, color: 'text-gold-600' }
    ],
    develop: [
      { name: 'VS Code', icon: Code, color: 'text-gold-600' },
      { name: 'GitHub', icon: Github, color: 'text-gold-800' },
      { name: 'Webflow', icon: Globe, color: 'text-gold-600' },
      { name: 'Cursor', icon: Code, color: 'text-gold-600' }
    ],
    speak: [
      { name: 'HTML', icon: FileCode, color: 'text-gold-600' },
      { name: 'CSS3', icon: FileCode, color: 'text-gold-600' },
      { name: 'Node.js', icon: Zap, color: 'text-gold-600' },
      { name: 'SQL', icon: Database, color: 'text-gold-500' }
    ]
  }

  return (
    <section id="skills" className="py-32 bg-gradient-to-br from-gray-50 to-gold-50">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-dark-950 font-heading">
            My Toolbox
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            I love to keep designs clean, simple and effective. I develop responsively and accessibly. 
            I love watching code come to life in the browser.
          </p>
        </motion.div>
        
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-white shadow-xl border-0">
            <CardContent className="p-8">
              {/* Skills Tab Navigation */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {categories.map((category) => {
                  const IconComponent = category.icon
                  return (
                    <motion.button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`px-6 py-3 rounded-md font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                        activeCategory === category.id 
                          ? 'bg-gold-500 text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IconComponent size={20} />
                      {category.label}
                    </motion.button>
                  )
                })}
              </div>
              
              {/* Skills Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                >
                  {skills[activeCategory as keyof typeof skills].map((skill, index) => {
                    const IconComponent = skill.icon
                    return (
                      <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors duration-300 group cursor-pointer"
                        whileHover={{ y: -5 }}
                      >
                        <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gold-50 transition-colors duration-300">
                          <IconComponent 
                            size={32} 
                            className={`${skill.color} group-hover:text-gold-500 transition-colors duration-300`}
                          />
                        </div>
                        <h4 className="font-bold text-sm text-gray-700 group-hover:text-gold-500 transition-colors duration-300">
                          {skill.name}
                        </h4>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

export default Skills
