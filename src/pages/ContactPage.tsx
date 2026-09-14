import React from 'react'
import Contact from '../components/Contact'
import { usePageMeta } from '../hooks/usePageMeta'

const ContactPage: React.FC = () => {
  usePageMeta({
    title: 'Contact Numan Usman',
    description: 'Get in touch with Numan Usman for freelance web development and healthcare technology projects.',
    path: '/contact',
  })

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <Contact />
    </div>
  )
}

export default ContactPage
