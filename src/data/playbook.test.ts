import { describe, expect, it } from 'vitest'
import { footerNavItems } from '../components/Footer'
import { headerNavItems } from '../components/Header'
import robotsTxt from '../../public/robots.txt?raw'
import sitemapXml from '../../public/sitemap.xml?raw'
import {
  PLAYBOOK_PATH,
  playbookGates,
  playbookQuestions,
  playbookThisWeek,
} from './playbook'

describe('playbook', () => {
  it('uses seven internal gates that map to the public three steps', () => {
    expect(playbookGates.map((gate) => gate.id)).toEqual([
      'qualify',
      'intake',
      'discover',
      'propose',
      'agree',
      'build',
      'launch',
    ])
    expect(playbookGates.filter((gate) => gate.publicStep === 'Discover & Plan')).toHaveLength(4)
    expect(playbookGates.filter((gate) => gate.publicStep === 'Build & Test')).toHaveLength(1)
    expect(playbookGates.filter((gate) => gate.publicStep === 'Launch & Support')).toHaveLength(1)
  })

  it('keeps a complete intake and this-week list', () => {
    expect(playbookQuestions).toHaveLength(8)
    expect(playbookThisWeek).toHaveLength(6)
    expect(new Set(playbookThisWeek.map((item) => item.id)).size).toBe(6)
  })

  it('stays off public navigation, footer, and sitemap', () => {
    expect(headerNavItems.map((item) => item.href)).not.toContain(PLAYBOOK_PATH)
    expect(footerNavItems.map((item) => item.href)).not.toContain(PLAYBOOK_PATH)
    expect(sitemapXml).not.toContain(PLAYBOOK_PATH)
    expect(robotsTxt).toContain(`Disallow: ${PLAYBOOK_PATH}`)
  })
})
