import Link from 'next/link'
import { MenuButton } from './MenuButton'
import { Search } from './Search'

export function Header({ siteName, logo }: { siteName: string; logo: string }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="header-left">
          <MenuButton />
          <Link className="logo" href="/">
            <img src={logo} alt="" width={32} height={32} fetchPriority="high" />
            <span>{siteName}</span>
          </Link>
        </div>
        <Search />
      </div>
    </header>
  )
}
