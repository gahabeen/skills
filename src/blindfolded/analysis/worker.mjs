import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { oxlint } from "./oxlint.mjs";
import { typescript } from "./typescript.mjs";
import { knip } from "./knip.mjs";
import { dependencies } from "./dependencies.mjs";
import { sonar } from "./sonar.mjs";
import { fallow } from "./fallow.mjs";
import { manifest, packagePath } from "./runtime.mjs";

const [name, path] = process.argv.slice(2);
const { project, directory, prepared } = JSON.parse(readFileSync(path, "utf8"));
const adapters = { oxlint, typescript, knip, "dependency-cruiser": dependencies, sonarjs: sonar, fallow };
const dependenciesByTool = {
  oxlint: ["oxlint", "oxlint-tsgolint", "@oxlint/plugins"], typescript: ["typescript-check"], knip: ["knip"],
  fallow: ["fallow"],
  "dependency-cruiser": ["dependency-cruiser", "typescript"], sonarjs: ["eslint", "eslint-plugin-sonarjs", "@typescript-eslint/parser", "typescript"],
};
try {
  const versions = {};
  for (const dependency of dependenciesByTool[name]) {
    const { version } = JSON.parse(readFileSync(resolve(packagePath(dependency), "package.json"), "utf8"));
    const expected = manifest.dependencies[dependency].replace(/^npm:[^@]+@/, "");
    if (version !== expected) throw new Error(`${dependency}: expected ${expected}, installed ${version}. Run 510 init.`);
    versions[dependency] = version;
  }
  const result = await adapters[name](project, name === "typescript" ? prepared : directory, prepared);
  process.stdout.write(JSON.stringify({ tool: name, versions, ...result }));
} catch (error) {
  process.stdout.write(JSON.stringify({ tool: name, status: "incomplete", findings: [], gaps: [error.message] }));
}
