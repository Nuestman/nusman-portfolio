import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { Card, CardContent } from './ui/card'

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "What services do you offer?",
      answer: "I specialize in web development, mobile applications, healthcare management systems (HMS), e-commerce solutions, POS systems, and inventory management. I work with modern technologies like React, Node.js, TypeScript, and various databases."
    },
    {
      question: "How long does a typical project take?",
      answer: "Project timelines vary based on complexity. Simple websites take 2-4 weeks, while complex applications can take 2-6 months. I provide detailed timelines during our initial consultation and keep you updated throughout the development process."
    },
    {
      question: "Do you provide ongoing support and maintenance?",
      answer: "Yes! I offer comprehensive support packages including bug fixes, updates, security patches, and feature enhancements. We can discuss a maintenance plan that fits your needs and budget."
    },
    {
      question: "What is your development process?",
      answer: "My process includes: 1) Discovery & Planning, 2) Design & Prototyping, 3) Development & Testing, 4) Deployment, and 5) Support & Maintenance. I keep you involved at every step with regular updates and demos."
    },
    {
      question: "Do you work with existing systems?",
      answer: "Absolutely! I can integrate with your existing systems, databases, and APIs. I'm experienced in working with legacy systems and can help modernize them while maintaining compatibility."
    },
    {
      question: "What technologies do you use?",
      answer: "I use modern, industry-standard technologies including React, TypeScript, Node.js, Python, various databases (MySQL, PostgreSQL, MongoDB), cloud platforms (AWS, Vercel), and development tools like Git, Docker, and CI/CD pipelines."
    },
    {
      question: "How do you ensure quality and security?",
      answer: "I follow best practices including code reviews, automated testing, security audits, and regular updates. All code is version controlled, documented, and follows industry security standards."
    },
    {
      question: "Can you help with digital transformation?",
      answer: "Yes! I help businesses modernize their processes through custom software solutions, API development, system integrations, and workflow automation. I can assess your current setup and recommend the best path forward."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gold-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-dark-950 font-heading"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p 
            className="text-xl md:text-2xl text-dark-950/80 font-medium max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We curated responses to some of the most frequent queries here for you; have a look at them.
          </motion.p>
        </div>

        {/* FAQ Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border border-dark-950/10 hover:border-gold-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/10">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full p-6 text-left flex items-center justify-between group hover:bg-gold-50/50 transition-colors duration-300"
                    >
                      <h3 className="text-xl md:text-2xl font-bold text-dark-950 font-heading group-hover:text-gold-600 transition-colors pr-4">
                        {faq.question}
                      </h3>
                      <motion.div
                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        {openIndex === index ? (
                          <Minus className="w-6 h-6 text-gold-500" />
                        ) : (
                          <Plus className="w-6 h-6 text-dark-950/60 group-hover:text-gold-500 transition-colors" />
                        )}
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {openIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6">
                            <p className="text-lg text-dark-950/80 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-xl text-dark-950/80 mb-6">
            Still have questions? I'd love to hear from you!
          </p>
          <motion.a
            href="/contact"
            className="inline-block bg-gradient-to-r from-gold-500 to-gold-600 text-white px-8 py-4 rounded-full font-bold text-lg font-heading hover:from-gold-600 hover:to-gold-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-gold-500/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get In Touch
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default FAQ
