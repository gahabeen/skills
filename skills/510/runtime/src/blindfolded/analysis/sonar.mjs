import { resolve } from "node:path";
import { completed, finding, requireTool } from "./runtime.mjs";

export async function sonar(project) {
  const { ESLint } = requireTool("eslint");
  const parser = requireTool("@typescript-eslint/parser");
  const sonarjs = requireTool("eslint-plugin-sonarjs");
  const eslint = new ESLint({ cwd: project.root, overrideConfigFile: true, ignore: false,
    overrideConfig: [{ files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
      languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { sonarjs }, rules: { "sonarjs/cognitive-complexity": ["warn", project.thresholds.cognitive] } }] });
  const results = await eslint.lintFiles(project.files.map((file) => resolve(project.root, file)));
  const findings = results.flatMap((result) => result.messages.map((item) => finding("sonarjs", item.ruleId ?? "parser", result.filePath,
    item.message, item.ruleId ? "Review" : "Fix", { line: item.line ?? null, column: item.column ?? null,
      ...(item.ruleId ? { measurement: { value: Number(item.message.match(/from (\d+)/)?.[1]), limit: project.thresholds.cognitive } } : {}) })));
  const gaps = results.filter((result) => result.fatalErrorCount).map((result) => `Could not parse ${result.filePath}.`);
  return completed(findings, { status: gaps.length ? "incomplete" : "completed", gaps,
    configuration: { cognitiveComplexity: project.thresholds.cognitive, typeAware: false } });
}
