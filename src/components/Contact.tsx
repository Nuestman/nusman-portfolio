import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Phone, Mail, MessageCircle } from 'lucide-react'

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSuccess(true)
    setFormData({ name: '', email: '', subject: '', message: '' })

    // Hide success message after 5 seconds
    setTimeout(() => setIsSuccess(false), 5000)
  }

  return (
    <section id="contact" className="py-32 bg-gradient-to-br from-gold-500 to-gold-600">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white font-heading">
            I'd love to hear from you
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Still have unanswered questions? Hit me up. Let's build something great together.
          </p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="glass-effect border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-dark-950 flex items-center gap-2 font-heading">
                  <MessageCircle className="text-gold-500" />
                  Contact Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors duration-200 placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors duration-200 placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      name="subject"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors duration-200 placeholder:text-gray-500"
                    />
                  </div>
                  
                  <div>
                    <textarea
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
                  
                  {/* Success Message */}
                  {isSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
                    >
                      <strong>Thank you!</strong> Your message has been sent successfully. I'll get back to you as soon as possible.
                    </motion.div>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Contact Info */}
          <motion.div 
            className="text-white"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="space-y-8">
              <div>
                <h4 className="text-2xl font-bold mb-4">Let's Connect</h4>
                <p className="text-lg leading-relaxed opacity-90">
                  I like to get stuff done and I'm currently <span className="text-white font-bold">available</span> for freelance work, so let's talk.
                </p>
              </div>
              
              <div className="space-y-4">
                <motion.a 
                  href="https://wa.me/+233206484034" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-lg hover:text-white/80 transition-colors duration-300"
                  whileHover={{ x: 5 }}
                >
                  <Phone className="w-6 h-6" />
                  <span>+233 206 484 034</span>
                </motion.a>
                
                <motion.a 
                  href="mailto:nuestman@icloud.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-lg hover:text-white/80 transition-colors duration-300"
                  whileHover={{ x: 5 }}
                >
                  <Mail className="w-6 h-6" />
                  <span>nuestman@icloud.com</span>
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Contact
