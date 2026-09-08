import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'

/** Renders a Font Awesome icon definition as inline SVG (no runtime library). */
export function FaIcon({ icon, className }: { icon: IconDefinition; className?: string }) {
  const [w, h, , , d] = icon.icon
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} fill="currentColor" aria-hidden="true">
      {paths.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  )
}
