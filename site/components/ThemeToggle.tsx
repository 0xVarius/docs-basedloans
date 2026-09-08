'use client'
import { useEffect, useState } from 'react'
import { faSun, faDesktop, faMoon } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from './FaIcon'

type Theme = 'light' | 'system' | 'dark'
const KEY = 'theme'

function apply(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  const root = document.documentElement
  root.classList.toggle('dark', dark)
  root.classList.toggle('light', !dark)
  root.dataset.theme = theme
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const current = (document.documentElement.dataset.theme as Theme) || 'dark'
    setTheme(current)
    const onChange = () => setTheme((document.documentElement.dataset.theme as Theme) || 'dark')
    window.addEventListener('themechange', onChange)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onMq = () => {
      if (document.documentElement.dataset.theme === 'system') apply('system')
    }
    mq.addEventListener('change', onMq)
    return () => {
      window.removeEventListener('themechange', onChange)
      mq.removeEventListener('change', onMq)
    }
  }, [])

  const choose = (t: Theme) => {
    try {
      localStorage.setItem(KEY, t)
    } catch {}
    apply(t)
    setTheme(t)
    window.dispatchEvent(new Event('themechange'))
  }

  const items: { id: Theme; label: string; icon: typeof faSun }[] = [
    { id: 'light', label: 'Switch to light theme', icon: faSun },
    { id: 'system', label: 'Switch to system theme', icon: faDesktop },
    { id: 'dark', label: 'Switch to dark theme', icon: faMoon },
  ]
  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Theme">
      {items.map((it) => (
        <button key={it.id} type="button" role="radio" aria-checked={theme === it.id} aria-label={it.label} title={it.label} onClick={() => choose(it.id)}>
          <FaIcon icon={it.icon} />
        </button>
      ))}
    </div>
  )
}
