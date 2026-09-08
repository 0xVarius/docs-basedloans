import type { Metadata } from "next";
import { notFound } from "next/navigation";
import config from "@/site.config.mjs";
import { getAllUrls, getBuiltAt, getPage } from "@/lib/content";
import { getIcon } from "@/lib/icons";
import { Icon } from "@/components/Icon";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PrevNext } from "@/components/PrevNext";
import { LastUpdated } from "@/components/LastUpdated";
import { PageToc } from "@/components/PageToc";
import { TocButton } from "@/components/TocButton";

export const dynamicParams = false;

type Params = { slug?: string[] };

export function generateStaticParams(): Params[] {
  return getAllUrls().map((u) => ({
    slug: u === "/" ? [] : u.slice(1).split("/"),
  }));
}

function urlFrom(slug?: string[]) {
  return "/" + (slug || []).join("/");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(urlFrom(slug));
  if (!page) return {};
  const url = page.url;
  return {
    title:
      url === "/" ? { absolute: `${page.title} | ${config.name}` } : page.title,
    description: page.description ?? undefined,
    alternates: { canonical: url },
    robots: page.hidden ? { index: false, follow: true } : undefined,
    openGraph: {
      title: page.title,
      description: page.description ?? undefined,
      url,
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const page = await getPage(urlFrom(slug));
  if (!page) notFound();
  const icon = getIcon(page.icon);
  return (
    <div className="page-wrap">
      {page.cover && page.coverSize === "full" ? (
        <div
          className="page-cover"
          style={{ "--cover-y": `${-page.coverY}px` } as React.CSSProperties}
        >
          <img
            src={page.cover.src}
            width={page.cover.width}
            height={page.cover.height}
            alt=""
            fetchPriority="high"
          />
        </div>
      ) : null}
      <div className="page-columns">
        <main className="page">
          <div className="page-body">
            {page.cover && page.coverSize === "hero" ? (
              <div
                className="page-cover hero"
                style={
                  { "--cover-y": `${-page.coverY}px` } as React.CSSProperties
                }
              >
                <img
                  src={page.cover.src}
                  width={page.cover.width}
                  height={page.cover.height}
                  alt=""
                  fetchPriority="high"
                />
              </div>
            ) : null}
            <header className="page-header">
              {page.toc.length ? (
                <div className="page-actions">
                  <TocButton />
                </div>
              ) : null}
              <Breadcrumbs crumbs={page.breadcrumbs} />
              <h1 className="page-title">
                {icon ? <Icon def={icon} className="page-icon" /> : null}
                <span>{page.title}</span>
              </h1>
              {page.description ? (
                <p className="page-desc">{page.description}</p>
              ) : null}
            </header>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: page.html }}
            />
          </div>
          <PrevNext prev={page.prev} next={page.next} />
          <LastUpdated ts={page.lastUpdated} builtAt={getBuiltAt()} />
        </main>
        <PageToc headings={page.toc} />
      </div>
    </div>
  );
}
