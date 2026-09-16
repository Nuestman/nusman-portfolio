import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Phone, Mail, MapPin } from 'lucide-react'

const CONTACT_EMAIL = 'nuestman@icloud.com'

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
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Obuasi, Ghana',
  },
]

type FormStatus = 'idle' | 'success' | 'mailto' | 'error'

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<FormStatus>('idle')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus('idle')

    try {
      const formspreeId = import.meta.env.VITE_FORMSPREE_ID

      if (formspreeId) {
        const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          throw new Error('Failed to submit form')
        }

        setStatus('success')
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      } else {
        const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
          `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\n${formData.message}`,
        )}`
        window.location.href = mailto
        setStatus('mailto')
      }
    } catch (error) {
      console.error(error)
      setStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-20 pb-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="section-heading mb-6 text-dark-950">Get In Touch</h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Let&apos;s discuss your project and how I can help bring your ideas to life.
            Ready to kick something off?{' '}
            <Link to="/start" className="text-gold-600 font-semibold hover:underline">
              Start a project with me
            </Link>
            .
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[auto_minmax(0,1fr)] gap-4 lg:gap-4 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center lg:justify-start shrink-0"
          >
            <img
              src="/images/portraits/numan-caricature-contact.png"
              alt="Caricature of Numan Usman presenting the contact form"
              className="w-[26rem] sm:w-[30rem] md:w-[34rem] lg:w-[38rem] h-auto max-w-full object-contain"
            />
          </motion.div>

          <motion.div
            className="w-full max-w-2xl mx-auto lg:mx-0 space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="grid sm:grid-cols-3 gap-4">
              {contactLinks.map((item) => {
                const Icon = item.icon
                const content = (
                  <Card className="text-center h-full transition-shadow duration-300 hover:shadow-lg">
                    <CardContent className="p-5">
                      <Icon className="w-7 h-7 text-gold-500 mx-auto mb-2" aria-hidden="true" />
                      <h2 className="text-base font-bold text-dark-950 mb-1 font-heading">{item.label}</h2>
                      <p className="text-gray-600 text-sm break-words">{item.value}</p>
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
            </div>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6" noValidate={false}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-dark-950 mb-2">
                        Your Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        autoComplete="name"
                        className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors duration-200 placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium text-dark-950 mb-2">
                        Your Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        autoComplete="email"
                        className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors duration-200 placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="block text-sm font-medium text-dark-950 mb-2">
                        Phone Number
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        autoComplete="tel"
                        className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors duration-200 placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-subject" className="block text-sm font-medium text-dark-950 mb-2">
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors duration-200 placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-dark-950 mb-2">
                      Your Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      placeholder="Your Message Here"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors duration-200 placeholder:text-gray-500 resize-vertical"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 text-lg font-heading"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send Message'
                    )}
                  </Button>

                  <div aria-live="polite">
                    {status === 'success' && (
                      <p className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        <strong>Thank you!</strong> Your message has been sent. I'll get back to you as soon as possible.
                      </p>
                    )}
                    {status === 'mailto' && (
                      <p className="bg-amber-100 border border-amber-400 text-amber-800 px-4 py-3 rounded">
                        Your email app should open so you can send the message. If it does not, email me at {CONTACT_EMAIL}.
                      </p>
                    )}
                    {status === 'error' && (
                      <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        Something went wrong sending the form. Please try again or email {CONTACT_EMAIL}.
                      </p>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Contact
