import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { guides } from "./paths.mjs";

export const topics = ["dox", "explain", "explore", "output", "reporting", "writing-for-agents", "commit", "pr", "merge-conflicts", "handoff", "grill", "grilling", "domain-modeling", "spec", "implement", "tdd", "debug", "performance", "coding-rules", "codebase-design", "boundary-validation", "environment", "environment-node", "environment-browser", "environment-react", "environment-monorepo", "improve-codebase-architecture", "workflow-storage", "review", "refactor", "analysis", "analysis-reference", "analysis-reports", "effects-and-testability", "install", "update", "rules", "static-analysis", "toolchain"];

/** Phase names select sections of the canonical workflow for both CLI and MCP. */
export const phases = { implement: { select: "Select work", build: "Build behavior", verify: "Verify code and requirements", finish: "Finish locally" } };

/** Select one phase without loading a separate copy or neighboring sections. */
function phaseGuide(markdown, heading) {
  const marker = `\n## ${heading}\n`;
  const start = markdown.indexOf(marker);
  if (start === -1) throw new Error(`Missing guide section: ${heading}.`);
  const end = markdown.indexOf("\n## ", start + marker.length);
  return `# ${heading}\n\n${markdown.slice(start + marker.length, end === -1 ? undefined : end).trim()}\n`;
}

function ruleGuide(markdown, requested) {
  const rule = requested.replace(/^blindfolded[/(]/, "").replace(/\)$/, "");
  const heading = `### \`${rule}\``;
  const start = markdown.indexOf(`\n${heading}\n`);
  if (start === -1) throw new Error(`Unknown documented rule: ${requested}. Read guide rules for the catalog.`);
  const end = markdown.indexOf("\n### ", start + 1);
  const summary = markdown.split("\n").find((line) => line.startsWith(`- \`${rule}\` —`));
  return { rule, markdown: `# ${rule}\n\n${summary ?? ""}\n\nThis is a 510 policy, classified as Enforce; a finding does not itself prove a defect.\n\n${markdown.slice(start + heading.length + 2, end === -1 ? undefined : end).trim()}\n` };
}

/** Retrieve only the requested workflow, phase, or rule; never expand references. */
export function readGuide(topic, { phase, rule } = {}) {
  if (!topics.includes(topic)) throw new Error(`Unknown guide: ${topic}. Available: ${topics.join(", ")}.`);
  if (phase !== undefined && rule !== undefined) throw new Error("Choose a phase or a rule, not both.");
  const heading = phase === undefined ? null : Object.hasOwn(phases, topic) && Object.hasOwn(phases[topic], phase) ? phases[topic][phase] : null;
  if (phase !== undefined && !heading) throw new Error(`Unknown phase ${phase} for ${topic}.`);
  const file = topic === "reporting" ? "output" : topic;
  const markdown = readFileSync(resolve(guides, `${file}.md`), "utf8");
  if (rule !== undefined) {
    if (topic !== "rules") throw new Error("Rule selection requires topic rules.");
    return { topic, ...ruleGuide(markdown, rule) };
  }
  return { topic, ...(phase === undefined ? {} : { phase }), markdown: heading ? phaseGuide(markdown, heading) : markdown };
}
