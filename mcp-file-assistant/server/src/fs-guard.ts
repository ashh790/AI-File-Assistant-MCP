import path from "node:path";

// ponytail: single fixed root, no per-user roots — add a root registry if multi-tenant shows up.
const ROOT = path.resolve(process.env.MCP_FILE_ROOT ?? process.cwd());

/**
 * Resolves a user-supplied relative path against ROOT and throws if it
 * escapes the sandbox. This is the one trust boundary every tool must go
 * through before touching the filesystem.
 */
export function safeResolve(userPath: string): string {
  const resolved = path.resolve(ROOT, userPath);
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    throw new Error(`Path escapes sandbox root: ${userPath}`);
  }
  return resolved;
}

export { ROOT };
