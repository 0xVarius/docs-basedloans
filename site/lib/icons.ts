// Icon lookup by GitBook/Font Awesome name. Uses Font Awesome Free (CC BY 4.0) icon data.
import * as solid from '@fortawesome/free-solid-svg-icons'
import * as regular from '@fortawesome/free-regular-svg-icons'
import * as brands from '@fortawesome/free-brands-svg-icons'

export interface IconDef {
  width: number
  height: number
  paths: string[]
}

type Pack = Record<string, unknown>

// GitBook page icons that exist only in Font Awesome Pro, mapped to the closest free icon.
const ALIASES: Record<string, string> = {
  'web-awesome': 'crown',
  'square-x': 'square-xmark',
  'message-heart': 'comment-dots',
  'person-sign': 'people-group',
  'chart-mixed': 'chart-line',
  'shield-check': 'shield-halved',
  'hand-holding-dollar': 'hand-holding-dollar',
  'coin': 'coins',
  'sack-dollar': 'sack-dollar',
  'money-bill-transfer': 'money-bill-transfer',
  'timeline': 'timeline',
  'building-columns': 'building-columns',
  'vault': 'vault',
}

function toExport(name: string): string {
  return 'fa' + name.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase())
}

function fromPack(pack: Pack, name: string): IconDef | null {
  const v = pack[toExport(name)] as { icon?: [number, number, string[], string, string | string[]] } | undefined
  if (!v?.icon) return null
  const [w, h, , , d] = v.icon
  return { width: w, height: h, paths: Array.isArray(d) ? d : [d] }
}

export function getIcon(name: string | null | undefined): IconDef | null {
  if (!name) return null
  const n = ALIASES[name] || name
  return fromPack(solid as Pack, n) || fromPack(regular as Pack, n) || fromPack(brands as Pack, n) || null
}
