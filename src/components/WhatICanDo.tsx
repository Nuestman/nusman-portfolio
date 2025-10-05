import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Globe, ShoppingCart, Database, Smartphone, Monitor, Code } from 'lucide-react'

const WhatICanDo: React.FC = () => {
  const services = [
    {
      icon: Globe,
      title: 'Web Applications & Websites',
      description: 'Modern, responsive web applications and websites built with cutting-edge technologies. From simple landing pages to complex SaaS platforms, I deliver solutions that are fast, secure, and user-friendly.',
      features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Mobile-First']
    },
    {
      icon: Database,
      title: 'Hospital Management Systems (HMS)',
      description: 'Complete healthcare management solutions including patient records, appointment scheduling, billing, inventory management, and reporting. HIPAA-compliant and designed for healthcare professionals.',
      features: ['Patient Management', 'Appointment Scheduling', 'Billing & Insurance', 'Medical Records']
    },
    {
      icon: ShoppingCart,
      title: 'E-Commerce & POS Systems',
      description: 'Full-featured e-commerce platforms and Point of Sale systems with inventory management, payment processing, order tracking, and comprehensive analytics to grow your business.',
      features: ['Payment Integration', 'Inventory Tracking', 'Order Management', 'Analytics Dashboard']
    },
    {
      icon: Monitor,
      title: 'Business Dashboards',
      description: 'Custom business intelligence dashboards that transform your data into actionable insights. Real-time analytics, reporting tools, and KPI tracking to make informed business decisions.',
      features: ['Real-time Analytics', 'Custom Reports', 'KPI Tracking', 'Data Visualization']
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Solutions',
      description: 'Progressive Web Apps (PWAs) and mobile-optimized solutions that work seamlessly across all devices. Offline functionality, push notifications, and native app-like experiences.',
      features: ['Progressive Web Apps', 'Offline Functionality', 'Push Notifications', 'Cross-Platform']
    },
    {
      icon: Code,
      title: 'Custom Development',
      description: 'Tailored software solutions built specifically for your business needs. From automation scripts to enterprise applications, I create custom tools that streamline your operations.',
      features: ['Automation Scripts', 'API Development', 'System Integration', 'Custom Workflows']
    }
  ]

  return (
    <section id="what-i-can-do" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-dark-950 font-heading">
            What I Can Do
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From simple websites to complex enterprise solutions, I deliver comprehensive digital solutions that drive your business forward.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 group border-0 shadow-lg">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-200 transition-colors duration-300">
                      <IconComponent className="w-8 h-8 text-gold-600" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-dark-950 font-heading">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <div className="w-2 h-2 bg-gold-500 rounded-full mr-3"></div>
                          <span className="text-sm text-gray-600 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 font-heading">
              Ready to Bring Your Ideas to Life?
            </h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Let's discuss your project and create a solution that exceeds your expectations. 
              I'm here to help you succeed.
            </p>
            <motion.a
              href="/contact"
              className="inline-block bg-white text-gold-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300 font-heading"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Let's Talk About Your Project
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default WhatICanDo
