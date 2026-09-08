export interface TocEntry {
  id: string
  text: string
  depth: number
}
export interface SearchSection {
  heading: string | null
  anchor: string | null
  text: string
}
export interface AssetInfo {
  src: string
  width: number
  height: number
}
export function preprocess(md: string): string
export function assetKey(href: string | undefined | null): string | null
export function svgFromIcon(icon: { icon: [number, number, string[], string, string | string[]] }, className?: string): string
export function renderMarkdown(opts: {
  markdown: string
  pageDir: string
  resolveAsset: (key: string) => AssetInfo | null
  resolveLink: (url: string) => string
}): Promise<{ html: string; toc: TocEntry[]; sections: SearchSection[] }>
