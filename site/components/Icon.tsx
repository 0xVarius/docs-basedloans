import type { IconDef } from '@/lib/icons'

export function Icon({ def, className }: { def: IconDef | null | undefined; className?: string }) {
  if (!def) return null
  return (
    <svg className={className} viewBox={`0 0 ${def.width} ${def.height}`} fill="currentColor" aria-hidden="true">
      {def.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

/** Serialisable icon definition for client components. */
export type { IconDef }
