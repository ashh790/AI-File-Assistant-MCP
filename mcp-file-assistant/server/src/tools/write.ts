import { z } from "zod";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { safeResolve } from "../fs-guard.js";

export const writeFileSchema = { path: z.string(), content: z.string() };
export async function writeFileTool({ path: p, content }: { path: string; content: string }) {
  const abs = safeResolve(p);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, content, "utf-8");
  return { ok: true, path: p };
}

// ponytail: exact find/replace, no fuzzy diff/patch lib — add one if edits start failing to match.
export const editFileSchema = { path: z.string(), find: z.string(), replace: z.string() };
export async function editFileTool({ path: p, find, replace }: { path: string; find: string; replace: string }) {
  const abs = safeResolve(p);
  const content = await readFile(abs, "utf-8");
  if (!content.includes(find)) throw new Error(`Text not found in ${p}`);
  await writeFile(abs, content.replace(find, replace), "utf-8");
  return { ok: true, path: p };
}
