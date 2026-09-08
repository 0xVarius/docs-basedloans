'use client'
import { faListUl } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from './FaIcon'
import { useUi } from './UiProvider'

export function TocButton() {
  const { setTocOpen } = useUi()
  return (
    <button type="button" className="toc-btn" aria-label="On this page" onClick={() => setTocOpen(true)}>
      <FaIcon icon={faListUl} />
    </button>
  )
}
