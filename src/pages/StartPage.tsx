import React from 'react'
import StartProjectForm from '../components/StartProjectForm'
import { usePageMeta } from '../hooks/usePageMeta'

const StartPage: React.FC = () => {
  usePageMeta({
    title: 'Start a project with Numan Usman',
    description:
      'Tell Numan what you need built or fixed. Your request opens on his Desk so he can follow up quickly.',
    path: '/start',
  })

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <StartProjectForm />
    </div>
  )
}

export default StartPage
