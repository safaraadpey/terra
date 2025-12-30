import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateWebMLFromUrl } from "../src/core/webml/generator";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = (req.query.url as string) || "";
  if (!url) return res.status(400).json({ error: "Missing ?url=" });

  try {
    const doc = await generateWebMLFromUrl(url, "http");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).json(doc);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
}
