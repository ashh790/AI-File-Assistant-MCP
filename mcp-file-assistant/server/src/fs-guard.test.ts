import assert from "node:assert";
import path from "node:path";
import { safeResolve, ROOT } from "./fs-guard.js";

// valid relative paths resolve inside ROOT
assert.strictEqual(safeResolve("a/b.txt"), path.join(ROOT, "a", "b.txt"));
assert.strictEqual(safeResolve("."), ROOT);

// traversal attempts are rejected
assert.throws(() => safeResolve("../outside.txt"));
assert.throws(() => safeResolve("a/../../outside.txt"));

console.log("fs-guard: all checks passed");
