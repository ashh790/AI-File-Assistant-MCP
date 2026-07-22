import { z } from "zod";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { safeResolve, ROOT } from "../fs-guard.js";

export const searchContentSchema = { query: z.string(), path: z.string().default(".") };

// ponytail: recursive readdir + substring match, no ripgrep binary — swap in if the tree gets huge.
export async function searchContent({ query, path: p }: { query: string; path: string }) {
  const startAbs = safeResolve(p);
  const results: { file: string; line: number; text: string }[] = [];

  async function walk(dir: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git") continue;
        await walk(abs);
      } else {
        const text = await readFile(abs, "utf-8").catch(() => null);
        if (text === null) continue;
        text.split("\n").forEach((line, i) => {
          if (line.includes(query)) {
            results.push({ file: path.relative(ROOT, abs), line: i + 1, text: line.trim() });
          }
        });
      }
    }
  }

  await walk(startAbs);
  return results;
}
