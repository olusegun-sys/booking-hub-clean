#!/usr/bin/env node
/**
 * generate-image.js
 *
 * Calls the OpenAI Images API and saves the result(s) to disk.
 * Requires Node 18+ (uses the built-in fetch — no npm install needed).
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node generate-image.js \
 *     --prompt "a matte black skincare bottle on terracotta, studio lighting" \
 *     --out ./src/assets/bottle.png \
 *     --size 1024x1024 \
 *     --quality medium \
 *     --n 1
 *
 * Flags:
 *   --prompt   (required) the image description
 *   --out      (required) output file path. If --n > 1, files are numbered:
 *              bottle.png -> bottle-1.png, bottle-2.png, ...
 *   --size     auto | 1024x1024 | 1024x1536 | 1536x1024   (default: 1024x1024)
 *   --quality  auto | low | medium | high                  (default: medium)
 *   --n        number of images, 1-4                       (default: 1)
 *
 * The API key is read ONLY from the OPENAI_API_KEY environment variable.
 * It is never written to disk, logged, or hardcoded — set it in your shell
 * profile or an untracked .env file loaded by your own tooling.
 */

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = { size: "1024x1024", quality: "medium", n: 1 };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2);
    const value = argv[i + 1];
    args[name] = value;
    i++;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.prompt) {
    console.error("Error: --prompt is required.");
    process.exit(1);
  }
  if (!args.out) {
    console.error("Error: --out is required (output file path).");
    process.exit(1);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error(
      "Error: OPENAI_API_KEY environment variable is not set.\n" +
      "Set it in your shell (export OPENAI_API_KEY=sk-...) before running this script."
    );
    process.exit(1);
  }

  const n = Math.max(1, Math.min(4, parseInt(args.n, 10) || 1));

  console.log(`Generating ${n} image(s) for prompt: "${args.prompt}"`);

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: args.prompt,
      size: args.size,
      quality: args.quality,
      n,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || `Request failed with status ${res.status}`;
    console.error("OpenAI API error:", msg);
    process.exit(1);
  }

  const images = (data.data || []).map((item) => item.b64_json).filter(Boolean);
  if (!images.length) {
    console.error("No images returned. Check your prompt and OpenAI account access.");
    process.exit(1);
  }

  const outDir = path.dirname(args.out);
  if (outDir && !fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const ext = path.extname(args.out) || ".png";
  const base = args.out.slice(0, args.out.length - ext.length);

  images.forEach((b64, i) => {
    const filePath = images.length === 1 ? args.out : `${base}-${i + 1}${ext}`;
    fs.writeFileSync(filePath, Buffer.from(b64, "base64"));
    console.log(`Saved: ${filePath}`);
  });
}

main().catch((err) => {
  console.error("Unexpected error:", err.message);
  process.exit(1);
});
