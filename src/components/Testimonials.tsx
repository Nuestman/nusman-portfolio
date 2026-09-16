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
    quote: "Working with Usman has been an absolute pleasure and we'll definitely turn to his expertise for new projects.",
    author: 'Eric Boateng',
    initials: 'EB',
    position: 'Former Chairman - ENSOG',
    companyName: 'ENSOG',
  },
  {
    quote: "Usman is great. We worked together really well and we'll definitely contract his services in the future.",
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
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false)
        }
      }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
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

        <div className="mx-auto max-w-3xl">
          <div className="grid" aria-live="off">
            {testimonials.map((testimonial, index) => {
              const isActive = index === currentIndex
              return (
                <motion.div
                  key={testimonial.author}
                  className="col-start-1 row-start-1"
                  initial={false}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    y: isActive ? 0 : 12,
                  }}
                  transition={{ duration: 0.4 }}
                  style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                  aria-hidden={!isActive}
                >
                  <figure className="px-1 text-center sm:px-4">
                    <blockquote className="mb-8 text-lg leading-relaxed text-dark-950 sm:text-xl md:text-2xl">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>

                    <figcaption className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-0">
                      <div className="flex items-center justify-center">
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-gold-500/20 bg-gold-500 font-heading text-lg font-bold text-white sm:h-16 sm:w-16 md:h-20 md:w-20 md:text-xl"
                          aria-hidden="true"
                        >
                          {testimonial.initials}
                        </div>

                        <div className="relative -ml-4 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-dark-950 sm:-ml-5 sm:h-12 sm:w-12 md:-ml-6 md:h-16 md:w-16">
                          {testimonial.companyLogo ? (
                            <img
                              src={testimonial.companyLogo}
                              alt=""
                              className="h-7 w-7 object-contain sm:h-8 sm:w-8 md:h-10 md:w-10"
                            />
                          ) : (
                            <span className="px-1 text-center text-[9px] font-bold leading-tight text-white sm:text-[10px]">
                              {testimonial.companyName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-center sm:ml-3 sm:text-left">
                        <cite className="not-italic">
                          <span className="block font-heading text-lg font-bold text-dark-950 sm:text-xl md:text-2xl">
                            {testimonial.author}
                          </span>
                          <span className="mt-0.5 block text-sm text-dark-950/70 md:text-lg">
                            {testimonial.position}
                          </span>
                        </cite>
                      </div>
                    </figcaption>
                  </figure>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            <motion.button
              type="button"
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
              className="rounded-full bg-white p-2.5 transition-colors duration-300 hover:bg-gray-100 group sm:p-3"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="h-5 w-5 text-dark-950 transition-colors group-hover:text-gold-500 sm:h-6 sm:w-6" />
            </motion.button>

            <div className="flex gap-2.5" role="tablist" aria-label="Testimonial slides">
              {testimonials.map((testimonial, index) => (
                <motion.button
                  key={testimonial.author}
                  type="button"
                  role="tab"
                  aria-selected={index === currentIndex}
                  aria-label={`Show testimonial from ${testimonial.author}`}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 sm:h-3 sm:w-3 ${
                    index === currentIndex
                      ? 'scale-125 bg-gold-500'
                      : 'bg-dark-950/30 hover:bg-dark-950/50'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            <motion.button
              type="button"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
              className="rounded-full bg-white p-2.5 transition-colors duration-300 hover:bg-gray-100 group sm:p-3"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="h-5 w-5 text-dark-950 transition-colors group-hover:text-gold-500 sm:h-6 sm:w-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
