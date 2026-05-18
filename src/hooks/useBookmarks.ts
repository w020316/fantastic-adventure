'use client'
import { useState, useEffect, useCallback } from 'react'

interface BookmarkItem {
  id: string
  title: string
  slug: string
  excerpt: string
  savedAt: string
}

const STORAGE_KEY = 'cyberblog-bookmarks'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setBookmarks(JSON.parse(stored))
    } catch {}
  }, [])

  const save = useCallback((items: BookmarkItem[]) => {
    setBookmarks(items)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
  }, [])

  const addBookmark = useCallback((item: Omit<BookmarkItem, 'savedAt'>) => {
    const exists = bookmarks.some(b => b.id === item.id)
    if (exists) return
    save([...bookmarks, { ...item, savedAt: new Date().toISOString() }])
  }, [bookmarks, save])

  const removeBookmark = useCallback((id: string) => {
    save(bookmarks.filter(b => b.id !== id))
  }, [bookmarks, save])

  const isBookmarked = useCallback((id: string) => {
    return bookmarks.some(b => b.id === id)
  }, [bookmarks])

  return { bookmarks, addBookmark, removeBookmark, isBookmarked }
}

export type { BookmarkItem }
