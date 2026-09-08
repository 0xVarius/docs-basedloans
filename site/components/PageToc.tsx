'use client'
import { useEffect, useState } from 'react'
import { faListUl, faXmark } from '@fortawesome/free-solid-svg-icons'
import type { TocEntry } from '@/lib/markdown.mjs'
import { FaIcon } from './FaIcon'
import { ThemeToggle } from './ThemeToggle'
import { useUi } from './UiProvider'

export function PageToc({ headings }: { headings: TocEntry[] }) {
  const { tocOpen, setTocOpen } = useUi()
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null)

  useEffect(() => {
    if (!headings.length) return
    const els = headings.map((h) => document.getElementById(h.id)).filter((x): x is HTMLElement => !!x)
    if (!els.length) return
    let ticking = false
    const update = () => {
      ticking = false
      const line = 96
      let current: string | null = els[0].id
      for (const el of els) {
        if (el.getBoundingClientRect().top - line <= 0) current = el.id
        else break
      }
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) current = els[els.length - 1].id
      setActive(current)
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [headings])

  return (
    <>
      {tocOpen ? <div className="backdrop for-toc" onClick={() => setTocOpen(false)} aria-hidden="true" /> : null}
      <aside className="page-toc" data-open={tocOpen} aria-label="On this page">
        <div className="toc-inner">
          <div className="toc-mobile-head">
            <button type="button" className="icon-btn" aria-label="Close" onClick={() => setTocOpen(false)}>
              <FaIcon icon={faXmark} />
            </button>
          </div>
          {headings.length ? (
            <>
              <div className="toc-title">
                <FaIcon icon={faListUl} />
                On this page
              </div>
              <ul className="toc-list">
                {headings.map((h) => (
                  <li key={h.id} data-depth={h.depth}>
                    <a href={'#' + h.id} className={active === h.id ? 'active' : undefined} onClick={() => setTocOpen(false)}>
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <div className="toc-foot">
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  )
}
