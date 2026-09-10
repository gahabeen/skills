import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { requireTool } from "./runtime.mjs";

export async function configuration(root, explicit, candidates) {
  const file = explicit ?? candidates.find((name) => existsSync(resolve(root, name)));
  if (!file) return {};
  const path = resolve(root, file);
  let config;
  if (/\.jsonc?$/.test(path)) {
    const ts = requireTool("typescript");
    const parsed = ts.parseConfigFileTextToJson(path, readFileSync(path, "utf8"));
    if (parsed.error) throw new Error(`Cannot parse configuration: ${path}`);
    config = parsed.config;
  } else {
    config = (await import(pathToFileURL(path).href)).default;
  }
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error(`Expected an object configuration in ${path}. Export a resolved object for analysis.`);
  }
  JSON.stringify(config, (key, value) => {
    if (typeof value === "function" || value instanceof RegExp || typeof value === "bigint") {
      throw new Error(`Configuration ${path} contains a non-serializable value at ${key}. Export a serializable analysis configuration.`);
    }
    return value;
  });
  return config;
}
