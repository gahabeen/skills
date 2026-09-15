import { completed, finding, bin, run } from "./runtime.mjs";

/** Check strict compiler contracts while retaining per-project failures. */
export async function typescript(project, prepared) {
  const findings = [];
  const gaps = [...prepared.gaps];
  for (const config of prepared.configs) {
    try {
      const result = await run(bin("typescript-check", "tsc"), ["--project", config.path, "--pretty", "false"], project.root);
      const diagnostics = (result.stdout + result.stderr).split(/\r?\n/);
      let current;
      const start = findings.length;
      for (const line of diagnostics) {
        const match = /^(?:(.+)\((\d+),(\d+)\): )?error TS(\d+): (.*)$/.exec(line);
        if (match) {
          current = finding("typescript", `TS${match[4]}`, match[1] ?? config.base, match[5], "Enforce", {
            line: match[2] ? Number(match[2]) : null, column: match[3] ? Number(match[3]) : null,
          });
          findings.push(current);
          if (!match[1]) gaps.push(`Compiler configuration prevented complete analysis: ${line}`);
          if (["2307", "2688", "6053", "6305"].includes(match[4])) gaps.push(`Unresolved type information: ${line}`);
        } else if (current && line.trim()) { current.message += `\n${line}`; current.evidence = current.message; }
      }
      if (result.status !== 0 && findings.length === start) gaps.push(`TypeScript exit ${result.status}: ${result.stdout || result.stderr}`);
    } catch (error) { gaps.push(error.message); }
  }
  return completed(findings, { status: gaps.length ? "incomplete" : "completed", gaps,
    configuration: prepared.configs.map(({ base, compilerOptions }) => ({ base, compilerOptions })) });
}
