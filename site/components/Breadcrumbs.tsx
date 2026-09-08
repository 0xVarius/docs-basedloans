import Link from 'next/link'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import type { Crumb } from '@/lib/content'
import { getIcon } from '@/lib/icons'
import { FaIcon } from './FaIcon'
import { Icon } from './Icon'

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  if (!crumbs.length) return null
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <span key={c.url} style={{ display: 'contents' }}>
          {i > 0 ? (
            <span className="crumb-sep" aria-hidden="true">
              <FaIcon icon={faChevronRight} />
            </span>
          ) : null}
          <Link href={c.url}>
            {c.icon ? <Icon def={getIcon(c.icon)} /> : null}
            <span>{c.title}</span>
          </Link>
        </span>
      ))}
    </nav>
  )
}
