// Parses GitBook's SUMMARY.md into a navigation tree and derives page URLs.
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

/** URL for a markdown file path relative to the content root (GitBook convention). */
export function urlForFile(file) {
  let p = file.replace(/\\/g, '/').replace(/^\.?\//, '')
  if (p === 'README.md') return '/'
  if (p.endsWith('/README.md')) p = p.slice(0, -'/README.md'.length)
  else if (p.endsWith('.md')) p = p.slice(0, -3)
  return '/' + p.replace(/\/+$/, '')
}

/**
 * Parse SUMMARY.md. Returns a tree of items:
 * { title, file|null, url|null, href (external) | null, children: [] }
 * Group headings (`## Title`) become { group: true, title, children }.
 */
export function parseSummary(text) {
  const root = { children: [] }
  const stack = [{ node: root, indent: -1 }]
  let currentGroup = null
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\t/g, '  ')
    if (/^##\s+/.test(line)) {
      currentGroup = { group: true, title: line.replace(/^##\s+/, '').trim(), children: [] }
      root.children.push(currentGroup)
      stack.length = 1
      stack.push({ node: currentGroup, indent: -1 })
      continue
    }
    const m = line.match(/^(\s*)[*-]\s+\[([^\]]+)\]\(([^)]+)\)\s*$/)
    if (!m) continue
    const indent = m[1].length
    const title = m[2].trim()
    const target = m[3].trim()
    const item = { title, file: null, url: null, href: null, children: [] }
    if (/^https?:\/\//i.test(target)) item.href = target
    else {
      const file = decodeURIComponent(target.replace(/^\.?\//, ''))
      item.file = file
      item.url = urlForFile(file)
    }
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop()
    stack[stack.length - 1].node.children.push(item)
    stack.push({ node: item, indent })
  }
  return root.children
}

/** Read frontmatter and body for a content file. */
export function readPageFile(contentDir, file) {
  const abs = path.join(contentDir, file)
  const raw = fs.readFileSync(abs, 'utf8')
  const { data, content } = matter(raw)
  return { data: data || {}, content, abs }
}

/** Flatten the tree into an ordered list of page items (external links and groups excluded). */
export function flattenPages(tree, parents = [], out = []) {
  for (const item of tree) {
    if (item.group) {
      flattenPages(item.children, parents, out)
      continue
    }
    if (item.file) out.push({ ...item, parents })
    if (item.children?.length) flattenPages(item.children, item.file ? [...parents, item] : parents, out)
  }
  return out
}

/** Extract the leading H1 from markdown (GitBook uses it as the page title). */
export function splitTitle(md) {
  const m = md.match(/^\s*#\s+(.+?)\s*$/m)
  if (!m) return { title: null, body: md }
  const before = md.slice(0, m.index)
  if (before.trim() !== '') return { title: null, body: md }
  const body = md.slice(m.index + m[0].length)
  return { title: stripInlineMarkdown(m[1]), body }
}

export function stripInlineMarkdown(s) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\([^)]*\)/g, '$1')
    .replace(/\\(.)/g, '$1')
    .trim()
}
