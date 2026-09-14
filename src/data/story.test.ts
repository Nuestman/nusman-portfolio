import { describe, expect, it } from 'vitest'
import { storyTabs } from './story'

describe('storyTabs', () => {
  it('covers every story chapter with unique ids, images, and copy', () => {
    const ids = storyTabs.map((tab) => tab.id)
    expect(ids).toEqual(['history', 'education', 'experience', 'emnurse'])
    expect(new Set(ids).size).toBe(ids.length)
    expect(storyTabs.every((tab) => tab.label.length > 0)).toBe(true)
    expect(storyTabs.every((tab) => tab.icon != null)).toBe(true)
    expect(storyTabs.every((tab) => tab.image.endsWith('.png'))).toBe(true)
    expect(storyTabs.every((tab) => tab.imageAlt.length > 10)).toBe(true)
    expect(storyTabs.every((tab) => tab.body.length > 40)).toBe(true)
  })
})
