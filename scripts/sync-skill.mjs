import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destination = join(root, "skills/510/runtime");
const check = process.argv.includes("--check");
const roots = ["src", "guides", "toolchain/package.json", "toolchain/bun.lock"];

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "node_modules" || entry.name.startsWith(".run-") || entry.name === ".cache") return [];
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return files(path);
    return entry.name.endsWith(".test.ts") ? [] : [path];
  });
}

const expected = roots.flatMap((path) => path.includes(".") ? [path] : files(join(root, path)).map((file) => relative(root, file))).sort();
if (check) {
  const actual = existsSync(destination) ? files(destination).map((path) => relative(destination, path)).sort() : [];
  if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error("510 bundle file list differs; run bun run sync:skill.");
  for (const path of expected) {
    if (!readFileSync(join(root, path)).equals(readFileSync(join(destination, path)))) {
      throw new Error(`${path} differs from the 510 bundle; run bun run sync:skill.`);
    }
  }
  console.log("510 bundle matches its source, guides, and locked toolchain.");
} else {
  // Preserve legacy local data; active runtime data now lives outside the skill.
  for (const path of ["src", "guides"]) rmSync(join(destination, path), { recursive: true, force: true });
  for (const path of expected) {
    mkdirSync(dirname(join(destination, path)), { recursive: true });
    cpSync(join(root, path), join(destination, path));
  }
  console.log("Synced the self-contained 510 skill bundle.");
}
