// src/core/webml/generator.ts
import * as cheerio from "cheerio";

export type WebMLMode = "http" | "file";

export type WebMLTextBlock = {
  kind: "paragraph" | "heading" | "list_item";
  text: string;
};

export type WebMLDocumentV01 = {
  kind: "webml";
  version: "0.1";
  source: { url: string; mode: WebMLMode; fetchedAt: string };
  title: string | null;

  // Agent-ready
  text: string | null;               // خلاصه‌ی یک‌تکه (برای سازگاری)
  text_blocks: WebMLTextBlock[];      // متن بلوکی
  links: Array<{ href: string; text?: string | null }>;
  content_links: Array<{ href: string; text?: string | null }>;

  actions: Array<{
    type: "navigate" | "open" | "submit";
    label?: string | null;
    target?: string | null;
    payload?: Record<string, unknown>;
  }>;
};

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "user-agent": "Terra-WebML/0.1 (+https://github.com/your-org/terra)" }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} while fetching: ${url}`);
  return await res.text();
}

function cleanText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function absolutizeUrl(baseUrl: string, href: string): string {
  try { return new URL(href, baseUrl).toString(); } catch { return href; }
}

function pickContentRoot($: cheerio.CheerioAPI, url: string): cheerio.Cheerio<cheerio.Element> {
  const host = (() => { try { return new URL(url).hostname; } catch { return ""; } })();

  // Wikipedia profile (خیلی تمیزتر از main/body)
  if (host.endsWith("wikipedia.org")) {
    const mw = $("#mw-content-text");
    if (mw.length) return mw;
  }

  // Generic profile
  const candidates = ["main", "article", "#content", ".content", ".main", "body"];
  for (const sel of candidates) {
    const node = $(sel).first();
    if (node.length) return node;
  }
  return $("body");
}

function dropNoise($: cheerio.CheerioAPI, root: cheerio.Cheerio<cheerio.Element>) {
  // حذف اسکریپت/استایل/ناوبری/فوتر و چیزهای پرت
  root.find("script, style, noscript, svg, canvas, iframe").remove();
  root.find("header, footer, nav, aside").remove();

  // Wikipedia-specific noise
  root.find(".mw-editsection, .reference, .reflist, .navbox, .metadata, .infobox, .toc").remove();
}

function extractBlocks($: cheerio.CheerioAPI, root: cheerio.Cheerio<cheerio.Element>): WebMLTextBlock[] {
  const blocks: WebMLTextBlock[] = [];

  // headings
  root.find("h1,h2,h3").each((_, el) => {
    const t = cleanText($(el).text() || "");
    if (t) blocks.push({ kind: "heading", text: t });
  });

  // paragraphs
  root.find("p").each((_, el) => {
    const t = cleanText($(el).text() || "");
    if (t && t.length >= 40) blocks.push({ kind: "paragraph", text: t });
  });

  // list items
  root.find("li").each((_, el) => {
    const t = cleanText($(el).text() || "");
    if (t && t.length >= 30) blocks.push({ kind: "list_item", text: t });
  });

  // سقف برای اینکه خروجی منفجر نشه
  return blocks.slice(0, 200);
}

function extractLinks(
  $: cheerio.CheerioAPI,
  baseUrl: string,
  scope: cheerio.Cheerio<cheerio.Element>
): Array<{ href: string; text?: string | null }> {
  const map = new Map<string, { href: string; text?: string | null }>();

  scope.find("a[href]").each((_, el) => {
    const hrefRaw = String($(el).attr("href") || "").trim();
    if (!hrefRaw) return;

    if (hrefRaw.startsWith("#")) return;
    if (hrefRaw.startsWith("javascript:")) return;
    if (hrefRaw.startsWith("mailto:")) return;
    if (hrefRaw.startsWith("tel:")) return;

    const href = absolutizeUrl(baseUrl, hrefRaw);
    const t = cleanText($(el).text() || "");
    if (!map.has(href)) map.set(href, { href, text: t || null });
  });

  return Array.from(map.values());
}

export async function generateWebMLFromUrl(
  url: string,
  mode: WebMLMode = "http"
): Promise<WebMLDocumentV01> {
  if (!url || typeof url !== "string") throw new Error("generateWebMLFromUrl: url must be a non-empty string");
  if (mode !== "http") throw new Error(`generateWebMLFromUrl: mode "${mode}" not implemented yet`);

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const title = cleanText($("title").first().text() || "") || null;

  // Root انتخاب + پاکسازی
  const root = pickContentRoot($, url).clone();
  dropNoise($, root);

  // text blocks
  const text_blocks = extractBlocks($, root);
  const text = text_blocks
    .filter(b => b.kind === "paragraph")
    .slice(0, 8)
    .map(b => b.text)
    .join("\n\n") || null;

  // links: کل صفحه vs فقط محتوا
  const links = extractLinks($, url, $("body")).slice(0, 400);
  const content_links = extractLinks($, url, root).slice(0, 200);

  return {
    kind: "webml",
    version: "0.1",
    source: { url, mode, fetchedAt: new Date().toISOString() },
    title,
    text,
    text_blocks,
    links,
    content_links,
    actions: [{ type: "navigate", label: "Open source URL", target: url }]
  };
}
