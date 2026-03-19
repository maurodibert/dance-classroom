import { useState } from 'react'

const BETA_KEY  = 'dcb_beta'
const KNOWN_KEY = 'dcb_known_steps'

function loadKnown(): Set<string> {
  try {
    const raw = localStorage.getItem(KNOWN_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function detectBeta(): boolean {
  if (localStorage.getItem(BETA_KEY) === '1') return true
  const url = new URL(window.location.href)
  if (url.searchParams.has('beta')) {
    localStorage.setItem(BETA_KEY, '1')
    url.searchParams.delete('beta')
    window.history.replaceState({}, '', url.toString())
    return true
  }
  return false
}

export function useBeta() {
  const [isBeta]      = useState(detectBeta)
  const [known, setKnown] = useState<Set<string>>(loadKnown)

  function toggleKnown(stepId: string) {
    setKnown(prev => {
      const next = new Set(prev)
      next.has(stepId) ? next.delete(stepId) : next.add(stepId)
      localStorage.setItem(KNOWN_KEY, JSON.stringify([...next]))
      return next
    })
  }

  return {
    isBeta,
    isKnown: (id: string) => known.has(id),
    toggleKnown,
    knownIds: known,
  }
}
