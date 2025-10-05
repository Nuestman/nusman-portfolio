import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from './ui/card'

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      quote: "Working with Numan has been an absolute pleasure and we'll definitely turn to his expertise for new projects.",
      author: "James Wittings",
      position: "IT Director at AngloGold",
      avatar: "/images/about-imgs/testi-giver.png",
      company: "/images/about-imgs/lion.png"
    },
    {
      quote: "Numan is great. We worked together really well and we'll definitely contract his services in the future.",
      author: "Dora Carter",
      position: "Usability Specialist at UVTI",
      avatar: "/images/about-imgs/testi-giver2.png",
      company: "/images/about-imgs/akar-icons_github-fill.png"
    }
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-20 bg-gradient-to-br from-gold-50 to-gold-100">
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
            Testimonials
          </motion.h2>
          <motion.p 
            className="text-xl md:text-2xl text-dark-950/80 font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            People I've worked with had some nice words..
          </motion.p>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-center justify-center gap-8">
            {/* Previous Button */}
            <motion.button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300 group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-6 h-6 text-dark-950 group-hover:text-gold-500 transition-colors" />
            </motion.button>

            {/* Testimonial Card */}
            <div className="flex-1 max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                    <CardContent className="p-8 text-center">
                      {/* Quote */}
                      <blockquote className="text-xl md:text-2xl text-dark-950 mb-8 leading-relaxed">
                        "{currentTestimonial.quote}"
                      </blockquote>

                      {/* Author Info */}
                      <div className="flex items-center justify-center">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gold-500/20">
                          <img 
                            src={currentTestimonial.avatar} 
                            alt={currentTestimonial.author}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Company Logo with negative margin to overlap */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-50 to-gold-100 flex items-center justify-center shadow-lg border-2 border-white -ml-6">
                          <img 
                            src={currentTestimonial.company} 
                            alt="Company Logo"
                            className="w-10 h-10 object-contain"
                          />
                        </div>

                        {/* Author Details */}
                        <div className="text-left">
                          <h4 className="text-2xl font-bold text-dark-950 font-heading">
                            {currentTestimonial.author}
                          </h4>
                          <p className="text-lg text-dark-950/70">
                            {currentTestimonial.position}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next Button */}
            <motion.button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300 group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-6 h-6 text-dark-950 group-hover:text-gold-500 transition-colors" />
            </motion.button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-gold-500 scale-125' 
                    : 'bg-dark-950/30 hover:bg-dark-950/50'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
