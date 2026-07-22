import { z } from "zod";
import { rename, rm } from "node:fs/promises";
import { safeResolve } from "../fs-guard.js";

export const moveFileSchema = { from: z.string(), to: z.string() };
export async function moveFile({ from, to }: { from: string; to: string }) {
  const fromAbs = safeResolve(from);
  const toAbs = safeResolve(to);
  await rename(fromAbs, toAbs);
  return { ok: true, from, to };
}

export const deleteFileSchema = { path: z.string() };
export async function deleteFile({ path: p }: { path: string }) {
  const abs = safeResolve(p);
  await rm(abs, { recursive: true, force: false });
  return { ok: true, path: p };
}
