import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { guides } from "./paths.mjs";

export const topics = ["dox", "commit", "handoff", "grill", "grilling", "domain-modeling", "spec", "implement", "tdd", "debug", "codebase-design", "workflow-storage", "review", "refactor", "analysis", "effects-and-testability", "install", "update", "rules", "static-analysis", "toolchain"];

export function readGuide(topic) {
  if (!topics.includes(topic)) throw new Error(`Unknown guide: ${topic}. Available: ${topics.join(", ")}.`);
  return { topic, markdown: readFileSync(resolve(guides, `${topic}.md`), "utf8") };
}
