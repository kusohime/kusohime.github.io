import { getCollection } from "astro:content";
import { site } from "../config/site";

const SITE_URL = "https://yixincui.com";

function escapeXml(value: string | number | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function normalizedDate(value: string | number) {
  const raw = String(value);
  const match = raw.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
  if (!match) return new Date(raw);

  const [, year, month = "01", day = "01"] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

export async function GET() {
  const writings = (await getCollection("writings", ({ data }) => !data.draft))
    .sort(
      (a, b) =>
        normalizedDate(b.data.date).getTime() -
          normalizedDate(a.data.date).getTime() ||
        a.data.order - b.data.order,
    )
    .slice(0, 20);

  const items = writings
    .map((writing) => {
      const url = `${SITE_URL}/writings/${writing.data.slug}/`;
      const pubDate = normalizedDate(writing.data.date).toUTCString();

      return `
    <item>
      <title>${escapeXml(writing.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(writing.data.excerpt)}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)} Writings</title>
    <link>${SITE_URL}/writings/</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(site.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
