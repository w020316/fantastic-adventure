'use client'
import { useEffect, useRef, useCallback } from 'react'

export function useAutoSave<T>(
  data: T,
  key: string,
  interval = 30000
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<string>('')

  const save = useCallback(() => {
    try {
      const serialized = JSON.stringify(data)
      if (serialized !== lastSavedRef.current) {
        localStorage.setItem(key, serialized)
        lastSavedRef.current = serialized
      }
    } catch {}
  }, [data, key])

  const restore = useCallback((): T | null => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) return JSON.parse(stored) as T
    } catch {}
    return null
  }, [key])

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key)
      lastSavedRef.current = ''
    } catch {}
  }, [key])

  useEffect(() => {
    timerRef.current = setInterval(save, interval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      save()
    }
  }, [save, interval])

  return { restore, clear, save }
}
