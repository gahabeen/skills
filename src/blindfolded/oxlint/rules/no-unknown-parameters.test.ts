import { RuleTester } from "oxlint/plugins-dev";

import { noUnknownParametersRule } from "./no-unknown-parameters.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "unknownParameter" };

tester.run("blindfolded/no-unknown-parameters", noUnknownParametersRule, {
	valid: [
		'function parse(value: unknown): string { if (typeof value !== "string") throw new Error(); return value; }',
		'const decode = (value: unknown): User => UserSchema.parse(value);',
		'async function decode(value: unknown): Promise<User> { return UserSchema.parse(value); }',
		"function enrich(cause: unknown): void {}",
		"function enrich(cause: Error | unknown): void {}",
		"function isString(value: unknown): value is string { return true; }",
		"const isString = (value: unknown): value is string => true;",
		"function assertString(value: unknown): asserts value is string {}",
		"type Guard = (value: unknown) => value is string;",
		"declare function isString(value: unknown): value is string;",
		"type Guards = { isString(value: unknown): value is string };",
		"function parse(value: string | number): void {}",
	],
	invalid: [
		{ code: "function parse(value: unknown): unknown { return value; }", errors: [error] },
		{ code: "function parse(value: unknown): any { return value; }", errors: [error] },
		{ code: "async function parse(value: unknown): Promise<unknown> { return value; }", errors: [error] },
		{ code: "type Decoder = (value: unknown) => string;", errors: [error] },
		{ code: "function parse(value: unknown): void {}", errors: [error] },
		{ code: "function parse(value: string | unknown): void {}", errors: [error] },
		{
			code: "function parse(value: string | (number | unknown)): void {}",
			errors: [error],
		},
		{
			code: "function isString(value: unknown, context: unknown): value is string { return true; }",
			errors: [{ ...error, data: { parameter: "context" } }],
		},
		{
			code: "export function parse({ value }: unknown = {}): void {}",
			errors: [{ ...error, data: { parameter: "{ value }" } }],
		},
	],
});
