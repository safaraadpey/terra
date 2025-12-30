# Terra Whitepaper (v0.1)

## TL;DR
Terra is the foundational semantic substrate that transforms the human-centric web into a structured, meaningful, and directly executable environment for intelligent agents.

## Problem
The modern web is optimized for humans: visual layout, implicit meaning, dynamic UI, and interaction patterns that are hard for agents to reliably parse and act on.
As a result, agents either:
- guess via brittle scraping, or
- require site-by-site integrations.

Both approaches don’t scale.

## Core Idea
Terra introduces a **semantic ground layer** beneath the web:
- It **fetches** and **normalizes** web content.
- It **extracts meaning** into a machine-readable document format (WebML).
- It optionally exposes **actions** (links, forms, navigation targets) in a controlled way.

So agents can read and act on the web without the web being rebuilt for them.

## Key Concepts
- **WebML**: a compact, structured representation of a page (text blocks, links, actions, metadata).
- **Profiles**: site-aware extraction rules (e.g., Wikipedia) to remove noise and isolate main content.
- **Action surface**: a minimal “things you can do here” layer (navigate, open, submit).

## Non-Goals (for v0.1)
- Large-scale crawling
- Fully autonomous agents
- Multi-step planning
- “Browser replacement”

## Architecture (High-level)
1. Input URL
2. Fetch HTML
3. Content root selection (profiles)
4. Noise removal
5. Extract: title, text blocks, links, content links
6. Output: WebML JSON

## Why This Matters
Terra makes the web:
- **legible** to agents (meaning over markup),
- **portable** (one format across sites),
- **auditable** (structured, inspectable output),
- and eventually **executable** (action surface).

## Roadmap (Sketch)
- v0.1: Fetch + normalize + WebML output
- v0.2: Better cleaning + readability + markdown/html-to-blocks
- v0.3: Forms and action extraction (submit/search)
- v0.4: Deterministic pipelines + test fixtures
- v1.0: Stable spec + plugin profiles + hosted API

---
License: Apache-2.0
