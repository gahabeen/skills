import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The generated bundle preserves the source, guides, and toolchain layout.
export const runtimeRoot = fileURLToPath(new URL("../../", import.meta.url));
export const bundledToolchain = resolve(runtimeRoot, "toolchain");
export const guides = resolve(runtimeRoot, "guides");
export const skillRoot = existsSync(resolve(runtimeRoot, "../SKILL.md"))
  ? resolve(runtimeRoot, "..")
  : resolve(runtimeRoot, "skills/510");
