import { z } from "zod";
import { readFile, readdir, stat } from "node:fs/promises";
import { safeResolve } from "../fs-guard.js";

export const listDirSchema = { path: z.string().default(".") };
export async function listDir({ path: p }: { path: string }) {
  const abs = safeResolve(p);
  const entries = await readdir(abs, { withFileTypes: true });
  return entries.map((e) => ({ name: e.name, type: e.isDirectory() ? "dir" : "file" }));
}

export const readFileSchema = { path: z.string() };
export async function readFileTool({ path: p }: { path: string }) {
  const abs = safeResolve(p);
  const s = await stat(abs);
  if (!s.isFile()) throw new Error(`Not a file: ${p}`);
  return await readFile(abs, "utf-8");
}
