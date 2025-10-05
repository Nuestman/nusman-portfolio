import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { MessageCircle, Clock, CheckCircle, Users, ArrowRight } from 'lucide-react'

const MyProcess: React.FC = () => {
  const promises = [
    {
      icon: MessageCircle,
      title: 'Clear Communication',
      description: 'I maintain transparent, responsive communication throughout the entire project. All technical concepts are explained in simple terms, and you\'ll always know exactly what\'s happening and when.',
      features: ['Daily Updates', 'Technical Explanations', 'Quick Response Time', 'Project Transparency']
    },
    {
      icon: Clock,
      title: 'On-Time Delivery',
      description: 'Time is money, and I respect yours. I provide realistic timelines and stick to them. You\'ll receive exactly what you pay for, when promised, without any last-minute surprises.',
      features: ['Realistic Timelines', 'Milestone Tracking', 'No Hidden Delays', 'Deadline Commitment']
    },
    {
      icon: CheckCircle,
      title: 'Quality Assurance',
      description: 'My reputation depends on the quality of my work. I don\'t compromise on standards. Every project undergoes rigorous testing and review to ensure you receive a solution you\'ll love.',
      features: ['Code Quality', 'Performance Testing', 'Cross-Browser Testing', 'User Experience Review']
    },
    {
      icon: Users,
      title: 'Collaborative Partnership',
      description: 'This is your project, and your input is invaluable. I work collaboratively with you and your team, bringing all stakeholders on board from day one to ensure the final product exceeds expectations.',
      features: ['Stakeholder Involvement', 'Team Collaboration', 'Feedback Integration', 'Partnership Approach']
    }
  ]

  const processSteps = [
    {
      step: '01',
      title: 'Discovery & Planning',
      description: 'We start by understanding your vision, goals, and requirements. I analyze your needs and create a detailed project plan with clear milestones.'
    },
    {
      step: '02',
      title: 'Design & Prototyping',
      description: 'I create wireframes and prototypes to visualize your project. This ensures we\'re aligned before development begins, saving time and resources.'
    },
    {
      step: '03',
      title: 'Development & Testing',
      description: 'Using best practices and modern technologies, I build your solution with regular updates and testing to ensure quality at every step.'
    },
    {
      step: '04',
      title: 'Launch & Support',
      description: 'I handle deployment and provide ongoing support. You\'ll receive training and documentation to help you make the most of your new solution.'
    }
  ]

  return (
    <section id="my-process" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* What You Get Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-dark-950 font-heading">
            What You Get
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            My commitment to excellence ensures you receive not just a solution, but a partnership that drives your success.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
          {promises.map((promise, index) => {
            const IconComponent = promise.icon
            return (
              <motion.div
                key={promise.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mr-4">
                        <IconComponent className="w-6 h-6 text-gold-600" />
                      </div>
                      <CardTitle className="text-3xl font-bold text-dark-950 font-heading">
                        {promise.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {promise.description}
                    </p>
                    <div className="space-y-2">
                      {promise.features.map((feature, featureIndex) => (
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

        {/* My Process Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-dark-950 font-heading">
            My Process
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A proven methodology that ensures successful project delivery from concept to completion.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gold-200 z-0"></div>
            
            <div className="grid md:grid-cols-2 gap-8 relative z-10">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex ${index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}
                >
                  <Card className={`w-full max-w-sm hover:shadow-xl transition-all duration-300 border-0 shadow-lg ${index % 2 === 0 ? 'md:ml-0' : 'md:mr-0'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gold-500 text-white rounded-full flex items-center justify-center mr-4 font-bold text-lg">
                          {step.step}
                        </div>
                        <h3 className="text-3xl font-bold text-dark-950 font-heading">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-gradient-to-br from-dark-950 to-gray-800 rounded-2xl p-8 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 font-heading">
              Ready to Start Your Project?
            </h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Let's discuss your requirements and create a timeline that works for your business. 
              I'm excited to help you achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/contact"
                className="inline-flex items-center bg-gold-500 text-white px-8 py-3 rounded-full font-bold hover:bg-gold-600 transition-colors duration-300 font-heading"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Today
                <ArrowRight className="w-4 h-4 ml-2" />
              </motion.a>
              <motion.a
                href="/portfolio"
                className="inline-flex items-center border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-dark-950 transition-colors duration-300 font-heading"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View My Work
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default MyProcess
