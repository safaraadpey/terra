import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateWebMLFromUrl } from "../src/core/webml/generator.ts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = String(req.query.url || "").trim();
    if (!url) {
      return res.status(400).json({ error: "Missing ?url=" });
    }

    const doc = await generateWebMLFromUrl(url, "http");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).json(doc);
  } catch (err: any) {
    return res.status(500).json({
      error: "Terra webml failed",
      message: err?.message ?? String(err),
    });
  }
}
