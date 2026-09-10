import { resolve } from "node:path";
import { runtimeRoot } from "./paths.mjs";
import { projectRoot } from "./storage.mjs";

export function connectionConfig(root) {
  return { mcpServers: { "510": { command: process.execPath,
    args: ["--no-install", resolve(runtimeRoot, "src/cli/main.mjs"), "serve", "--root", projectRoot(root)] } } };
}
