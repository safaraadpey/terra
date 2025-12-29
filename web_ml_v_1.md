# WebML v1.0 — Web Meaning Layer Specification

**Status:** Stable  
**Version:** 1.0  
**Owner:** Terra Project

---

## 1. Scope

WebML (Web Meaning Layer) is a machine-oriented document format for representing web pages as structured semantic data.

WebML defines **what a page contains** and **what can be done with it**, independent of visual layout, styling, or client-side behavior.

WebML is the canonical output format of Terra.

---

## 2. Design Constraints

WebML is designed with the following constraints:

- **Non-destructive:** Source pages are never modified.
- **Deterministic:** Identical input SHOULD yield structurally consistent output.
- **Presentation-agnostic:** CSS, layout, and visual hierarchy are ignored.
- **Execution-aware:** Executable capabilities are explicitly described.
- **Serializable:** Documents MUST be valid JSON.

---

## 3. Document Schema

A WebML v1.0 document MUST include all of the following top-level fields:

```json
{
  "source": {},
  "content": "",
  "entities": [],
  "relations": [],
  "actions": [],
  "metadata": {}
}
```

Omission of any required field renders the document non-compliant.

---

## 4. Source

Describes the origin of the extracted content.

```json
"source": {
  "url": "string",
  "retrieved_at": "ISO-8601 timestamp",
  "content_type": "html | json | text | pdf",
  "retrieval_method": "http | rendered | api"
}
```

---

## 5. Content

Normalized textual content of the page.

```json
"content": "string"
```

Rules:
- Scripts, advertisements, and UI chrome MUST be removed
- Reading order SHOULD be preserved

---

## 6. Entities

Entities represent discrete semantic objects detected in the page.

```json
{
  "id": "string",
  "type": "string",
  "name": "string",
  "attributes": {}
}
```

Requirements:
- `id` MUST be unique within the document
- `type` MUST be a lowercase string identifier
- `attributes` MUST be a JSON object

Common entity types (non-exhaustive):
- article
- product
- person
- organization
- location
- event
- service
- price

---

## 7. Relations

Relations define directed semantic links between entities.

```json
{
  "from": "entity_id",
  "to": "entity_id",
  "type": "string"
}
```

Constraints:
- `from` and `to` MUST reference valid entity IDs

---

## 8. Actions

Actions describe executable capabilities exposed by the page.

```json
{
  "id": "string",
  "type": "string",
  "method": "GET | POST | PUT | DELETE",
  "endpoint": "string",
  "fields": []
}
```

Actions describe **capability only**. Execution is outside the scope of WebML.

### 8.1 Fields

```json
{
  "name": "string",
  "type": "text | number | boolean | select | hidden",
  "required": true
}
```

---

## 9. Metadata

Contextual information about the document.

```json
{
  "title": "string",
  "language": "ISO-639 code",
  "confidence": "number (0–1)"
}
```

---

## 10. Minimal Valid Example

```json
{
  "source": {
    "url": "https://example.com",
    "retrieved_at": "2025-01-01T12:00:00Z",
    "content_type": "html",
    "retrieval_method": "rendered"
  },
  "content": "Example page content.",
  "entities": [
    {
      "id": "e1",
      "type": "article",
      "name": "Example Article",
      "attributes": {}
    }
  ],
  "relations": [],
  "actions": [],
  "metadata": {
    "title": "Example",
    "language": "en",
    "confidence": 0.8
  }
}
```

---

## 11. Versioning

WebML follows semantic versioning:
- All `1.x` versions are backward-compatible
- `2.0` may introduce breaking changes

---

## 12. Compliance

A document is WebML v1.0 compliant if:
- All required top-level fields are present
- Entity IDs are unique
- Relations reference valid entities
- JSON is syntactically valid

---

## 13. Explicit Non-Goals (v1.0)

The following are intentionally out of scope:
- Agent planning
- Cross-document reasoning
- Authentication handling
- State persistence

These concerns may be addressed in future versions.

