import type { MetadataRoute } from 'next'
import config from '@/site.config.mjs'
import { getAllUrls, getSiteIndex } from '@/lib/content'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const idx = getSiteIndex()
  return getAllUrls()
    .filter((u) => idx.frontmatter.get(idx.byUrl.get(u)!.file!)?.hidden !== true)
    .map((u) => {
      const file = idx.byUrl.get(u)!.file!
      const ts = idx.meta.pages[file]
      return { url: config.url + (u === '/' ? '' : u), lastModified: ts ? new Date(ts * 1000) : undefined }
    })
}
