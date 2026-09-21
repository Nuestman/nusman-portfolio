import React from 'react'
import { StartContinueForm } from '../components/StartProjectForm'
import { usePageMeta } from '../hooks/usePageMeta'

const StartContinuePage: React.FC = () => {
  usePageMeta({
    title: 'Continue your project — Numan Usman',
    description:
      'Confirm your email to send your project request to Numan’s Desk.',
    path: '/start/continue',
  })

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <StartContinueForm />
    </div>
  )
}

export default StartContinuePage
