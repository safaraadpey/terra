// src/core/webml/generator.ts
import * as cheerio from "cheerio";

export type WebMLMode = "http" | "file";

export type WebMLDocumentV01 = {
  kind: "webml";
  version: "0.1";
  source: { url: string; mode: WebMLMode; fetchedAt: string };
  title: string | null;
  text: string | null;
  links: Array<{ href: string; text?: string | null }>;
  actions: Array<{
    type: "navigate" | "open" | "submit";
    label?: string | null;
    target?: string | null;
    payload?: Record<string, unknown>;
  }>;
};

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "user-agent": "Terra-WebML/0.1 (+https://github.com/your-org/terra)"
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} while fetching: ${url}`);
  return await res.text();
}

function absolutizeUrl(baseUrl: string, href: string): string {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}

function cleanText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export async function generateWebMLFromUrl(
  url: string,
  mode: WebMLMode = "http"
): Promise<WebMLDocumentV01> {
  if (!url || typeof url !== "string") {
    throw new Error("generateWebMLFromUrl: url must be a non-empty string");
  }
  if (mode !== "http") {
    throw new Error(`generateWebMLFromUrl: mode "${mode}" not implemented yet`);
  }

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  // title
  const title = cleanText($("title").first().text() || "") || null;

  // --- TEXT (minimum viable): prefer <main>, fallback to body
  const $main = $("main").first();
  const rawText = $main.length ? $main.text() : $("body").text();
  const text = cleanText(rawText).slice(0, 20000) || null; // سقف برای اینکه خروجی غول نشه

  // --- LINKS: collect, normalize, dedupe
  const linkMap = new Map<string, { href: string; text?: string | null }>();
  $("a[href]").each((_, el) => {
    const hrefRaw = String($(el).attr("href") || "").trim();
    if (!hrefRaw) return;

    // حذف لینک‌های بی‌ربط/غیرقابل ناوبری
    if (hrefRaw.startsWith("#")) return;
    if (hrefRaw.startsWith("javascript:")) return;
    if (hrefRaw.startsWith("mailto:")) return;
    if (hrefRaw.startsWith("tel:")) return;

    const href = absolutizeUrl(url, hrefRaw);
    const t = cleanText($(el).text() || "");
    if (!linkMap.has(href)) linkMap.set(href, { href, text: t || null });
  });

  const links = Array.from(linkMap.values()).slice(0, 300); // سقف لینک‌ها

  const out: WebMLDocumentV01 = {
    kind: "webml",
    version: "0.1",
    source: { url, mode, fetchedAt: new Date().toISOString() },
    title,
    text,
    links,
    actions: [
      { type: "navigate", label: "Open source URL", target: url }
    ]
  };

  return out;
}
