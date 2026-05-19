'use client'
import { useState, useEffect } from 'react'

export function useMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    let timer: NodeJS.Timeout
    const check = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setIsMobile(window.innerWidth < breakpoint), 100)
    }
    check()
    window.addEventListener('resize', check)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', check)
    }
  }, [breakpoint])
  return isMobile
}
