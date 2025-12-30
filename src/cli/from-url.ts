import { generateWebMLFromUrl } from "../core/webml/generator.ts";

const url = process.argv[2];
if (!url) {
  console.error("Usage: npm run dev -- <url>");
  process.exit(1);
}

try {
  const doc = await generateWebMLFromUrl(url, "http");
  process.stdout.write(JSON.stringify(doc, null, 2) + "\n");
} catch (err) {
  console.error("Terra execution failed:");
  console.error(err);
  process.exit(1);
}
