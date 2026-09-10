import { checkPackages, loadTool, manifest } from "./packages.mjs";
import { storageFor } from "./storage.mjs";

export function checkBun() {
  const expected = manifest.packageManager.split("@")[1];
  const installed = process.versions.bun ?? null;
  return { name: "bun", expected, installed, executable: process.execPath, ready: installed === expected };
}

export async function doctor(root) {
  const storage = storageFor(root);
  const runtimes = [checkBun()];
  const packages = checkPackages(storage.toolchain);
  let search;
  try {
    const { FileFinder } = await loadTool("@ff-labs/fff-node", storage.root);
    FileFinder.ensureLoaded();
    const health = FileFinder.healthCheckStatic();
    if (!health.ok) throw new Error(health.error);
    const expected = manifest.dependencies["@ff-labs/fff-node"];
    search = { ready: health.value.version === expected, nativeVersion: health.value.version, expected };
  } catch (error) { search = { ready: false, error: error.message }; }
  return { ready: runtimes.every((item) => item.ready) && packages.every((item) => item.ready) && search.ready,
    runtimes, packages, search, toolchain: storage.toolchain, storage,
    connection: "Local health only; verify MCP tool discovery in the connected agent separately." };
}
