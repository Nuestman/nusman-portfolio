import React from 'react'
import { motion } from 'framer-motion'
import Contact from '../components/Contact'
import { Card, CardContent } from '../components/ui/card'
import { Phone, Mail, MapPin } from 'lucide-react'

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gold-500 to-gold-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white font-heading">
              Get In Touch
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Let's discuss your project and how I can help bring your ideas to life
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center p-6">
                <CardContent className="pt-6">
                  <Phone className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-dark-950 mb-2 font-heading">Phone</h3>
                  <p className="text-gray-600">+233 206 484 034</p>
                </CardContent>
              </Card>

              <Card className="text-center p-6">
                <CardContent className="pt-6">
                  <Mail className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-dark-950 mb-2 font-heading">Email</h3>
                  <p className="text-gray-600">nuestman@icloud.com</p>
                </CardContent>
              </Card>

              <Card className="text-center p-6">
                <CardContent className="pt-6">
                  <MapPin className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-dark-950 mb-2 font-heading">Location</h3>
                  <p className="text-gray-600">Obuasi, Ghana</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <Contact />
    </div>
  )
}

export default ContactPage
