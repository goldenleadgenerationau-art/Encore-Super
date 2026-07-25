import { useState } from 'react'

// True if this key was already marked used on a previous visit to this
// browser — the first-ever visit gets a normal render and silently marks
// itself used, so only the NEXT visit (or later in the same one) is locked.
export function useOnceLock(key: string): boolean {
  const [alreadyUsed] = useState(() => {
    const used = localStorage.getItem(key) === 'true'
    if (!used) localStorage.setItem(key, 'true')
    return used
  })
  return alreadyUsed
}
