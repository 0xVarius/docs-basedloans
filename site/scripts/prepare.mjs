// Build-time preparation: converts referenced images to WebP, records git "last updated"
// dates, and writes the client-side search index. Runs before `next build` and `next dev`.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import sharp from 'sharp'
import config from '../site.config.mjs'
import { parseSummary, flattenPages, readPageFile, splitTitle, urlForFile } from '../lib/summary.mjs'
import { renderMarkdown, assetKey } from '../lib/markdown.mjs'

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = path.resolve(siteDir, config.contentDir)
const outAssets = path.join(siteDir, 'public', 'assets')
const generated = path.join(siteDir, 'generated')
fs.mkdirSync(outAssets, { recursive: true })
fs.mkdirSync(generated, { recursive: true })

const summary = fs.readFileSync(path.join(contentDir, 'SUMMARY.md'), 'utf8')
const tree = parseSummary(summary)
const pages = flattenPages(tree)

// ---------- 0. House style guard: no em dashes anywhere in the content ----------
const offenders = []
for (const page of pages) {
  const raw = fs.readFileSync(path.join(contentDir, page.file), 'utf8')
  raw.split(/\r?\n/).forEach((line, i) => {
    if (line.includes('\u2014')) offenders.push(`${page.file}:${i + 1}`)
  })
}
if (offenders.length) {
  console.error('[prepare] Em dashes are not allowed in the docs. Replace them with a period, comma, colon or parentheses:')
  for (const o of offenders) console.error('  ' + o)
  process.exit(1)
}

// ---------- 1. Collect asset references ----------
const refs = new Set()
const RE_ATTR = /(?:src|href)="([^"]*\.gitbook\/assets\/[^"]+)"/g
const RE_MD = /\]\(([^)\s]*\.gitbook\/assets\/[^)]*)\)/g
for (const page of pages) {
  const { data, content } = readPageFile(contentDir, page.file)
  for (const m of content.matchAll(RE_ATTR)) refs.add(assetKey(m[1]))
  for (const m of content.matchAll(RE_MD)) refs.add(assetKey(m[1]))
  if (typeof data.cover === 'string') refs.add(assetKey(data.cover))
}

function slugName(file) {
  const ext = path.extname(file)
  const base = path.basename(file, ext)
  return (
    base
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase() || 'image'
  )
}

// ---------- 2. Convert images ----------
const manifest = {}
const used = new Set()
let converted = 0
let missing = 0
for (const key of [...refs].sort()) {
  const src = path.join(contentDir, key)
  if (!fs.existsSync(src)) {
    console.warn(`[prepare] missing asset: ${key}`)
    missing++
    continue
  }
  const ext = path.extname(key).toLowerCase()
  let name = slugName(key)
  let candidate = name
  let n = 2
  while (used.has(candidate)) candidate = `${name}-${n++}`
  used.add(candidate)
  const raster = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.tiff'].includes(ext)
  if (!raster) {
    const outName = candidate + ext
    fs.copyFileSync(src, path.join(outAssets, outName))
    let width = 0
    let height = 0
    try {
      const meta = await sharp(src).metadata()
      width = meta.width || 0
      height = meta.height || 0
    } catch {}
    manifest[key] = { src: `/assets/${outName}`, width, height }
    continue
  }
  const outName = candidate + '.webp'
  const outPath = path.join(outAssets, outName)
  const isCover = pages.some((p) => {
    const { data } = readPageFile(contentDir, p.file)
    return typeof data.cover === 'string' && assetKey(data.cover) === key
  })
  const maxWidth = isCover ? config.coverMaxWidth : config.imageMaxWidth
  const needs = !fs.existsSync(outPath) || fs.statSync(outPath).mtimeMs < fs.statSync(src).mtimeMs
  let image = sharp(src, { animated: false })
  const meta = await image.metadata()
  if (needs) {
    image = image.rotate()
    if ((meta.width || 0) > maxWidth) image = image.resize({ width: maxWidth, withoutEnlargement: true })
    await image.webp({ quality: 82, effort: 5 }).toFile(outPath)
    converted++
  }
  const outMeta = await sharp(outPath).metadata()
  manifest[key] = { src: `/assets/${outName}`, width: outMeta.width || meta.width || 0, height: outMeta.height || meta.height || 0 }
}
fs.writeFileSync(path.join(generated, 'assets.json'), JSON.stringify(manifest, null, 1))

