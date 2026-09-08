export interface NavItem {
  title: string
  file: string | null
  url: string | null
  href: string | null
  group?: boolean
  children: NavItem[]
}
export interface FlatPage extends NavItem {
  parents: NavItem[]
}
export function urlForFile(file: string): string
export function parseSummary(text: string): NavItem[]
export function readPageFile(contentDir: string, file: string): { data: Record<string, unknown>; content: string; abs: string }
export function flattenPages(tree: NavItem[], parents?: NavItem[], out?: FlatPage[]): FlatPage[]
export function splitTitle(md: string): { title: string | null; body: string }
export function stripInlineMarkdown(s: string): string
