'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface UiState {
  sidebarOpen: boolean
  tocOpen: boolean
  searchOpen: boolean
  setSidebarOpen: (v: boolean) => void
  setTocOpen: (v: boolean) => void
  setSearchOpen: (v: boolean) => void
}

const Ctx = createContext<UiState | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setSidebarOpen(false)
    setTocOpen(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    const anyOpen = sidebarOpen || tocOpen || searchOpen
    document.documentElement.classList.toggle('no-scroll', anyOpen)
    return () => document.documentElement.classList.remove('no-scroll')
  }, [sidebarOpen, tocOpen, searchOpen])

  const onKey = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      setSearchOpen((v) => !v)
      return
    }
    if (e.key === 'Escape') {
      setSidebarOpen(false)
      setTocOpen(false)
      setSearchOpen(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onKey])

  const value = useMemo(
    () => ({ sidebarOpen, tocOpen, searchOpen, setSidebarOpen, setTocOpen, setSearchOpen }),
    [sidebarOpen, tocOpen, searchOpen],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useUi(): UiState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useUi outside UiProvider')
  return v
}
