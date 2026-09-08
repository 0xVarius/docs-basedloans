# Docs site

Self-hosted replacement for the GitBook site. The markdown in the repo root (`SUMMARY.md`, `README.md`, section folders, `.gitbook/assets`) stays the single source of truth; this folder turns it into a static site that looks like the GitBook theme.

## How it works

- `scripts/prepare.mjs` runs before every build: converts the referenced images to WebP into `public/assets`, records the last git commit date per page, and writes `public/search-index.json`.
- `lib/summary.mjs` parses `SUMMARY.md` into the navigation tree. Page URLs follow GitBook rules (`README.md` is the folder index, `.md` is dropped).
- `lib/markdown.mjs` renders GitBook-flavoured markdown: hint boxes, figures, card tables, hard breaks, external link icons, heading anchors.
- `app/[[...slug]]/page.tsx` renders every page at build time (`next build` with `output: 'export'`). No server, no functions.
- `app/theme.css` holds the colour palettes (dark default, light via the toggle). `site.config.mjs` holds the site name, URL and logo path.

## Editing content

Edit the markdown files in the repo root exactly as before. Frontmatter keys that matter: `description`, `icon` (Font Awesome name), `cover` / `coverY` (home page banner), `hidden: true` (page is built but not listed).

Supported GitBook syntax: `{% hint style="info|warning|success|danger" %}`, `<figure><img …><figcaption>`, `<table data-view="cards">`, standard markdown tables, `***` rules, blockquotes, line breaks with a trailing backslash.

## Commands

```bash
cd site
npm ci
npm run dev     # local preview at http://localhost:3000
npm run build   # static export to site/out
npm run start   # serve site/out locally
```

## Deployment

Vercel, configured by `vercel.json` in the repo root (install and build inside `site/`, serve `site/out`). Set an optional `GITHUB_TOKEN` environment variable on the Vercel project so "Last updated" dates can be read from the GitHub API when the build clone is shallow.

## Adapting for another docs repo

Copy this folder, then change `site.config.mjs`, `app/theme.css` (accent and tint scales), `public/logo.png` and `app/icon.png`, and the sitemap URL in `public/robots.txt`.
