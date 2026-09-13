import { describe, expect, it } from 'vitest'
import { storyTabs } from './story'

describe('storyTabs', () => {
  it('covers every story photo with unique ids', () => {
    const ids = storyTabs.map((tab) => tab.id)
    expect(ids).toEqual(['history', 'education', 'experience', 'emnurse'])
    expect(storyTabs.every((tab) => tab.image.startsWith('/images/story/'))).toBe(true)
    expect(storyTabs.every((tab) => tab.body.length > 40)).toBe(true)
  })
})
