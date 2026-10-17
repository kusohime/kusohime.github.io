import { readFile } from "node:fs/promises";
import {
  loadPrivateReaderArticles,
  type PrivateReaderArticle,
} from "../../../utils/privateReader";

export async function getStaticPaths() {
  if (!import.meta.env.DEV) return [];

  const articles = await loadPrivateReaderArticles();
  return articles.map((article) => ({
    params: { slug: article.slug },
    props: { article },
  }));
}

export async function GET({ props }: { props: { article: PrivateReaderArticle } }) {
  if (!import.meta.env.DEV) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = await readFile(props.article.sourcePdf);
  const safeName = `${props.article.slug}.pdf`;

  return new Response(bytes, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `inline; filename="${safeName}"`,
      "Content-Type": "application/pdf",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}
