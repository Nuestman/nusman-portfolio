import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { Card, CardContent } from './ui/card'

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "What services do you offer?",
      answer: "I specialize in web development, healthcare management systems (HMS), e-commerce solutions, POS systems, and inventory management. I work with modern technologies like React, Node.js, TypeScript, and various databases."
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
      answer: "Every project follows three steps: 1) Discover & Plan — we align on the goal, constraints, and a clear plan; 2) Build & Test — I develop, test, and share progress as we go; 3) Launch & Support — we ship it, I walk you through it, and I stay available. You are never left guessing."
    },
    {
      question: "Do you work with existing systems?",
      answer: "Absolutely! I can integrate with your existing systems, databases, and APIs. I'm experienced in working with legacy systems and can help modernize them while maintaining compatibility."
    },
    {
      question: "What technologies do you use?",
      answer: "I use modern, industry-standard technologies including React, TypeScript, Node.js, Python, various databases (MySQL, PostgreSQL, MongoDB), cloud platforms (Railway, Vercel), and development tools like Git, Docker, and CI/CD pipelines."
    },
    {
      question: "How do you ensure quality and security?",
      answer: "I follow best practices including code reviews, TypeScript and ESLint checks, unit tests, and regular updates. All code is version controlled and documented."
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
    <section className="relative py-20 bg-gray-50 overflow-hidden">
      <img
        src="/images/portraits/numan-caricature-faq.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-0 bottom-0 z-0 h-4/5 w-auto object-contain object-left-bottom"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-16 text-center">
          <motion.h2
            className="section-heading text-dark-950"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Frequently Asked Questions
          </motion.h2>
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
                <Card className="bg-white/80 backdrop-blur-sm border-transparent hover:border-gold-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/10">
                  <CardContent className="p-0">
                    <button
                      type="button"
                      onClick={() => toggleFAQ(index)}
                      aria-expanded={openIndex === index}
                      aria-controls={`faq-panel-${index}`}
                      id={`faq-button-${index}`}
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
                          <div id={`faq-panel-${index}`} role="region" aria-labelledby={`faq-button-${index}`} className="px-6 pb-6">
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
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/contact"
              className="inline-block bg-gradient-to-r from-gold-500 to-gold-600 text-white px-8 py-4 rounded-full font-bold text-lg font-heading hover:from-gold-600 hover:to-gold-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-gold-500/25"
            >
              Get In Touch
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default FAQ
