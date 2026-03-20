import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useProgress() {
  const { user } = useAuth()
  const [known, setKnown] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) { setKnown(new Set()); return }

    supabase
      .from('progress')
      .select('step_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setKnown(new Set(data.map((r: { step_id: string }) => r.step_id)))
      })
  }, [user])

  async function toggleKnown(stepId: string) {
    if (!user) return

    const wasKnown = known.has(stepId)

    // Optimistic update
    setKnown(prev => {
      const next = new Set(prev)
      wasKnown ? next.delete(stepId) : next.add(stepId)
      return next
    })

    // Sync to DB, revert on error
    const { error } = wasKnown
      ? await supabase.from('progress').delete().match({ user_id: user.id, step_id: stepId })
      : await supabase.from('progress').upsert({ user_id: user.id, step_id: stepId })

    if (error) {
      setKnown(prev => {
        const next = new Set(prev)
        wasKnown ? next.add(stepId) : next.delete(stepId)
        return next
      })
    }
  }

  return {
    isKnown: (id: string) => known.has(id),
    toggleKnown,
    knownIds: known,
  }
}
