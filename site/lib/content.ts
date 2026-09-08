// Server-side content access for the Next.js app. Reads the GitBook markdown tree.
import fs from "node:fs";
import path from "node:path";
import config from "@/site.config.mjs";
import {
  parseSummary,
  flattenPages,
  readPageFile,
  splitTitle,
  type NavItem,
  type FlatPage,
} from "./summary.mjs";
import {
  renderMarkdown,
  assetKey,
  type TocEntry,
  type AssetInfo,
} from "./markdown.mjs";

export interface Crumb {
  title: string;
  url: string;
  icon: string | null;
}

export interface PageLink {
  title: string;
  url: string;
}

export interface PageData {
  url: string;
  file: string;
  title: string;
  description: string | null;
  icon: string | null;
  cover: AssetInfo | null;
  coverY: number;
  coverSize: "full" | "hero";
  hidden: boolean;
  html: string;
  toc: TocEntry[];
  breadcrumbs: Crumb[];
  prev: PageLink | null;
  next: PageLink | null;
  lastUpdated: number | null;
}

export interface NavNode {
  title: string;
  url: string | null;
  href: string | null;
  icon: string | null;
  group?: boolean;
  children: NavNode[];
}

const siteDir = process.cwd();
const contentDir = path.resolve(siteDir, config.contentDir);

interface SiteIndex {
  tree: NavItem[];
  pages: FlatPage[];
  byUrl: Map<string, FlatPage>;
  frontmatter: Map<string, Record<string, unknown>>;
  assets: Record<string, AssetInfo>;
  meta: { pages: Record<string, number | null>; builtAt: number };
}

let cached: SiteIndex | null = null;

function readJson<T>(p: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function getSiteIndex(): SiteIndex {
  if (cached) return cached;
  const summary = fs.readFileSync(path.join(contentDir, "SUMMARY.md"), "utf8");
  const tree = parseSummary(summary);
  const pages = flattenPages(tree);
  const byUrl = new Map<string, FlatPage>();
  const frontmatter = new Map<string, Record<string, unknown>>();
  for (const p of pages) {
    byUrl.set(p.url!, p);
    frontmatter.set(p.file!, readPageFile(contentDir, p.file!).data);
  }
  cached = {
    tree,
    pages,
    byUrl,
    frontmatter,
    assets: readJson(path.join(siteDir, "generated", "assets.json"), {}),
    meta: readJson(path.join(siteDir, "generated", "meta.json"), {
      pages: {},
      builtAt: Math.floor(Date.now() / 1000),
    }),
  };
  return cached;
}

function isHidden(idx: SiteIndex, item: NavItem): boolean {
  return !!item.file && idx.frontmatter.get(item.file)?.hidden === true;
}

function iconOf(idx: SiteIndex, item: NavItem): string | null {
  const v = item.file ? idx.frontmatter.get(item.file)?.icon : null;
  return typeof v === "string" ? v : null;
}

/** Navigation tree for the sidebar (hidden pages removed). */
export function getNav(): NavNode[] {
  const idx = getSiteIndex();
  const walk = (items: NavItem[]): NavNode[] =>
    items
      .filter((i) => !isHidden(idx, i))
      .map((i) => ({
        title: i.title,
        url: i.url,
        href: i.href,
        icon: iconOf(idx, i),
        group: i.group,
        children: walk(i.children || []),
      }));
  return walk(idx.tree);
}

/** All page URLs (including hidden ones, which are reachable but unlisted). */
export function getAllUrls(): string[] {
  return getSiteIndex().pages.map((p) => p.url!);
}

function resolveLinkFactory(idx: SiteIndex) {
  return (u: string) => {
    let x = u
      .replace(/\/README\.md$/, "")
      .replace(/\.md$/, "")
      .replace(/\/+$/, "");
    if (x === "" || x === "/README") x = "/";
    if (!idx.byUrl.has(x) && idx.byUrl.has(x + "/README")) x = x + "/README";
    return x;
  };
}

export async function getPage(url: string): Promise<PageData | null> {
  const idx = getSiteIndex();
  const item = idx.byUrl.get(url);
  if (!item) return null;
  const { data, content } = readPageFile(contentDir, item.file!);
  const { title, body } = splitTitle(content);
  const pageDir = path.posix.dirname(item.file!.replace(/\\/g, "/"));
  const { html, toc } = await renderMarkdown({
    markdown: body,
    pageDir: pageDir === "." ? "" : pageDir,
    resolveAsset: (key) => idx.assets[key] || null,
    resolveLink: resolveLinkFactory(idx),
  });

  const visible = idx.pages.filter((p) => !isHidden(idx, p));
  const pos = visible.findIndex((p) => p.url === url);
  const prevItem = pos > 0 ? visible[pos - 1] : null;
  const nextItem =
    pos >= 0 && pos < visible.length - 1 ? visible[pos + 1] : null;
  const titleOf = (p: FlatPage) =>
    splitTitle(readPageFile(contentDir, p.file!).content).title || p.title;

  const coverKey = typeof data.cover === "string" ? assetKey(data.cover) : null;
  return {
    url,
    file: item.file!,
    title: title || item.title,
    description:
      typeof data.description === "string" ? data.description.trim() : null,
    icon: typeof data.icon === "string" ? data.icon : null,
    cover: coverKey ? idx.assets[coverKey] || null : null,
    coverY: typeof data.coverY === "number" ? data.coverY : 0,
    coverSize:
      (data.layout as { cover?: { size?: string } } | undefined)?.cover
        ?.size === "hero"
        ? "hero"
        : "full",
    hidden: data.hidden === true,
    html,
    toc,
    breadcrumbs: item.parents.map((p) => ({
      title: p.title,
      url: p.url!,
      icon: iconOf(idx, p),
    })),
    prev: prevItem ? { title: titleOf(prevItem), url: prevItem.url! } : null,
    next: nextItem ? { title: titleOf(nextItem), url: nextItem.url! } : null,
    lastUpdated: idx.meta.pages[item.file!] ?? null,
  };
}

export function getBuiltAt(): number {
  return getSiteIndex().meta.builtAt;
}
