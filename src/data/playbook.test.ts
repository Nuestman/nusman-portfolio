import { describe, expect, it } from 'vitest'
import { footerNavItems } from '../components/Footer'
import { headerNavItems } from '../components/Header'
import robotsTxt from '../../public/robots.txt?raw'
import sitemapXml from '../../public/sitemap.xml?raw'

const PLAYBOOK_PATH = '/playbook'

describe('playbook stays off the public site', () => {
  it('is not in navigation, footer, or sitemap, and robots still disallow it', () => {
    expect(headerNavItems.map((item) => item.href)).not.toContain(PLAYBOOK_PATH)
    expect(footerNavItems.map((item) => item.href)).not.toContain(PLAYBOOK_PATH)
    expect(sitemapXml).not.toContain(PLAYBOOK_PATH)
    expect(robotsTxt).toContain(`Disallow: ${PLAYBOOK_PATH}`)
  })
})