// ---------- 3. Last-updated dates from git ----------
// Hosted builds (Vercel) get a shallow clone, where `git log` would report the clone boundary
// for untouched files. Unshallow when possible, otherwise fall back to the GitHub commits API.
function git(args) {
  return execFileSync('git', args, { cwd: contentDir, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
}
let shallow = false
let gitAvailable = true
try {
  shallow = git(['rev-parse', '--is-shallow-repository']) === 'true'
  if (shallow) {
    try {
      execFileSync('git', ['fetch', '--unshallow', '--quiet'], { cwd: contentDir, stdio: 'ignore', timeout: 60000 })
      shallow = git(['rev-parse', '--is-shallow-repository']) === 'true'
    } catch {}
  }
} catch {
  gitAvailable = false
}
const ghRepo = process.env.GITHUB_REPOSITORY || (process.env.VERCEL_GIT_REPO_OWNER && `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`)
const ghRef = process.env.VERCEL_GIT_COMMIT_REF || 'main'
async function githubDate(file) {
  if (!ghRepo) return null
  const headers = { 'User-Agent': 'docs-site-build', Accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const res = await fetch(`https://api.github.com/repos/${ghRepo}/commits?path=${encodeURIComponent(file)}&sha=${encodeURIComponent(ghRef)}&per_page=1`, { headers })
  if (!res.ok) return null
  const data = await res.json()
  const d = data?.[0]?.commit?.committer?.date
  return d ? Math.floor(new Date(d).getTime() / 1000) : null
}
const useApi = shallow || !gitAvailable
const meta = {}
const source = useApi ? (ghRepo ? 'github-api' : 'none') : 'git'
for (const page of pages) {
  let ts = null
  if (!useApi) {
    try {
      const out = git(['log', '-1', '--format=%ct', '--', page.file])
      ts = out ? Number(out) : null
    } catch {}
  } else {
    try {
      ts = await githubDate(page.file)
    } catch {}
  }
  meta[page.file] = ts
}
console.log(`[prepare] last-updated source: ${source}`)
fs.writeFileSync(path.join(generated, 'meta.json'), JSON.stringify({ pages: meta, builtAt: Math.floor(Date.now() / 1000) }, null, 1))

// ---------- 4. Search index ----------
const urlSet = new Set(pages.map((p) => p.url))
const resolveLink = (u) => {
  let x = u.replace(/\/README\.md$/, '').replace(/\.md$/, '').replace(/\/+$/, '')
  if (x === '' || x === '/README') x = '/'
  if (!urlSet.has(x) && urlSet.has(x + '/README')) x = x + '/README'
  return x
}
const resolveAsset = (key) => manifest[key] || null
const index = []
for (const page of pages) {
  const { data, content } = readPageFile(contentDir, page.file)
  if (data.hidden === true) continue
  const { title, body } = splitTitle(content)
  const pageDir = path.posix.dirname(page.file.replace(/\\/g, '/'))
  const { sections } = await renderMarkdown({ markdown: body, pageDir: pageDir === '.' ? '' : pageDir, resolveAsset, resolveLink })
  const crumbs = page.parents.map((p) => p.title)
  const pageTitle = title || page.title
  sections.forEach((s, i) => {
    index.push({
      id: `${page.url}#${s.anchor || i}`,
      url: page.url + (s.anchor ? '#' + s.anchor : ''),
      title: pageTitle,
      crumbs,
      description: i === 0 && typeof data.description === 'string' ? data.description : '',
      heading: s.heading || '',
      text: s.text.slice(0, 4000),
    })
  })
}
fs.writeFileSync(path.join(siteDir, 'public', 'search-index.json'), JSON.stringify(index))

console.log(`[prepare] ${pages.length} pages, ${Object.keys(manifest).length} assets (${converted} converted, ${missing} missing), ${index.length} search entries`)
