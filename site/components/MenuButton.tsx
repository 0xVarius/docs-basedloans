'use client'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from './FaIcon'
import { useUi } from './UiProvider'

export function MenuButton() {
  const { setSidebarOpen } = useUi()
  return (
    <button type="button" className="icon-btn menu-btn" aria-label="Open table of contents" onClick={() => setSidebarOpen(true)}>
      <FaIcon icon={faBars} />
    </button>
  )
}
