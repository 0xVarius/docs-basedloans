import Link from 'next/link'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import type { PageLink } from '@/lib/content'
import { FaIcon } from './FaIcon'

export function PrevNext({ prev, next }: { prev: PageLink | null; next: PageLink | null }) {
  if (!prev && !next) return null
  return (
    <nav className="pagination" aria-label="Pagination">
      {prev ? (
        <Link className="pager prev" href={prev.url}>
          <FaIcon icon={faChevronLeft} />
          <span>
            <span className="pager-label">Previous</span>
            <span className="pager-title" style={{ display: 'block' }}>
              {prev.title}
            </span>
          </span>
        </Link>
      ) : null}
      {next ? (
        <Link className="pager next" href={next.url}>
          <span>
            <span className="pager-label">Next</span>
            <span className="pager-title" style={{ display: 'block' }}>
              {next.title}
            </span>
          </span>
          <FaIcon icon={faChevronRight} />
        </Link>
      ) : null}
    </nav>
  )
}
