'use client'
import { useEffect, useState } from 'react'

/** Adds click-to-zoom for content images. */
export function ContentEnhancer() {
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      const img = t?.closest?.('img.zoomable') as HTMLImageElement | null
      if (!img || img.closest('a')) return
      e.preventDefault()
      setZoom({ src: img.currentSrc || img.src, alt: img.alt || '' })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  useEffect(() => {
    if (!zoom) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(null)
    }
    window.addEventListener('keydown', onKey)
    document.documentElement.classList.add('no-scroll')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('no-scroll')
    }
  }, [zoom])
  if (!zoom) return null
  return (
    <div className="zoom-overlay" onClick={() => setZoom(null)} role="dialog" aria-label="Image preview">
      <img src={zoom.src} alt={zoom.alt} />
    </div>
  )
}
