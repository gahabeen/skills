import { RuleTester } from "oxlint/plugins-dev";
import { noRuntimeTypeofRule } from "./no-runtime-typeof.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "runtimeTypeof" };

tester.run("blindfolded/no-runtime-typeof", noRuntimeTypeofRule, {
  valid: [
    'const isServer = typeof document === "undefined";',
    'function parse(value: unknown): string { if (typeof value !== "string") throw new Error(); return value; }',
    'function isString(value: unknown): value is string { return typeof value === "string"; }',
    'function display(value: string | number): string { return typeof value === "string" ? value : value.toFixed(2); }',
    'function display(value?: string): string { return typeof value === "string" ? value : "missing"; }',
    'type Label = string; function display(value?: Label): string { return typeof value === "string" ? value : "missing"; }',
    'type Input = string | number; function display(value: Input) { return typeof value === "string"; }',
    'import type { Input } from "./types"; function display(value: Input) { return typeof value === "string"; }',
    'function display(value: { label: string | number }) { return typeof value.label === "string"; }',
    'function outer(value: string) { return (value: unknown) => typeof value === "string"; }',
    'const value: unknown = external; if (typeof value === "string") use(value);',
    'let value: string | number = external; if (typeof value === "number") use(value);',
    'function isSpecial(value: string): value is "special" { return typeof value === "string"; }',
  ],
  invalid: [
    { code: 'function display(value: string) { return typeof value === "string" ? value : ""; }', errors: [error] },
    { code: 'const value: number = 1; if (typeof value === "number") use(value);', errors: [error] },
    { code: 'type Label = string; function display(value: Label) { return typeof value === "string"; }', errors: [error] },
    { code: 'function outer(value: unknown) { return (value: boolean) => typeof value === "boolean"; }', errors: [error] },
    { code: 'function isSpecial(value: string): value is "special" { return typeof value === "string"; }', options: [{ allowInTypeGuards: false }], errors: [error] },
  ],
});
