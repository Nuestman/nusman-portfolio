import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { usePageMeta } from '../hooks/usePageMeta'

const NotFoundPage: React.FC = () => {
  usePageMeta({
    title: 'Page not found | Numan Usman',
    description: 'The page you requested does not exist on Numan Usman’s portfolio.',
    path: '/404',
  })

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <div className="text-center max-w-xl">
        <p className="text-gold-500 font-heading text-2xl mb-4">404</p>
        <h1 className="section-heading text-dark-950 mb-6">
          This page does not exist
        </h1>
        <p className="text-gray-600 mb-8">
          The link may be outdated, or the page has not been published yet.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/">Back to home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/contact">Contact me</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
