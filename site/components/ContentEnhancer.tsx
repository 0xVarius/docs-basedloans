"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const FILTER_MIN_ROWS = 12;

/** Adds a GitBook-style filter box above long tables. */
function enhanceTables() {
  for (const table of document.querySelectorAll<HTMLTableElement>(
    ".prose .table-wrap table",
  )) {
    const wrap = table.parentElement as HTMLElement;
    if (!wrap || wrap.dataset.filterReady) continue;
    const rows = Array.from(table.tBodies[0]?.rows || []);
    if (rows.length < FILTER_MIN_ROWS) continue;
    wrap.dataset.filterReady = "1";
    const box = document.createElement("label");
    box.className = "table-filter";
    box.innerHTML =
      '<svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376C296.3 401.1 253.9 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0 416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>' +
      '<input type="search" placeholder="Search" aria-label="Filter table rows" autocomplete="off" spellcheck="false" />' +
      '<span class="table-filter-count"></span>';
    const input = box.querySelector("input") as HTMLInputElement;
    const count = box.querySelector(".table-filter-count") as HTMLElement;
    const texts = rows.map((r) => r.textContent?.toLowerCase() || "");
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      rows.forEach((r, i) => {
        const hit = !q || texts[i].includes(q);
        r.hidden = !hit;
        if (hit) shown++;
      });
      count.textContent = q ? `${shown} of ${rows.length}` : "";
    });
    wrap.parentElement?.insertBefore(box, wrap);
  }
}

/** Adds click-to-zoom for content images and filter boxes for long tables. */
export function ContentEnhancer() {
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    enhanceTables();
  }, [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const img = t?.closest?.("img.zoomable") as HTMLImageElement | null;
      if (!img || img.closest("a")) return;
      e.preventDefault();
      setZoom({ src: img.currentSrc || img.src, alt: img.alt || "" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.classList.add("no-scroll");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("no-scroll");
    };
  }, [zoom]);
  if (!zoom) return null;
  return (
    <div
      className="zoom-overlay"
      onClick={() => setZoom(null)}
      role="dialog"
      aria-label="Image preview"
    >
      <img src={zoom.src} alt={zoom.alt} />
    </div>
  );
}
