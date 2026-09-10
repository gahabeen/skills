import { chmodSync, cpSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writablePath } from "../runtime/storage.mjs";

const source = fileURLToPath(new URL("oxlint/", import.meta.url));

function makeEditable(directory) {
  chmodSync(directory, statSync(directory).mode | 0o700);
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) makeEditable(path);
    else if (entry.isFile()) chmodSync(path, statSync(path).mode | 0o600);
  }
}

export function copyRules(destination) {
  destination = writablePath(destination);
  mkdirSync(dirname(destination), { recursive: true });
  try {
    // Exclusive creation preserves existing files, customizations, and symlinks.
    mkdirSync(destination);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    throw new Error(`Refusing to overwrite ${destination}. Use the update procedure to preserve local changes.`);
  }
  for (const entry of readdirSync(source)) {
    cpSync(join(source, entry), join(destination, entry), {
      recursive: true, force: false, errorOnExist: true, filter: (path) => !path.endsWith(".test.ts"),
    });
  }
  makeEditable(destination);
  return resolve(destination);
}
