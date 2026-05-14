import { useEffect } from 'react'

export function useKeyboardShortcut(key: string, callback: () => void, metaKey = true) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = metaKey ? e.metaKey || e.ctrlKey : true
      if (mod && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault()
        callback()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, callback, metaKey])
}
