import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Github, Linkedin, Instagram, Facebook, Twitter } from 'lucide-react'

const Footer: React.FC = () => {
  const socialLinks = [
    { name: 'GitHub', icon: Github, url: '#', color: 'hover:text-gray-800' },
    { name: 'LinkedIn', icon: Linkedin, url: '#', color: 'hover:text-blue-600' },
    { name: 'Instagram', icon: Instagram, url: '#', color: 'hover:text-pink-600' },
    { name: 'Facebook', icon: Facebook, url: '#', color: 'hover:text-blue-500' },
    { name: 'Twitter', icon: Twitter, url: '#', color: 'hover:text-blue-400' }
  ]

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-950 text-white py-12">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="w-24 h-24 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center p-2 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src="/logos/nusman-logo-square.png" 
              alt="Numan's Logo" 
              className="w-full h-full object-contain"
            />
          </motion.div>
        </motion.div>
        
        <motion.nav 
          className="flex justify-center space-x-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Link 
            to="/about"
            className="text-white/80 hover:text-gold-400 transition-colors duration-300 font-medium font-heading"
          >
            About Me
          </Link>
          <Link 
            to="/"
            className="text-white/80 hover:text-gold-400 transition-colors duration-300 font-medium font-heading"
          >
            Skills
          </Link>
          <Link 
            to="/contact"
            className="text-white/80 hover:text-gold-400 transition-colors duration-300 font-medium font-heading"
          >
            Contact
          </Link>
        </motion.nav>
        
        <div className="border-t border-white/20 pt-8">
          <motion.div 
            className="flex justify-center space-x-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {socialLinks.map((link, index) => {
              const IconComponent = link.icon
              return (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-white/60 ${link.color} transition-colors duration-300`}
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                >
                  <IconComponent size={24} />
                </motion.a>
              )
            })}
          </motion.div>
          
          <motion.div 
            className="text-center text-white/60"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="mb-2">
              Website designed and developed by{' '}
              <span className="text-gold-400 hover:text-gold-300 transition-colors duration-300 cursor-pointer">
                Numan Usman
              </span>
            </p>
            <p>&copy; {currentYear} All rights reserved.</p>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
