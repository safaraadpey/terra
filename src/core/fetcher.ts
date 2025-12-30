import * as cheerio from "cheerio";

export type NormalizedPage = {
  title: string | undefined;
  language: string | undefined;
  content: string;
  links: Array<{ href: string; text: string }>;
  forms: Array<{ action: string; method: string; fields: Array<{ name: string; type: string; required: boolean }> }>;
};

function cleanText(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

export function normalizeHtml(html: string, baseUrl: string): NormalizedPage {
  const $ = cheerio.load(html);

  // remove noisy elements
  $("script, style, noscript, svg, canvas, iframe, ads, nav, footer").remove();

  const title = cleanText($("title").first().text()) || undefined;
  const language = ($("html").attr("lang") || "").trim() || undefined;

  // grab main-ish text
  const bodyText = cleanText($("body").text());

  // collect links (actions later)
  const links: NormalizedPage["links"] = [];
  $("a[href]").each((_, a) => {
    const hrefRaw = String($(a).attr("href") || "").trim();
    if (!hrefRaw) return;

    // ignore mailto/tel/javascript
    if (/^(mailto:|tel:|javascript:)/i.test(hrefRaw)) return;

    let href = hrefRaw;
    try {
      href = new URL(hrefRaw, baseUrl).toString();
    } catch {
      // keep raw if URL fails
    }

    const text = cleanText($(a).text());
    links.push({ href, text });
  });

  // collect forms (action discovery)
  const forms: NormalizedPage["forms"] = [];
  $("form").each((_, f) => {
    const actionRaw = String($(f).attr("action") || "").trim();
    const methodRaw = String($(f).attr("method") || "GET").trim().toUpperCase();
    const method = ["GET", "POST", "PUT", "DELETE"].includes(methodRaw) ? methodRaw : "GET";

    let action = actionRaw || baseUrl;
    try {
      action = new URL(actionRaw || baseUrl, baseUrl).toString();
    } catch {}

    const fields: NormalizedPage["forms"][number]["fields"] = [];

    $(f)
      .find("input[name], select[name], textarea[name]")
      .each((_, el) => {
        const name = String($(el).attr("name") || "").trim();
        if (!name) return;

        const tag = el.tagName.toLowerCase();
        const inputType =
          tag === "input" ? String($(el).attr("type") || "text").toLowerCase() : tag;

        const required = $(el).attr("required") != null;

        fields.push({ name, type: inputType, required });
      });

    forms.push({ action, method, fields });
  });

  return {
    title,
    language,
    content: bodyText,
    links,
    forms
  };
}
