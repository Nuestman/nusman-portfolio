import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Testimonial = {
  quote: string
  author: string
  initials: string
  position: string
  companyLogo?: string
  companyName: string
}

const testimonials: Testimonial[] = [
  {
    quote: "Working with Numan has been an absolute pleasure and we'll definitely turn to his expertise for new projects.",
    author: 'Eric Boateng',
    initials: 'EB',
    position: 'Former Chairman - ENSOG',
    companyName: 'ENSOG',
  },
  {
    quote: "Numan is great. We worked together really well and we'll definitely contract his services in the future.",
    author: 'Kofi Yeboah Anning',
    initials: 'KY',
    position: 'Owner - My Joy Medical',
    companyName: 'My Joy Medical',
  },
]

const AUTO_PLAY_MS = 6000

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    if (isPaused) {
      return
    }

    const timer = window.setInterval(nextTestimonial, AUTO_PLAY_MS)
    return () => window.clearInterval(timer)
  }, [isPaused, currentIndex])

  return (
    <section
      className="py-20 bg-gray-50"
      aria-labelledby="testimonials-heading"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            id="testimonials-heading"
            className="section-heading text-dark-950"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Testimonials
          </motion.h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-center justify-center gap-8">
            <motion.button
              type="button"
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
              className="p-3 rounded-full bg-white hover:bg-gray-100 transition-colors duration-300 group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-6 h-6 text-dark-950 group-hover:text-gold-500 transition-colors" />
            </motion.button>

            <div className="flex-1 max-w-2xl" aria-live="off">
              <div className="grid">
                {testimonials.map((testimonial, index) => {
                  const isActive = index === currentIndex
                  return (
                    <motion.div
                      key={testimonial.author}
                      className="col-start-1 row-start-1"
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        x: isActive ? 0 : index < currentIndex ? -24 : 24,
                      }}
                      transition={{ duration: 0.45 }}
                      style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                      aria-hidden={!isActive}
                    >
                      <div className="h-full p-4 md:p-8 text-center">
                          <blockquote className="text-xl md:text-2xl text-dark-950 mb-8 leading-relaxed">
                            "{testimonial.quote}"
                          </blockquote>

                          <div className="flex items-center justify-center">
                            <div
                              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gold-500/20 bg-gold-500 text-white flex items-center justify-center text-lg md:text-xl font-bold font-heading"
                              aria-hidden="true"
                            >
                              {testimonial.initials}
                            </div>

                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-dark-950 flex items-center justify-center border-2 border-white -ml-5 md:-ml-6 overflow-hidden">
                              {testimonial.companyLogo ? (
                                <img
                                  src={testimonial.companyLogo}
                                  alt=""
                                  className="w-8 h-8 md:w-10 md:h-10 object-contain"
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-white px-1 text-center">
                                  {testimonial.companyName}
                                </span>
                              )}
                            </div>

                            <div className="text-left ml-3">
                              <h3 className="text-xl md:text-2xl font-bold text-dark-950 font-heading">
                                {testimonial.author}
                              </h3>
                              <p className="text-sm md:text-lg text-dark-950/70">
                                {testimonial.position}
                              </p>
                            </div>
                          </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <motion.button
              type="button"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
              className="p-3 rounded-full bg-white hover:bg-gray-100 transition-colors duration-300 group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-6 h-6 text-dark-950 group-hover:text-gold-500 transition-colors" />
            </motion.button>
          </div>

          <div className="flex justify-center gap-3 mt-8" role="tablist" aria-label="Testimonial slides">
            {testimonials.map((testimonial, index) => (
              <motion.button
                key={testimonial.author}
                type="button"
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Show testimonial from ${testimonial.author}`}
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
