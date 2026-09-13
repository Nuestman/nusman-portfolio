import React from 'react'
import { motion } from 'framer-motion'
import Contact from '../components/Contact'
import { Card, CardContent } from '../components/ui/card'
import { Phone, Mail, MapPin } from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'

const contactLinks = [
  {
    icon: Phone,
    label: 'Phone',
    value: '+233 206 484 034',
    href: 'tel:+233206484034',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'nuestman@icloud.com',
    href: 'mailto:nuestman@icloud.com',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Obuasi, Ghana',
  },
]

const ContactPage: React.FC = () => {
  usePageMeta({
    title: 'Contact Numan Usman',
    description: 'Get in touch with Numan Usman for freelance web development and healthcare technology projects.',
    path: '/contact',
  })

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-dark-950 font-heading">
              Get In Touch
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Let's discuss your project and how I can help bring your ideas to life
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-5 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {contactLinks.map((item) => {
              const Icon = item.icon
              const content = (
                <Card className="text-center h-full transition-shadow duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <Icon className="w-8 h-8 text-gold-500 mx-auto mb-3" aria-hidden="true" />
                    <h2 className="text-lg font-bold text-dark-950 mb-1 font-heading">{item.label}</h2>
                    <p className="text-gray-600 text-sm">{item.value}</p>
                  </CardContent>
                </Card>
              )

              if (!item.href) {
                return <div key={item.label}>{content}</div>
              }

              return (
                <a key={item.label} href={item.href} className="block">
                  {content}
                </a>
              )
            })}
          </motion.div>
        </div>
      </section>

      <Contact />
    </div>
  )
}

export default ContactPage
