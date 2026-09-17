import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from './ui/button'
import { portalAppUrl } from '../lib/portal-url'

export const headerNavItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: portalAppUrl(), label: 'Portal', external: true },
] as const

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isMobileMenuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isMobileMenuOpen])

  const isActivePath = (path: string) => {
    if (path.startsWith('http')) return false
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const navClassName = (href: string, mobile = false) =>
    `transition-colors duration-300 font-medium font-heading text-lg ${
      mobile ? 'text-left w-full py-1' : ''
    } ${
      isActivePath(href)
        ? 'text-gold-500'
        : 'text-dark-950 hover:text-gold-500'
    }`

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const mobileBackdrop =
    portalReady &&
    createPortal(
      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.button
            key="mobile-nav-backdrop"
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-dark-950/40 backdrop-blur-[2px] md:hidden"
            onClick={closeMobileMenu}
          />
        ) : null}
      </AnimatePresence>,
      document.body,
    )

  return (
    <>
      {mobileBackdrop}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? 'bg-white/95 backdrop-blur-md shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between py-4">
            <Link to="/" onClick={closeMobileMenu}>
              <motion.div
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <img
                  src="/logos/nusman-logo-wide.png"
                  alt="Numan Usman Logo"
                  className="h-12 w-auto"
                />
              </motion.div>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {headerNavItems.map((item) =>
                'external' in item && item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    className={navClassName(item.href)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={navClassName(item.href)}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden relative z-50"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </nav>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen ? (
            <motion.div
              key="mobile-navigation"
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="absolute left-4 right-4 top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white p-4 shadow-xl md:hidden"
            >
              <div className="flex flex-col space-y-3">
                {headerNavItems.map((item) =>
                  'external' in item && item.external ? (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={navClassName(item.href, true)}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={closeMobileMenu}
                      className={navClassName(item.href, true)}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.header>
    </>
  )
}

export default Header
