import type { NormalizedPage } from "./normalizer.js";
import type { WebMLAction, WebMLEntity, WebMLRelation, WebMLField } from "./webml/types.js";

function makeId(prefix: string, n: number) {
  return `${prefix}${n}`;
}

function mapFieldType(t: string): WebMLField["type"] {
  const x = t.toLowerCase();
  if (x === "number") return "number";
  if (x === "checkbox" || x === "radio") return "boolean";
  if (x === "select") return "select";
  if (x === "hidden") return "hidden";
  return "text";
}

export function extractSemantics(page: NormalizedPage, sourceUrl: string): {
  entities: WebMLEntity[];
  relations: WebMLRelation[];
  actions: WebMLAction[];
  confidence: number;
} {
  const entities: WebMLEntity[] = [];
  const relations: WebMLRelation[] = [];
  const actions: WebMLAction[] = [];

  // Entity: page as an "article" (minimal, safe)
  if (page.title) {
    entities.push({
      id: "e1",
      type: "article",
      name: page.title,
      attributes: { url: sourceUrl }
    });
  }

  // Actions: navigate for first N links (safe)
  const maxLinks = 10;
  page.links.slice(0, maxLinks).forEach((l, i) => {
    actions.push({
      id: makeId("a", actions.length + 1),
      type: "navigate",
      method: "GET",
      endpoint: l.href,
      fields: []
    });

    // optional: relation from page to link target (kept generic)
    if (entities.length > 0) {
      const linkEntId = makeId("e", entities.length + 1);
      entities.push({
        id: linkEntId,
        type: "resource",
        name: l.text || l.href,
        attributes: { url: l.href }
      });

      relations.push({
        from: entities[0]!.id,
        to: linkEntId,
        type: "references"
      });
    }
  });

  // Actions: forms → submit_form or search
  const maxForms = 5;
  page.forms.slice(0, maxForms).forEach((f) => {
    const inferredType =
      /search/i.test(f.action) || f.fields.some((x) => /search|q|query/i.test(x.name)) ? "search" : "submit_form";

    actions.push({
      id: makeId("a", actions.length + 1),
      type: inferredType,
      method: f.method as WebMLAction["method"],
      endpoint: f.action,
      fields: f.fields.slice(0, 15).map((fld) => ({
        name: fld.name,
        type: mapFieldType(fld.type),
        required: !!fld.required
      }))
    });
  });

  // confidence: conservative heuristic
  // title + some actions => higher; otherwise modest
  const confidence =
    (page.title ? 0.5 : 0.35) +
    (actions.length > 0 ? 0.2 : 0) +
    (page.content && page.content.length > 200 ? 0.15 : 0);

  return { entities, relations, actions, confidence: Math.min(0.95, Math.max(0.2, confidence)) };
}
