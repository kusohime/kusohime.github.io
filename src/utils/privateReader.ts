import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseFrontmatter } from "@astrojs/markdown-remark";

export interface PrivateReaderArticle {
  slug: string;
  order: number;
  title: string;
  titleOriginal: string;
  author: string;
  source: string;
  sourcePdf: string;
  translatorNote?: string;
  content: string;
}

export interface PrivateReaderSummary {
  slug: string;
  order: number;
  title: string;
  titleOriginal: string;
  author: string;
}

const privateReaderRoot = path.resolve(
  process.cwd(),
  "private-reading",
  "articles",
);

function stringField(
  frontmatter: Record<string, unknown>,
  key: string,
  sourceFile: string,
) {
  const value = frontmatter[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${sourceFile}: frontmatter field "${key}" is required`);
  }
  return value.trim();
}

export async function loadPrivateReaderArticles(): Promise<
  PrivateReaderArticle[]
> {
  const filenames = (await readdir(privateReaderRoot)).filter((filename) =>
    filename.endsWith(".md"),
  );

  const articles = await Promise.all(
    filenames.map(async (filename) => {
      const sourceFile = path.join(privateReaderRoot, filename);
      const source = await readFile(sourceFile, "utf8");
      const parsed = parseFrontmatter(source);
      const slug = stringField(parsed.frontmatter, "slug", filename);
      const sourcePdf = path.resolve(
        stringField(parsed.frontmatter, "sourcePdf", filename),
      );

      if (path.extname(sourcePdf).toLowerCase() !== ".pdf") {
        throw new Error(`${filename}: sourcePdf must point to a PDF`);
      }

      return {
        slug,
        order:
          typeof parsed.frontmatter.order === "number"
            ? parsed.frontmatter.order
            : 999,
        title: stringField(parsed.frontmatter, "title", filename),
        titleOriginal: stringField(
          parsed.frontmatter,
          "titleOriginal",
          filename,
        ),
        author: stringField(parsed.frontmatter, "author", filename),
        source: stringField(parsed.frontmatter, "source", filename),
        sourcePdf,
        translatorNote:
          typeof parsed.frontmatter.translatorNote === "string"
            ? parsed.frontmatter.translatorNote.trim()
            : undefined,
        content: parsed.content,
      } satisfies PrivateReaderArticle;
    }),
  );

  return articles.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

export function privateReaderSummaries(
  articles: PrivateReaderArticle[],
): PrivateReaderSummary[] {
  return articles.map(({ slug, order, title, titleOriginal, author }) => ({
    slug,
    order,
    title,
    titleOriginal,
    author,
  }));
}
