'use client'
import { useEffect, useState } from 'react'

export function relativeTime(ts: number, now: number): string {
  const diff = Math.max(0, now - ts)
  const min = 60
  const hour = 3600
  const day = 86400
  const month = 30 * day
  const year = 365 * day
  const f = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'} ago`
  if (diff < min) return 'just now'
  if (diff < hour) return f(Math.floor(diff / min), 'minute')
  if (diff < day) return f(Math.floor(diff / hour), 'hour')
  if (diff < month) return f(Math.floor(diff / day), 'day')
  if (diff < year) return f(Math.floor(diff / month), 'month')
  return f(Math.floor(diff / year), 'year')
}

export function LastUpdated({ ts, builtAt }: { ts: number | null; builtAt: number }) {
  const [label, setLabel] = useState(() => (ts ? relativeTime(ts, builtAt) : null))
  useEffect(() => {
    if (ts) setLabel(relativeTime(ts, Math.floor(Date.now() / 1000)))
  }, [ts])
  if (!ts || !label) return null
  const iso = new Date(ts * 1000).toISOString()
  return (
    <p className="last-updated">
      Last updated{' '}
      <time dateTime={iso} title={new Date(ts * 1000).toUTCString()} suppressHydrationWarning>
        {label}
      </time>
    </p>
  )
}
