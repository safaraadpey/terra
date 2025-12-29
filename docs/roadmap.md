# Terra Roadmap

This roadmap defines the staged evolution of Terra from a semantic substrate into a fully operational environment for intelligent action.

Terra evolves by **stabilizing the ground first**, then enabling movement.

---

## Phase 0 — Foundation (Complete)

**Status:** ✅ Completed

Delivered:
- Public repository and project identity
- Canonical README
- WebML v1.0 specification
- Architecture definition (v0.1)
- First compliant WebML example

Outcome:
- Terra has a stable semantic contract
- External contributors can reason about outputs without code access

---

## Phase 1 — Minimal Generator (v0.1)

**Goal:** Produce real WebML v1.0 documents from a single URL

Scope:
- Fetch a single web page
- Normalize content
- Extract conservative entities, relations, and actions
- Emit spec-compliant WebML

Deliverables:
- `src/core/webml/generator.ts`
- CLI or API entry point
- One real-world example URL → WebML

Non-goals:
- Crawling
- Multi-page reasoning
- Autonomous behavior

---

## Phase 2 — Normalization & Extraction Quality (v0.2)

**Goal:** Improve semantic signal quality

Scope:
- Better boilerplate removal
- Section-aware normalization
- Richer action detection (forms, searches)
- Confidence scoring refinement

Deliverables:
- Improved Normalizer module
- Expanded entity and relation coverage

---

## Phase 3 — Semantic Linking (SemaLink) (v0.3)

**Goal:** Connect meaning across documents

Scope:
- Link entities across WebML documents
- Build navigable semantic graphs
- Optional lightweight indexing

Deliverables:
- SemaLink graph builder
- Cross-document relation model

---

## Phase 4 — Controlled Action Runtime (Actforge) (v0.4)

**Goal:** Enable safe, auditable execution

Scope:
- Sandbox action execution
- Explicit permission model
- Deterministic action outcomes

Deliverables:
- Actforge runtime
- Execution audit logs

---

## Guiding Principles

- No phase introduces behavior that the ground cannot support
- Every capability is explicit and auditable
- Intelligence is enabled, not assumed

Terra grows by strengthening its foundations before expanding its reach.

