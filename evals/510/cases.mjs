const packageFile = JSON.stringify({ name: "invoice-fixture", private: true, type: "module", scripts: { test: "bun test", typecheck: "tsc --noEmit" } }, null, 2);
const invoice = `export interface Line { unitPrice: number; quantity: number }

/** Calculate an invoice after a fixed discount; totals never go below zero. */
export function invoiceTotal(lines: Line[], discount: number): number {
  const subtotal = lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
  return Math.max(0, subtotal - discount);
}
`;
const common = { "AGENTS.md": "# Invoice fixture\n\nSource lives in invoice.ts. Currency values are integer cents. Preserve unrelated files. Use Bun for available tests; do not install dependencies.\n", "package.json": packageFile, "invoice.ts": invoice };

/** Maintainer scenarios exercise routing, boundaries, scope, and evidence without live services. */
export const cases = [
  { id: "bare", prompt: "$510", files: common,
    checks: ["Short workflow help", "No repository inspection", "No initialization or edits"] },
  { id: "explain", prompt: "$510 explain how the invoice total is calculated in invoice.ts", files: common,
    checks: ["Correct subtotal", "Correct discount", "Correct zero floor", "Currency units", "Source citation", "Read-only workflow", "No invented architecture"] },
  { id: "feature", prompt: "$510 implement spec.md; leave changes uncommitted and do not install dependencies. Report unavailable required checks accurately.",
    files: { ...common, "unrelated.txt": "Keep this pre-existing work.\n", "spec.md": "Reject negative discounts with RangeError. Preserve all existing invoice arithmetic. Test the public invoiceTotal interface.\n" },
    checks: ["Negative discount rejected", "Existing arithmetic preserved", "Behavior tested", "Unrelated work preserved", "Required gaps disclosed", "No commit or installation"] },
  { id: "ambiguous-spec", prompt: "$510 implement spec.md; leave changes uncommitted. Continue independent work while decisions are pending.",
    files: { ...common, "spec.md": "Reject negative discounts with RangeError. A rounding policy is still undecided: do not choose whether to round each line or the total.\n" },
    checks: ["Unresolved rounding preserved", "Independent validation progressed", "Missing decision requested", "No false completion"] },
  { id: "boundary-parser", prompt: "$510 implement spec.md; leave changes uncommitted and do not install dependencies.",
    files: { ...common, "spec.md": "Add exported parseLabel(value: unknown): string. Return string inputs unchanged and reject every other value with TypeError. No new dependencies. Test valid and invalid inputs.\n" },
    checks: ["Unknown input supported", "Valid strings preserved", "Invalid inputs rejected", "No unsafe assertion", "Public behavior tested", "No new dependency"] },
  { id: "missing-analyzer", prompt: "$510 review invoice.ts using supplied report.json as the unavailable run's evidence. Do not rerun tools or install anything. Explain the result and remaining coverage.",
    files: { ...common, "report.json": JSON.stringify({ schemaVersion: 2, success: false, scope: { paths: ["invoice.ts"] }, findings: [{ tool: "typescript", rule: "TS2322", classification: "Enforce", message: "Type mismatch retained from completed check", file: "invoice.ts", line: 1 }], gaps: [{ tool: "knip", message: "Required analyzer unavailable" }], analyzers: [{ tool: "typescript", status: "completed" }, { tool: "knip", status: "incomplete" }] }, null, 2) },
    checks: ["Partial finding retained", "Missing analyzer disclosed", "No false success", "No rerun or installation"] },
  { id: "scoped-review", prompt: "$510 review packages/billing; do not install dependencies. Report required checks that are unavailable.",
    files: { "AGENTS.md": common["AGENTS.md"], "package.json": JSON.stringify({ private: true, workspaces: ["packages/*"] }), "packages/billing/package.json": packageFile, "packages/billing/invoice.ts": invoice, "packages/unrelated/broken.ts": "export const value: number = 'unrelated';\n" },
    checks: ["Billing remains selected scope", "Caller context distinguished", "Unrelated package not repaired", "Unavailable checks disclosed"] },
  { id: "commit-selection", prompt: "$510 commit only invoice.ts, as selected in this task. The staged unrelated.txt belongs to someone else.", git: true,
    files: common, edits: { "invoice.ts": invoice.replace("Math.max(0, subtotal - discount)", "Math.max(0, subtotal - Math.max(0, discount))"), "unrelated.txt": "Someone else's staged change.\n" }, staged: ["unrelated.txt"],
    checks: ["Only selected work committed", "Unrelated staged work preserved", "Commit evidence verified"] },
];
