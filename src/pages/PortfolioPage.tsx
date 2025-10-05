import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { ExternalLink, Github, Eye, Code, Palette, Globe } from 'lucide-react'

const PortfolioPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'web', label: 'Web Development' },
    { id: 'design', label: 'UI/UX Design' },
    { id: 'tools', label: 'Tools & Scripts' }
  ]

  const projects = [
    {
      id: 1,
      title: 'Personal Portfolio Website',
      description: 'Modern, responsive portfolio website built with React, TypeScript, and Tailwind CSS. Features smooth animations and clean design.',
      image: '/api/placeholder/400/300',
      category: 'web',
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
      liveUrl: '#',
      githubUrl: '#',
      featured: true
    },
    {
      id: 2,
      title: 'E-Commerce Dashboard',
      description: 'Complete admin dashboard for e-commerce management with analytics, inventory tracking, and user management.',
      image: '/api/placeholder/400/300',
      category: 'web',
      technologies: ['React', 'Node.js', 'MongoDB', 'Chart.js'],
      liveUrl: '#',
      githubUrl: '#',
      featured: true
    },
    {
      id: 3,
      title: 'Mobile App UI Design',
      description: 'Modern mobile application interface design with focus on user experience and accessibility.',
      image: '/api/placeholder/400/300',
      category: 'design',
      technologies: ['Figma', 'Adobe XD', 'Sketch'],
      liveUrl: '#',
      githubUrl: '#',
      featured: false
    },
    {
      id: 4,
      title: 'Task Management Tool',
      description: 'Collaborative task management application with real-time updates and team collaboration features.',
      image: '/api/placeholder/400/300',
      category: 'web',
      technologies: ['Vue.js', 'Firebase', 'Socket.io'],
      liveUrl: '#',
      githubUrl: '#',
      featured: false
    },
    {
      id: 5,
      title: 'Brand Identity Package',
      description: 'Complete brand identity design including logo, color palette, typography, and brand guidelines.',
      image: '/api/placeholder/400/300',
      category: 'design',
      technologies: ['Illustrator', 'Photoshop', 'InDesign'],
      liveUrl: '#',
      githubUrl: '#',
      featured: false
    },
    {
      id: 6,
      title: 'Automation Scripts',
      description: 'Collection of Python scripts for automating repetitive tasks and improving workflow efficiency.',
      image: '/api/placeholder/400/300',
      category: 'tools',
      technologies: ['Python', 'Selenium', 'Beautiful Soup'],
      liveUrl: '#',
      githubUrl: '#',
      featured: false
    }
  ]

  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeCategory)

  const featuredProjects = projects.filter(project => project.featured)

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gold-500 to-gold-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white font-heading">
              My Portfolio - <span className="text-black">Under Construction</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              A collection of projects that showcase my skills in web development, design, and problem-solving
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="hidden py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-dark-950 font-heading">
              Featured Projects
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Here are some of my most recent and noteworthy projects
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="relative overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                      <Button size="sm" variant="secondary" asChild>
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 mr-2" />
                          Live Demo
                        </a>
                      </Button>
                      <Button size="sm" variant="secondary" asChild>
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          Code
                        </a>
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-3xl font-bold mb-2 text-dark-950 font-heading">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-gold-100 text-gold-800 text-sm rounded-full font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Projects with Filter */}
      <section className="hidden py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-dark-950 font-heading">
              All Projects
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Explore my complete collection of work across different categories
            </p>
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.id)}
                  className="font-heading"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Projects Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full">
                    <div className="relative overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-white/90 text-dark-950 text-sm rounded-full font-medium font-heading">
                          {categories.find(cat => cat.id === project.category)?.label}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                        <Button size="sm" variant="secondary" asChild>
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </a>
                        </Button>
                        <Button size="sm" variant="secondary" asChild>
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            Code
                          </a>
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-3xl font-bold mb-2 text-dark-950 font-heading">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-gold-100 text-gold-800 text-xs rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Skills Summary */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-dark-950 font-heading">
              Technologies I Work With
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A comprehensive overview of the tools and technologies I use to bring ideas to life
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-dark-950 font-heading">Development</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {['React', 'TypeScript', 'Node.js', 'Express', 'Vite', 'Next.js'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-dark-950 font-heading">Design</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {['Figma', 'Adobe XD', 'Photoshop', 'Illustrator'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-dark-950 font-heading">Tools & More</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {['Git', 'Render', 'AWS', 'PostGRES', 'Vercel'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PortfolioPage
