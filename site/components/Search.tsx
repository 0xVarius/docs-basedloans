"use client";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import MiniSearch, { type SearchResult } from "minisearch";
import {
  faMagnifyingGlass,
  faXmark,
  faChevronRight,
  faFileLines,
  faArrowTurnDown,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { FaIcon } from "./FaIcon";
import { useUi } from "./UiProvider";

interface Entry {
  id: string;
  url: string;
  title: string;
  crumbs: string[];
  description: string;
  heading: string;
  text: string;
}

type Hit = SearchResult & Entry;

let indexPromise: Promise<MiniSearch<Entry>> | null = null;
function loadIndex(): Promise<MiniSearch<Entry>> {
  if (!indexPromise) {
    indexPromise = fetch("/search-index.json")
      .then((r) => r.json())
      .then((entries: Entry[]) => {
        const ms = new MiniSearch<Entry>({
          fields: ["title", "heading", "description", "text", "crumbs"],
          storeFields: [
            "url",
            "title",
            "crumbs",
            "description",
            "heading",
            "text",
          ],
          extractField: (doc, field) => {
            const v = (doc as unknown as Record<string, unknown>)[field];
            return Array.isArray(v) ? v.join(" › ") : (v as string);
          },
          searchOptions: {
            boost: { title: 5, heading: 3, description: 2, crumbs: 1 },
            prefix: true,
            fuzzy: 0.15,
            combineWith: "AND",
          },
        });
        ms.addAll(entries);
        return ms;
      });
  }
  return indexPromise;
}

function crumbsOf(hit: Hit): string[] {
  const c = hit.crumbs as unknown;
  if (Array.isArray(c)) return c;
  if (typeof c === "string" && c) return c.split(" › ");
  return [];
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, terms: string[]): ReactNode {
  if (!terms.length || !text) return text;
  const re = new RegExp(`(${terms.map(escapeRe).join("|")})`, "ig");
  const parts = text.split(re);
  return parts.map((p, i) => (i % 2 === 1 ? <mark key={i}>{p}</mark> : p));
}

function snippet(hit: Hit, terms: string[]): string {
  const candidates = [hit.description, hit.text];
  for (const c of candidates) {
    if (!c) continue;
    const lower = c.toLowerCase();
    let idx = -1;
    for (const t of terms) {
      const i = lower.indexOf(t.toLowerCase());
      if (i !== -1 && (idx === -1 || i < idx)) idx = i;
    }
    if (idx !== -1) {
      const start = Math.max(0, idx - 40);
      const end = Math.min(c.length, idx + 110);
      return (
        (start > 0 ? "…" : "") +
        c.slice(start, end).trim() +
        (end < c.length ? "…" : "")
      );
    }
  }
  return (hit.description || hit.text || "").slice(0, 140);
}

export function Search() {
  const { searchOpen, setSearchOpen } = useUi();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [selected, setSelected] = useState(0);
  const [ready, setReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [anchor, setAnchor] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    right: number;
  } | null>(null);

  // Anchor the open input and the results to the trigger's own position (desktop only).
  useLayoutEffect(() => {
    if (!searchOpen) return;
    const measure = () => {
      const el = triggerRef.current;
      if (!el || window.innerWidth < 768) {
        setAnchor(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setAnchor({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        right: window.innerWidth - r.right,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    setQuery("");
    setHits([]);
    setSelected(0);
    loadIndex().then(() => setReady(true));
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    let cancelled = false;
    const q = query.trim();
    if (!q) {
      setHits([]);
      return;
    }
    loadIndex().then((ms) => {
      if (cancelled) return;
      const results = ms.search(q) as Hit[];
      const seen = new Set<string>();
      const out: Hit[] = [];
      for (const r of results) {
        if (seen.has(r.url)) continue;
        seen.add(r.url);
        out.push(r);
        if (out.length >= 12) break;
      }
      setHits(out);
      setSelected(0);
    });
    return () => {
      cancelled = true;
    };
  }, [query, searchOpen]);

  const terms = useMemo(
    () =>
      query
        .trim()
        .split(/\s+/)
        .filter((t) => t.length > 1),
    [query],
  );

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${selected}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const go = (hit: Hit) => {
    setSearchOpen(false);
    router.push(hit.url);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(hits.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(0, s - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (hits[selected]) go(hits[selected]);
    }
  };

  const boxStyle: CSSProperties | undefined = anchor
    ? {
        top: anchor.top,
        left: anchor.left,
        width: anchor.width,
        height: anchor.height,
        right: "auto",
      }
    : undefined;
  const resultsStyle: CSSProperties | undefined = anchor
    ? { top: anchor.top + anchor.height + 8, right: anchor.right, left: "auto" }
    : undefined;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="search-trigger"
        aria-label="Search"
        aria-expanded={searchOpen}
        onClick={() => setSearchOpen(true)}
      >
        <FaIcon icon={faMagnifyingGlass} />
        <span className="search-label">Search…</span>
        <span className="search-kbd" aria-hidden="true">
          <kbd>Ctrl</kbd>
          <kbd>K</kbd>
        </span>
      </button>
      {searchOpen && typeof document !== "undefined"
        ? createPortal(
            <>
              <div
                className="search-overlay"
                onClick={() => setSearchOpen(false)}
                aria-hidden="true"
              />
              <div className="search-box" role="search" style={boxStyle}>
                <FaIcon icon={faMagnifyingGlass} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  placeholder="Search…"
                  aria-label="Search"
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                />
                {query ? (
                  <>
                    {ready ? (
                      <span className="search-count">
                        {hits.length} result{hits.length === 1 ? "" : "s"}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className="search-clear"
                      aria-label="Clear"
                      onClick={() => setQuery("")}
                    >
                      <FaIcon icon={faXmark} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="search-clear"
                    aria-label="Close"
                    onClick={() => setSearchOpen(false)}
                  >
                    <FaIcon icon={faXmark} />
                  </button>
                )}
              </div>
              {query.trim() ? (
                <div
                  className="search-results"
                  role="listbox"
                  aria-label="Search results"
                  style={resultsStyle}
                >
                  {hits.length ? (
                    <ul className="search-list" ref={listRef}>
                      {hits.map((hit, i) => (
                        <li
                          key={hit.id}
                          className="search-item"
                          role="option"
                          aria-selected={i === selected}
                          data-index={i}
                        >
                          <a
                            href={hit.url}
                            onMouseEnter={() => setSelected(i)}
                            onClick={(e) => {
                              e.preventDefault();
                              go(hit);
                            }}
                          >
                            <span className="search-item-icon">
                              <FaIcon icon={faFileLines} />
                            </span>
                            <span className="search-item-main">
                              {crumbsOf(hit).length ? (
                                <span className="search-item-crumbs">
                                  {crumbsOf(hit).map((c, j) => (
                                    <span
                                      key={j}
                                      style={{ display: "contents" }}
                                    >
                                      {j > 0 ? (
                                        <FaIcon icon={faChevronRight} />
                                      ) : null}
                                      <span>{c}</span>
                                    </span>
                                  ))}
                                </span>
                              ) : null}
                              <span className="search-item-title">
                                {highlight(hit.title, terms)}
                                {hit.heading && hit.heading !== hit.title ? (
                                  <> · {highlight(hit.heading, terms)}</>
                                ) : null}
                              </span>
                              <span className="search-item-snippet">
                                {highlight(snippet(hit, terms), terms)}
                              </span>
                            </span>
                            <span className="search-item-go" aria-hidden="true">
                              <FaIcon
                                icon={
                                  i === selected
                                    ? faArrowTurnDown
                                    : faChevronRight
                                }
                              />
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="search-empty">
                      {ready ? `No results for “${query.trim()}”` : "Loading…"}
                    </div>
                  )}
                  <div className="search-foot">
                    <kbd aria-label="Up">
                      <FaIcon icon={faArrowUp} />
                    </kbd>
                    <kbd aria-label="Down">
                      <FaIcon icon={faArrowDown} />
                    </kbd>
                    <span>Navigate</span>
                    <kbd>ESC</kbd>
                    <span>Close</span>
                  </div>
                </div>
              ) : null}
            </>,
            document.body,
          )
        : null}
    </>
  );
}
