// Markdown -> HTML for GitBook-flavoured content.
// Shared by the Next.js build (pages) and scripts/prepare.mjs (search index).
import path from 'node:path/posix'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import { visit, SKIP } from 'unist-util-visit'
import { toString } from 'hast-util-to-string'
import { faCircleInfo, faCircleExclamation, faTriangleExclamation, faCircleCheck } from '@fortawesome/free-solid-svg-icons'


const HINT_ICONS = {
  info: faCircleInfo,
  warning: faCircleExclamation,
  danger: faTriangleExclamation,
  success: faCircleCheck,
}

export function svgFromIcon(icon, className = '') {
  const [w, h, , , d] = icon.icon
  const paths = Array.isArray(d) ? d : [d]
  return `<svg class="${className}" viewBox="0 0 ${w} ${h}" fill="currentColor" aria-hidden="true">${paths.map((p) => `<path d="${p}"/>`).join('')}</svg>`
}

const EXTERNAL_ICON =
  '<svg class="ext-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>'

const ANCHOR_ICON =
  '<svg viewBox="0 0 640 512" fill="currentColor" aria-hidden="true"><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg>'

/** Convert GitBook template tags into HTML the markdown parser can carry through. */
export function preprocess(md) {
  let out = md.replace(/\{%\s*hint\s+style="(\w+)"\s*%\}/g, (_, style) => {
    const s = HINT_ICONS[style] ? style : 'info'
    return `<div class="hint hint-${s}"><div class="hint-icon">${svgFromIcon(HINT_ICONS[s])}</div><div class="hint-body">\n\n`
  })
  out = out.replace(/\{%\s*endhint\s*%\}/g, '\n\n</div></div>')
  // Any other template tag we don't render: drop it rather than print it.
  out = out.replace(/^\s*\{%[^%]*%\}\s*$/gm, '')
  return out
}

/**
 * Locate a `.gitbook/assets/...` reference in a URL and return the decoded canonical key.
 * Returns null for anything else.
 */
export function assetKey(href) {
  if (!href) return null
  const i = href.indexOf('.gitbook/assets/')
  if (i === -1) return null
  let key = href.slice(i)
  try {
    key = decodeURIComponent(key)
  } catch {}
  return key
}

function isExternal(href) {
  return /^(https?:)?\/\//i.test(href) || /^mailto:/i.test(href) || /^tel:/i.test(href)
}

function setClass(node, cls) {
  const cur = node.properties.className
  const list = Array.isArray(cur) ? cur : cur ? String(cur).split(/\s+/) : []
  if (!list.includes(cls)) list.push(cls)
  node.properties.className = list
}

function hasClass(node, cls) {
  const cur = node?.properties?.className
  const list = Array.isArray(cur) ? cur : cur ? String(cur).split(/\s+/) : []
  return list.includes(cls)
}

function el(tagName, properties = {}, children = []) {
  return { type: 'element', tagName, properties, children }
}

function text(value) {
  return { type: 'text', value }
}

/**
 * Transform a GitBook "cards" table into a card grid.
 * Columns are described by <th> attributes: data-card-cover, data-card-target, data-type, data-hidden.
 */
function transformCards(table, resolveAsset) {
  const thead = table.children.find((c) => c.tagName === 'thead')
  const tbody = table.children.find((c) => c.tagName === 'tbody')
  if (!thead || !tbody) return null
  const headRow = thead.children.find((c) => c.tagName === 'tr')
  const cols = (headRow?.children || [])
    .filter((c) => c.tagName === 'th')
    .map((th) => ({
      cover: 'dataCardCover' in th.properties,
      target: 'dataCardTarget' in th.properties,
      hidden: 'dataHidden' in th.properties,
      type: th.properties.dataType || 'text',
    }))
  const cards = []
  for (const tr of tbody.children.filter((c) => c.tagName === 'tr')) {
    const cells = tr.children.filter((c) => c.tagName === 'td')
    let cover = null
    let target = null
    const body = []
    cells.forEach((td, i) => {
      const col = cols[i] || {}
      const link = findFirst(td, 'a')
      if (col.cover) {
        const key = assetKey(link?.properties?.href)
        const asset = key ? resolveAsset(key) : null
        if (asset) cover = asset
        return
      }
      if (col.target) {
        if (link?.properties?.href) target = link.properties.href
        return
      }
      if (col.hidden) return
      if (!toString(td).trim()) return
      body.push(el('div', { className: ['card-line', col.type === 'content-ref' ? 'card-link' : 'card-text'] }, td.children))
    })
    const children = []
    if (cover)
      children.push(
        el('div', { className: ['card-cover'] }, [
          el('img', { src: cover.src, width: cover.width, height: cover.height, alt: '', loading: 'lazy', decoding: 'async' }),
        ]),
      )
    children.push(el('div', { className: ['card-body'] }, body))
    if (target) {
      const ext = isExternal(target)
      children.push(
        el('a', {
          className: ['card-target'],
          href: target,
          'aria-label': toString(body[0] || text('')).trim() || 'Open',
          ...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
        }),
      )
    }
    cards.push(el('div', { className: ['card'] }, children))
  }
  return el('div', { className: ['cards'] }, cards)
}

