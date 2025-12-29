# Terra Architecture (v0.1)

Terra is a semantic substrate that converts human-centric web surfaces into WebML v1.0 documents.
This document describes the v0.1 architecture: the minimal, auditable pipeline required to produce WebML.

---

## 1. High-Level Pipeline

Terra v0.1 is a single-page semantic extraction pipeline:

1. **Fetch** — retrieve the page (HTTP or rendered)
2. **Normalize** — strip noise and convert to clean text + structure
3. **Extract** — detect entities, relations, and actions
4. **Assemble** — emit a WebML v1.0 document
5. **Serve** — expose WebML via a minimal API

The output is deterministic and spec-compliant: `docs/webml-v1.md`.

---

## 2. System Boundaries (v0.1)

### In scope
- Single URL input → single WebML output
- HTML/text normalization
- Lightweight semantic extraction
- Action discovery from links/forms
- Minimal API surface

### Out of scope (intentionally)
- Large-scale crawling
- Multi-page reasoning
- Authentication/session flows
- Autonomous planning and execution
- Persistent memory and indexing

Terra v0.1 focuses on **truthful structure**, not “smart behavior”.

---

## 3. Core Modules

### 3.1 Fetcher
**Responsibility:** Retrieve source content reliably.

Inputs:
- `url`

Outputs:
- raw payload (HTML/text/JSON)
- retrieval metadata (content-type, timestamps)

Modes:
- `http` — direct request
- `rendered` — headless rendering when needed (later; optional)

---

### 3.2 Normalizer
**Responsibility:** Convert raw content into clean, machine-usable text and structure.

Typical steps:
- remove scripts, ads, nav chrome
- collapse whitespace
- preserve reading order
- extract page title
- extract candidate sections/headings (best-effort)

Outputs:
- `content` (normalized text)
- structural hints (optional, internal)

---

### 3.3 Extractor
**Responsibility:** Produce semantic primitives for WebML.

Produces:
- `entities[]` — detected objects (product, person, article, etc.)
- `relations[]` — directed links between entities
- `actions[]` — capabilities (forms, searches, downloads, navigations)

Notes:
- v0.1 extraction is conservative.
- Confidence scores SHOULD reflect uncertainty.
- If unsure, prefer fewer entities over hallucinated structure.

---

### 3.4 WebML Assembler
**Responsibility:** Merge outputs into a valid WebML v1.0 document.

Guarantees:
- required top-level fields exist
- entity ids are unique
- relations reference valid entities
- JSON is syntactically valid

---

## 4. Minimal API Surface (v0.1)

Terra exposes a simple interface:

### `POST /webml/from-url`
Input:
```json
{ "url": "https://..." }
```

Output:
- WebML v1.0 JSON document

Optional query params (future-safe):
- `mode=http|rendered`
- `include=actions|relations|entities`

---

## 5. Trust & Auditability

Terra prioritizes auditability:
- outputs are spec-bounded (WebML v1.0)
- confidence scores indicate uncertainty
- extraction remains conservative
- future “Act” runtimes must be sandboxed and explicit

---

## 6. Roadmap Anchors

- **v0.1**: URL → WebML (single page)
- **v0.2**: better normalization + richer action discovery
- **v0.3**: optional indexing + graph building (SemaLink)
- **v0.4**: controlled execution runtime (Actforge)

Terra evolves by strengthening the ground first, then enabling movement.

