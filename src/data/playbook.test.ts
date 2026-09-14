import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
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
    const header = readFileSync(fileURLToPath(new URL('../components/Header.tsx', import.meta.url)), 'utf8')
    const footer = readFileSync(fileURLToPath(new URL('../components/Footer.tsx', import.meta.url)), 'utf8')
    const sitemap = readFileSync(fileURLToPath(new URL('../../public/sitemap.xml', import.meta.url)), 'utf8')

    const robots = readFileSync(fileURLToPath(new URL('../../public/robots.txt', import.meta.url)), 'utf8')

    expect(header).not.toContain(PLAYBOOK_PATH)
    expect(footer).not.toContain(PLAYBOOK_PATH)
    expect(sitemap).not.toContain(PLAYBOOK_PATH)
    expect(robots).toContain(`Disallow: ${PLAYBOOK_PATH}`)
  })
})
