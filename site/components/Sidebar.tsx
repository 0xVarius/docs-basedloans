'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { faChevronRight, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from './FaIcon'
import { Icon, type IconDef } from './Icon'
import { ThemeToggle } from './ThemeToggle'
import { useUi } from './UiProvider'

export interface SidebarNode {
  title: string
  url: string | null
  href: string | null
  icon: IconDef | null
  group?: boolean
  children: SidebarNode[]
}

const EXT = (
  <svg className="nav-ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

function ancestorsOf(nodes: SidebarNode[], pathname: string, acc: string[] = []): string[] {
  for (const n of nodes) {
    if (n.group) {
      const r = ancestorsOf(n.children, pathname, acc)
      if (r.length) return r
      continue
    }
    if (!n.url) continue
    if (n.url === pathname) return [...acc, n.url]
    if (pathname.startsWith(n.url === '/' ? '/' : n.url + '/')) {
      const r = ancestorsOf(n.children, pathname, [...acc, n.url])
      if (r.length) return r
    }
  }
  return []
}

export function Sidebar({ nav, siteName, logo }: { nav: SidebarNode[]; siteName: string; logo: string }) {
  const pathname = usePathname() || '/'
  const { sidebarOpen, setSidebarOpen } = useUi()
  const auto = useMemo(() => ancestorsOf(nav, pathname), [nav, pathname])
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(auto))

  useEffect(() => {
    setExpanded((prev) => {
      const next = new Set(prev)
      for (const u of auto) next.add(u)
      return next
    })
  }, [auto])

  const toggle = (url: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })

  const renderItems = (items: SidebarNode[], depth = 0) =>
    items.map((item, i) => {
      if (item.group) {
        return (
          <li key={`g-${i}`} className="nav-group">
            <div className="nav-group-title">{item.title}</div>
            <ul className="nav-list">{renderItems(item.children, depth)}</ul>
          </li>
        )
      }
      const hasChildren = item.children.length > 0
      const isExpanded = !!item.url && expanded.has(item.url)
      const isActive = !!item.url && item.url === pathname
      const cls = ['nav-link', isActive ? 'active' : ''].join(' ').trim()
      return (
        <li key={item.url || item.href || item.title} className={['nav-item', hasChildren ? 'has-children' : '', isExpanded ? 'expanded' : ''].join(' ').trim()}>
          <div className="nav-row">
            {item.href ? (
              <a className={cls} href={item.href} target="_blank" rel="noopener noreferrer">
                {item.icon ? <span className="nav-icon"><Icon def={item.icon} /></span> : null}
                <span className="nav-text">{item.title}</span>
                {EXT}
              </a>
            ) : (
              <Link className={cls} href={item.url || '/'} aria-current={isActive ? 'page' : undefined}>
                {item.icon ? <span className="nav-icon"><Icon def={item.icon} /></span> : null}
                <span className="nav-text">{item.title}</span>
              </Link>
            )}
            {hasChildren && item.url ? (
              <button type="button" className="nav-toggle" aria-label={(isExpanded ? 'Collapse ' : 'Expand ') + item.title} aria-expanded={isExpanded} onClick={() => toggle(item.url!)}>
                <FaIcon icon={faChevronRight} />
              </button>
            ) : null}
          </div>
          {hasChildren ? <ul className="nav-children">{renderItems(item.children, depth + 1)}</ul> : null}
        </li>
      )
    })

  return (
    <>
      {sidebarOpen ? <div className="backdrop for-sidebar" onClick={() => setSidebarOpen(false)} aria-hidden="true" /> : null}
      <aside className="sidebar" data-open={sidebarOpen} aria-label="Table of contents">
        <div className="sidebar-panel">
          <div className="sidebar-mobile-head">
            <Link className="logo" href="/">
              <img src={logo} alt="" width={32} height={32} />
              <span>{siteName}</span>
            </Link>
            <button type="button" className="icon-btn" aria-label="Close" onClick={() => setSidebarOpen(false)}>
              <FaIcon icon={faXmark} />
            </button>
          </div>
          <nav className="sidebar-nav">
            <ul className="nav-list">{renderItems(nav)}</ul>
          </nav>
          <div className="sidebar-foot">
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  )
}
