import React from 'react'
import StartProjectForm from '../components/StartProjectForm'
import { usePageMeta } from '../hooks/usePageMeta'

const StartPage: React.FC = () => {
  usePageMeta({
    title: 'Start a project with Numan Usman',
    description:
      'Start a project with Numan Usman — share the brief, then confirm your email so it reaches the Desk.',
    path: '/start',
  })

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <StartProjectForm />
    </div>
  )
}

export default StartPage
