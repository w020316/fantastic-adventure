'use client'
import { useState, useEffect, useCallback } from 'react'

interface HistoryItem {
  id: string
  title: string
  slug: string
  readAt: string
}

const STORAGE_KEY = 'cyberblog-history'
const MAX_ITEMS = 50

export function useReadingHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setHistory(JSON.parse(stored))
    } catch {}
  }, [])

  const addToHistory = useCallback((item: Omit<HistoryItem, 'readAt'>) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.id !== item.id)
      const updated = [{ ...item, readAt: new Date().toISOString() }, ...filtered].slice(0, MAX_ITEMS)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch {}
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return { history, addToHistory, clearHistory }
}

export type { HistoryItem }
