import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="page-wrap">
      <main className="page notfound">
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist or has moved.</p>
        <p>
          <Link href="/">Back to the docs home</Link>
        </p>
      </main>
    </div>
  )
}
