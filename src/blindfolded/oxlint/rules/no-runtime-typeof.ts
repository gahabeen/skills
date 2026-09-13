import { defineRule } from "@oxlint/plugins";
import type { ESTree } from "@oxlint/plugins";
import { resolveVariable } from "../shared/scope.ts";
import { createTypeAliasEnvironment, resolvedTypeMatches, type TypeAliasEnvironment } from "../shared/type-alias-resolution.ts";

function insideTypeGuard(node: ESTree.Node): boolean {
	let current: ESTree.Node | null = node.parent;
	while (current !== null) {
		if (current.type === "ArrowFunctionExpression" || current.type === "FunctionDeclaration" || current.type === "FunctionExpression") {
			return current.returnType?.typeAnnotation.type === "TSTypePredicate";
		}
		current = current.parent;
	}
	return false;
}

function existenceProbe(node: ESTree.UnaryExpression): boolean {
	const parent = node.parent;
	if (parent.type !== "BinaryExpression" || !["===", "!==", "==", "!="].includes(parent.operator)) return false;
	const other = parent.left === node ? parent.right : parent.left;
	return other.type === "Literal" && other.value === "undefined";
}

function primitive(type: ESTree.TSType): boolean {
	return ["TSStringKeyword", "TSNumberKeyword", "TSBooleanKeyword", "TSBigIntKeyword", "TSSymbolKeyword"].includes(type.type);
}

/** Reject redundant typeof on locally declared primitive contracts; preserve boundary and union narrowing. */
export const noRuntimeTypeofRule = defineRule({
	meta: {
		type: "suggestion",
		docs: { description: "Reject typeof checks of locally declared primitive contracts; unknown, union, and unresolved types may legitimately need runtime narrowing." },
		messages: { runtimeTypeof: "This binding already has a primitive type contract. Validate untrusted input at its boundary; avoid repeating a typeof check within trusted code." },
		schema: [{ type: "object", properties: { allowInTypeGuards: { type: "boolean" } }, additionalProperties: false }],
		defaultOptions: [{ allowInTypeGuards: true }],
	},
	createOnce(context) {
		let environment: TypeAliasEnvironment | null = null;
		return {
			Program(node) { environment = createTypeAliasEnvironment(node, context.sourceCode.visitorKeys); },
			UnaryExpression(node) {
				if (node.operator !== "typeof" || existenceProbe(node) || node.argument.type !== "Identifier") return;
				const option = context.options?.[0];
				const allowGuards = !(typeof option === "object" && option !== null && !Array.isArray(option) && option.allowInTypeGuards === false);
				if (insideTypeGuard(node) && allowGuards) return;
				const variable = resolveVariable(context.sourceCode, node.argument);
				if (variable === null || environment === null) return;
				const knownPrimitive = variable.identifiers.some((identifier) => {
					if (identifier.optional) return false;
					const annotation = identifier.typeAnnotation?.typeAnnotation;
					return annotation !== undefined && environment !== null && resolvedTypeMatches(annotation, environment,
						(type, matches) => type.type === "TSParenthesizedType" ? matches(type.typeAnnotation) : primitive(type));
				});
				if (knownPrimitive) context.report({ node, messageId: "runtimeTypeof" });
			},
		};
	},
});
