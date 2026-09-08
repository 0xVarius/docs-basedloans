import type { Metadata, Viewport } from 'next'
import { Noto_Sans, IBM_Plex_Mono } from 'next/font/google'
import config from '@/site.config.mjs'
import { getNav, type NavNode } from '@/lib/content'
import { getIcon } from '@/lib/icons'
import { Header } from '@/components/Header'
import { Sidebar, type SidebarNode } from '@/components/Sidebar'
import { UiProvider } from '@/components/UiProvider'
import { ContentEnhancer } from '@/components/ContentEnhancer'
import './globals.css'

const sans = Noto_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(config.url),
  title: { default: config.name, template: `%s | ${config.name}` },
  openGraph: { siteName: config.name, type: 'website' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#212323' },
    { media: '(prefers-color-scheme: light)', color: '#fcf9f7' },
  ],
}

const THEME_INIT = `(function(){var t='dark';try{t=localStorage.getItem('theme')||'dark'}catch(e){}var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.add(d?'dark':'light');r.dataset.theme=t;})();`

function toSidebar(nodes: NavNode[]): SidebarNode[] {
  return nodes.map((n) => ({ title: n.title, url: n.url, href: n.href, icon: getIcon(n.icon), group: n.group, children: toSidebar(n.children) }))
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nav = toSidebar(getNav())
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        <UiProvider>
          <Header siteName={config.name} logo={config.logo} />
          <div className="container layout">
            <Sidebar nav={nav} siteName={config.name} logo={config.logo} />
            {children}
          </div>
          <ContentEnhancer />
        </UiProvider>
      </body>
    </html>
  )
}
