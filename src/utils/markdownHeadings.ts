import MarkdownIt from "markdown-it";

export interface MarkdownHeading {
  id: string;
  text: string;
  level: number;
}

const headingParser = new MarkdownIt({
  html: true,
  linkify: true,
});

export function normalizeHeadingText(text: string) {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[\*_~`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function createHeadingId(text: string, index: number) {
  const normalizedText = normalizeHeadingText(text);
  const slug = normalizedText
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "heading"}-${index + 1}`;
}

export function extractMarkdownHeadings(markdown: string): MarkdownHeading[] {
  if (!markdown.trim()) return [];

  const tokens = headingParser.parse(markdown, {});
  const headings: MarkdownHeading[] = [];
  let headingIndex = 0;

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (token?.type !== "heading_open") continue;

    const level = Number(token.tag.slice(1));
    const inlineToken = tokens[index + 1];
    const rawText = inlineToken?.type === "inline" ? inlineToken.content : "";
    const text = normalizeHeadingText(rawText) || `标题 ${headingIndex + 1}`;
    const heading = {
      id: createHeadingId(rawText, headingIndex),
      text,
      level,
    };

    if (level <= 3) {
      headings.push(heading);
    }

    headingIndex++;
  }

  return headings;
}
