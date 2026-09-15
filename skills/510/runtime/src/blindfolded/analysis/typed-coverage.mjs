import { resolve } from "node:path";

/** Account for every selected file using the pinned backend's actual assignments. */
export function typedCoverage(stderr, project, group, gaps) {
  const selected = group.files.map(file => resolve(project.root, file));
  const summaries = [...stderr.matchAll(/Done assigning files to programs\. Total programs: (\d+)\. Unmatched files: (\d+)/g)];
  if (summaries.length !== 1) gaps.push("The typed backend did not confirm file-to-project coverage exactly once.");
  const assignments = [...stderr.matchAll(/Got tsconfig for file (.+): (.+)\r?$/gm)].map(match => ({
    file: match[1], configuration: match[2].trim() === "<none>" ? null : match[2].trim(),
  }));
  const assigned = new Map(assignments.map(item => [item.file, item.configuration]));
  const unmatchedFiles = selected.filter(file => assigned.has(file) && assigned.get(file) === null);
  const unconfirmedFiles = selected.filter(file => !assigned.has(file));
  const programs = [...stderr.matchAll(/Program (.+): (\d+) files/g)].map(match => ({ configuration: match[1], files: Number(match[2]) }));
  const counts = new Map();
  for (const configuration of assigned.values()) if (configuration !== null) counts.set(configuration, (counts.get(configuration) ?? 0) + 1);
  if (assignments.length !== assigned.size || assignments.some(item => !selected.includes(item.file))) {
    gaps.push("The typed backend returned duplicate or unexpected file assignments.");
  }
  for (const file of unmatchedFiles) gaps.push(`The typed backend could not assign selected file to a compiler project: ${file} (requested ${group.base ?? "inferred project"}).`);
  for (const file of unconfirmedFiles) gaps.push(`The typed backend did not confirm a compiler project assignment for ${file}.`);
  const summary = summaries[0];
  if (summary && (Number(summary[1]) !== programs.length || Number(summary[2]) !== unmatchedFiles.length
    || programs.length !== counts.size || programs.some(program => program.files !== counts.get(program.configuration))
    || programs.reduce((count, program) => count + program.files, 0) + Number(summary[2]) !== selected.length)) {
    gaps.push("The typed backend's project counts do not account for the selected files.");
  }
  // --tsconfig controls Oxlint import resolution, not tsgolint project selection.
  // Preserve both intentions and observed assignments without claiming they agree.
  const other = stderr.split(/\r?\n/).filter(line => line.trim()
    && !/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}\.\d+ /.test(line)
    && !/^\d{4}-\d{2}-\d{2}T\S+ (?:DEBUG|TRACE|INFO) /.test(line));
  if (other.length) gaps.push(other.join("\n"));
  return { requestedProject: group.base ?? null, requestedConfiguration: group.path,
    selection: "backend-discovery", programs, assignments, unmatchedFiles, unconfirmedFiles, log: stderr };
}
