import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { bin, parseOutput, requireTool, run } from "./runtime.mjs";

export function prepareProjects(project, directory) {
  const compiler = bin("typescript-check", "tsc", project.root);
  const configs = [];
  const gaps = [];
  const covered = new Set();
  const sources = new Set(project.files.map((file) => resolve(project.root, file)));
  const bases = project.projects.length ? project.projects : [null];
  for (const [index, base] of bases.entries()) {
    const path = resolve(directory, `tsconfig.${index}.json`);
    const config = { ...(base ? { extends: resolve(project.root, base) } : { files: [...sources] }),
      compilerOptions: { ...(!base ? { target: "esnext", module: "nodenext", allowJs: true, checkJs: true } : {}),
        strict: true, strictNullChecks: true, noImplicitAny: true, noImplicitThis: true,
        strictBindCallApply: true, strictFunctionTypes: true, strictPropertyInitialization: true,
        strictBuiltinIteratorReturn: true, useUnknownInCatchVariables: true, alwaysStrict: true,
        allowJs: true, checkJs: true, noUncheckedIndexedAccess: true, exactOptionalPropertyTypes: true,
        noEmit: true, incremental: false, composite: false, declaration: false, declarationMap: false, emitDeclarationOnly: false },
      references: [] };
    writeFileSync(path, JSON.stringify(config, null, 2));
    const result = run(compiler, ["--showConfig", "--project", path], project.root);
    if (result.status !== 0) {
      gaps.push(`${base ?? "inferred project"}: ${result.stdout || result.stderr}`);
      continue;
    }
    const expanded = parseOutput(result, "TypeScript configuration");
    // Preserve automatic @types discovery at the original project, not at our toolchain.
    if (!expanded.compilerOptions.typeRoots) {
      const ts = requireTool("typescript", project.root);
      config.compilerOptions.typeRoots = ts.getEffectiveTypeRoots({ configFilePath: resolve(project.root, base ?? "tsconfig.json") },
        { getCurrentDirectory: () => project.root, directoryExists: existsSync }) ?? [];
      writeFileSync(path, JSON.stringify(config, null, 2));
    }
    const files = (expanded.files ?? []).map((file) => resolve(directory, file)).filter((file) => sources.has(file));
    // A solution config can have references but no directly owned source files.
    if (!files.length) continue;
    config.files = files;
    config.include = [];
    config.exclude = [];
    writeFileSync(path, JSON.stringify(config, null, 2));
    for (const file of files) covered.add(file);
    configs.push({ path, base, files, config, compilerOptions: expanded.compilerOptions });
  }
  for (const file of sources) if (!covered.has(file)) gaps.push(`No analysis project covers ${file}. Include it in a project or adjust the declared source scope.`);
  return { configs, gaps };
}