const BLOCKY = new Set(['td', 'th', 'li', 'p', 'div', 'tr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figcaption', 'br', 'blockquote', 'pre'])
/** Plain text with spaces preserved across cell/block boundaries (for the search index). */
export function textOf(node) {
  if (node.type === 'text') return node.value
  if (node.type === 'element') {
    const inner = (node.children || []).map(textOf).join('')
    return BLOCKY.has(node.tagName) ? ' ' + inner + ' ' : inner
  }
  if (node.type === 'root') return (node.children || []).map(textOf).join('')
  return ''
}

function findFirst(node, tagName) {
  let found = null
  visit(node, 'element', (n) => {
    if (!found && n.tagName === tagName) {
      found = n
      return SKIP
    }
  })
  return found
}

/**
 * Render markdown to HTML.
 * @param {object} opts
 * @param {string} opts.markdown  page body (without the leading H1)
 * @param {string} opts.pageDir   directory of the page relative to the content root ('' for root)
 * @param {(key:string)=>({src:string,width:number,height:number}|null)} opts.resolveAsset
 * @param {(url:string)=>string} opts.resolveLink  maps a normalised internal path to a site URL
 */
export async function renderMarkdown({ markdown, pageDir, resolveAsset, resolveLink }) {
  const toc = []
  const sections = []

  const gitbookPlugin = () => (tree) => {
    // Wrap plain tables, convert card tables.
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'table' || !parent || index == null) return
      if (node.properties.dataView === 'cards') {
        const cards = transformCards(node, resolveAsset)
        if (cards) {
          parent.children[index] = cards
          return SKIP
        }
      }
      // Optional column widths from a preceding `<!-- widths: 20% 30% 50% -->` comment.
      for (let j = index - 1; j >= 0; j--) {
        const prev = parent.children[j]
        if (prev.type === 'text' && !prev.value.trim()) continue
        if (prev.type === 'comment') {
          const m = prev.value.match(/^\s*widths?:\s*(.+?)\s*$/i)
          if (m) {
            const widths = m[1].split(/[\s,]+/).filter(Boolean)
            const ths = node.children.find((c) => c.tagName === 'thead')?.children?.find((c) => c.tagName === 'tr')?.children?.filter((c) => c.tagName === 'th') || []
            ths.forEach((th, k) => {
              if (widths[k]) th.properties.style = `${th.properties.style ? th.properties.style + ';' : ''}width:${widths[k]}`
            })
            parent.children.splice(j, 1)
            index--
          }
        }
        break
      }
      parent.children[index] = el('div', { className: ['table-wrap'] }, [node])
      return SKIP
    })

    visit(tree, 'element', (node, index, parent) => {
      const p = node.properties || (node.properties = {})

      if (node.tagName === 'th' || node.tagName === 'td') {
        if (p.width) {
          p.style = `${p.style ? p.style + ';' : ''}width:${String(p.width).replace(/px$/, '')}px`
          delete p.width
        }
      }

      if (node.tagName === 'img') {
        const key = assetKey(p.src)
        if (key) {
          const asset = resolveAsset(key)
          if (asset) {
            p.src = asset.src
            p.width = asset.width
            p.height = asset.height
          }
        }
        if (!p.loading) p.loading = 'lazy'
        p.decoding = 'async'
        if (!hasClass(parent, 'card-cover')) setClass(node, 'zoomable')
      }

      if (node.tagName === 'li' && !node.children.some((c) => c.type === 'element' && hasClass(c, 'li-body'))) {
        node.children = [el('div', { className: ['li-body'] }, node.children)]
      }

      if (node.tagName === 'figcaption' && !toString(node).trim() && parent && index != null) {
        parent.children.splice(index, 1)
        return index
      }

      if (node.tagName === 'a' && typeof p.href === 'string') {
        const href = p.href
        const key = assetKey(href)
        if (key) {
          const asset = resolveAsset(key)
          if (asset) p.href = asset.src
        } else if (isExternal(href)) {
          p.target = '_blank'
          p.rel = 'noopener noreferrer'
          const hasImg = !!findFirst(node, 'img')
          if (!hasImg && !hasClass(node, 'card-target') && !hasClass(node, 'heading-anchor')) {
            node.children.push({ type: 'raw', value: EXTERNAL_ICON })
          }
        } else if (!href.startsWith('#')) {
          const [pathPart, hash] = href.split('#')
          const joined = path.normalize(path.join('/', pageDir, pathPart))
          p.href = resolveLink(joined) + (hash ? '#' + hash : '')
        }
      }

      if (/^h[2-4]$/.test(node.tagName) && p.id) {
        const depth = Number(node.tagName[1])
        const label = toString(node).trim()
        if (depth <= 3) toc.push({ id: p.id, text: label, depth })
        node.children.push(
          el('a', { className: ['heading-anchor'], href: '#' + p.id, 'aria-label': 'Direct link to ' + label }, [
            { type: 'raw', value: ANCHOR_ICON },
          ]),
        )
      }
    })

    // Collect search sections from top-level blocks.
    let current = { heading: null, anchor: null, parts: [] }
    const flush = () => {
      const t = current.parts.join(' ').replace(/\s+/g, ' ').trim()
      if (t || current.heading) sections.push({ heading: current.heading, anchor: current.anchor, text: t })
    }
    for (const child of tree.children) {
      if (child.type !== 'element') continue
      if (/^h[2-3]$/.test(child.tagName)) {
        flush()
        current = { heading: toString(child).trim(), anchor: child.properties?.id || null, parts: [] }
      } else {
        current.parts.push(textOf(child))
      }
    }
    flush()
  }

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(gitbookPlugin)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(preprocess(markdown))

  return { html: String(file), toc, sections }
}
