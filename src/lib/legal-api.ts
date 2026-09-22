import type { LegalDocument, LegalSection } from '../content/privacy'

function deskLegalBase(): string {
  const fromEnv = import.meta.env.VITE_DESK_INBOUND_URL?.trim()
  if (fromEnv) {
    const base = fromEnv.replace(/\/$/, '')
    if (base.endsWith('/api/inbound-lead')) {
      return base.replace(/\/api\/inbound-lead$/, '/api/legal')
    }
    if (base.endsWith('/api')) {
      return `${base}/legal`
    }
    return `${base}/api/legal`
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api/legal'
  }
  return 'https://desk.nusman.dev/api/legal'
}

type LegalApiOk = {
  ok: true
  slug: string
  title: string
  lastUpdated: string
  intro: string
  sections: LegalSection[]
}

function isLegalSection(value: unknown): value is LegalSection {
  if (!value || typeof value !== 'object') {
    return false
  }
  const row = value as Record<string, unknown>
  if (typeof row.id !== 'string' || typeof row.title !== 'string') {
    return false
  }
  if (!Array.isArray(row.paragraphs)) {
    return false
  }
  return row.paragraphs.every((para) => typeof para === 'string')
}

function parseLegalPayload(data: unknown): LegalDocument | null {
  if (!data || typeof data !== 'object') {
    return null
  }
  const row = data as Record<string, unknown>
  if (row.ok !== true) {
    return null
  }
  if (
    typeof row.title !== 'string' ||
    typeof row.lastUpdated !== 'string' ||
    typeof row.intro !== 'string' ||
    !Array.isArray(row.sections)
  ) {
    return null
  }
  if (!row.sections.every(isLegalSection)) {
    return null
  }
  return {
    title: row.title,
    lastUpdated: row.lastUpdated,
    intro: row.intro,
    sections: row.sections,
  }
}

export async function fetchLegalDocument(
  slug: 'privacy' | 'terms',
  fallback: LegalDocument,
): Promise<LegalDocument> {
  try {
    const response = await fetch(`${deskLegalBase()}/${slug}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      return fallback
    }
    const data = (await response.json()) as LegalApiOk | { ok: false }
    return parseLegalPayload(data) ?? fallback
  } catch {
    return fallback
  }
}
