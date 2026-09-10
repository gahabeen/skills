import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { closeSync, existsSync, mkdirSync, mkdtempSync, openSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { checkBun, doctor } from "./doctor.mjs";
import { checkPackages } from "./packages.mjs";
import { connectionConfig } from "./connection.mjs";
import { readGuide } from "./guides.mjs";
import { lockSource, manifestSource, projectRoot, readConfiguration, storageChoice, storageFor, writablePath } from "./storage.mjs";

function writeJson(path, value) {
  const content = `${JSON.stringify(value, null, 2)}\n`;
  if (existsSync(path) && readFileSync(path, "utf8") === content) return;
  const temporary = writablePath(`${path}.${randomUUID()}.tmp`);
  try { writeFileSync(temporary, content); renameSync(temporary, path); }
  finally { rmSync(temporary, { force: true }); }
}

function ignoreGenerated(directory, patterns) {
  mkdirSync(directory, { recursive: true });
  const path = writablePath(resolve(directory, ".gitignore"));
  const previous = existsSync(path) ? readFileSync(path, "utf8") : "";
  const lines = new Set(previous.split(/\r?\n/));
  const missing = patterns.filter((pattern) => !lines.has(pattern));
  if (missing.length) writeFileSync(path, `${previous}${previous && !previous.endsWith("\n") ? "\n" : ""}${missing.join("\n")}\n`);
}

function toolchainReady(directory) {
  return ["package.json", "bun.lock"].every((name, index) => existsSync(resolve(directory, name))
    && readFileSync(resolve(directory, name)).equals(index ? lockSource : manifestSource))
    && checkPackages(directory).every((item) => item.ready);
}

function installToolchain(storage) {
  mkdirSync(storage.toolchains, { recursive: true });
  const lock = writablePath(resolve(storage.toolchains, `.setup-${storage.toolchainKey}.lock`));
  let handle;
  try { handle = openSync(lock, "wx"); }
  catch (error) {
    if (error.code === "EEXIST") throw new Error(`Another 510 init may be using this toolchain. Retry after it finishes; a stopped initialization may leave ${lock}.`);
    throw error;
  }
  let stage;
  const backup = writablePath(`${storage.toolchain}.previous-${randomUUID()}`);
  try {
    if (toolchainReady(storage.toolchain)) return false;
    stage = mkdtempSync(resolve(storage.toolchains, ".install-"));
    writeFileSync(resolve(stage, "package.json"), manifestSource);
    writeFileSync(resolve(stage, "bun.lock"), lockSource);
    const result = spawnSync(process.execPath, ["install", "--cwd", stage, "--frozen-lockfile", "--ignore-scripts"], {
      encoding: "utf8", timeout: 120_000, maxBuffer: 8 * 1024 * 1024,
    });
    if (result.error || result.status !== 0 || !toolchainReady(stage)) {
      throw new Error(`Toolchain installation did not complete: ${result.error?.message ?? result.stderr ?? result.stdout}`);
    }
    if (existsSync(storage.toolchain)) renameSync(storage.toolchain, backup);
    try { renameSync(stage, storage.toolchain); }
    catch (error) { if (existsSync(backup)) renameSync(backup, storage.toolchain); throw error; }
    stage = undefined;
    rmSync(backup, { recursive: true, force: true });
    return true;
  } finally {
    if (stage) rmSync(stage, { recursive: true, force: true });
    closeSync(handle);
    rmSync(lock, { force: true });
  }
}

export async function setup(input, choice) {
  const bun = checkBun();
  if (!bun.ready) throw new Error(`510 requires Bun ${bun.expected}; found ${bun.installed ?? "no working Bun"}.`);
  const root = projectRoot(input);
  const config = readConfiguration(root);
  if (choice !== undefined) config.storage = storageChoice(choice);
  const storage = storageFor(root, config);
  const installed = installToolchain(storage);
  ignoreGenerated(storage.configDirectory, ["/toolchains/", "/projects/", "/cache/", "/reports/", "/tmp/", "/debug/", "/mcp.json"]);
  if (storage.base !== storage.configDirectory) ignoreGenerated(storage.base, ["/toolchains/", "/projects/"]);
  // Persist a new choice only after the complete frozen toolchain is available.
  writeJson(storage.configPath, storage.config);
  const connection = connectionConfig(root);
  writeJson(storage.connectionPath, connection);
  const status = await doctor(root);
  return { ...status, installed, connection: { path: storage.connectionPath, configuration: connection, status: "not-verified" },
    documentation: { status: "agent-action-required", guide: readGuide("dox") } };
}
