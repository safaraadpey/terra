import { fetchUrl } from "../fetcher.js";
import { normalizeHtml } from "../normalizer.js";
import { extractSemantics } from "../extractor.js";
import type { WebMLDocument, ContentType, RetrievalMethod } from "./types.js";

function isoNow() {
  return new Date().toISOString();
}

function detectContentType(ctHeader: string): ContentType {
  const ct = ctHeader.toLowerCase();
  if (ct.includes("text/html")) return "html";
  if (ct.includes("application/json")) return "json";
  if (ct.includes("text/plain")) return "text";
  if (ct.includes("application/pdf")) return "pdf";
  return "text";
}

export async function generateWebMLFromUrl(url: string, mode: RetrievalMethod = "http"): Promise<WebMLDocument> {
  // v0.1: mode is reserved (http now; rendered later)
  const fetched = await fetchUrl(url);
  const content_type = detectContentType(fetched.contentType);

  if (content_type !== "html") {
    // v0.1 minimal: handle non-html as plain text content
    return {
      source: {
        url: fetched.url,
        retrieved_at: isoNow(),
        content_type,
        retrieval_method: mode
      },
      content: fetched.text.trim(),
      entities: [],
      relations: [],
      actions: [],
      metadata: {
        title: undefined,
        language: undefined,
        confidence: 0.3
      }
    };
  }

  const page = normalizeHtml(fetched.text, fetched.url);
  const extracted = extractSemantics(page, fetched.url);

  const doc: WebMLDocument = {
    source: {
      url: fetched.url,
      retrieved_at: isoNow(),
      content_type: "html",
      retrieval_method: mode
    },
    content: page.content,
    entities: extracted.entities,
    relations: extracted.relations,
    actions: extracted.actions,
    metadata: {
      title: page.title,
      language: page.language,
      confidence: extracted.confidence
    }
  };

  // minimal compliance guards
  // ensure required arrays exist (already) and ids are unique-ish
  // (v0.1: keep simple; validator can come later)
  return doc;
}
