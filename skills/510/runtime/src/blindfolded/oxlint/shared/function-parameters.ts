import type { ESTree, SourceCode } from "@oxlint/plugins";

export type FunctionParameter = ESTree.ParamPattern;

/** A boundary implementation must expose a concrete result, not forward an unparsed top type. */
export function hasBoundaryResult(owner: ESTree.Node): boolean {
	if (!("body" in owner) || owner.body === null || !("returnType" in owner)) return false;
	const result = owner.returnType?.typeAnnotation;
	if (result === undefined) return false;
	return concreteResult(result);
}

function concreteResult(type: ESTree.TSType): boolean {
	if (type.type === "TSParenthesizedType") return concreteResult(type.typeAnnotation);
	if (type.type === "TSUnionType") return type.types.every(concreteResult);
	if (["TSUnknownKeyword", "TSAnyKeyword", "TSVoidKeyword", "TSObjectKeyword", "TSTypePredicate"].includes(type.type)) return false;
	if (type.type === "TSTypeReference" && type.typeName.type === "Identifier" && ["Promise", "PromiseLike"].includes(type.typeName.name)) {
		const argument = type.typeArguments?.params[0];
		return argument !== undefined && concreteResult(argument);
	}
	return true;
}

/** Return whether a type is or contains TypeScript's absorbing unknown top type. */
export function containsUnknownType(type: ESTree.TSType): boolean {
	if (type.type === "TSUnknownKeyword") return true;
	if (type.type === "TSParenthesizedType") return containsUnknownType(type.typeAnnotation);
	return type.type === "TSUnionType" && type.types.some(containsUnknownType);
}

/** Return the TypeScript annotation attached to a function parameter or its wrapped binding. */
export function functionParameterTypeAnnotation(
	parameter: FunctionParameter,
): ESTree.TSTypeAnnotation | null | undefined {
	if (parameter.type === "TSParameterProperty") {
		return functionParameterTypeAnnotation(parameter.parameter);
	}
	if (parameter.type === "RestElement") {
		return parameter.typeAnnotation ?? functionParameterTypeAnnotation(parameter.argument);
	}
	if (parameter.type === "AssignmentPattern") {
		return parameter.typeAnnotation ?? functionParameterTypeAnnotation(parameter.left);
	}
	return parameter.typeAnnotation;
}

/** Return only a function parameter's local binding, excluding its annotation and default value. */
export function functionParameterBindingName(
	parameter: FunctionParameter,
	sourceCode: SourceCode,
): string {
	if (parameter.type === "TSParameterProperty") {
		return functionParameterBindingName(parameter.parameter, sourceCode);
	}
	if (parameter.type === "AssignmentPattern") {
		return functionParameterBindingName(parameter.left, sourceCode);
	}
	if (parameter.type === "RestElement") {
		return functionParameterBindingName(parameter.argument, sourceCode);
	}
	if (parameter.type === "Identifier") return parameter.name;

	const sourceText = sourceCode.getText(parameter);
	const annotationStart = parameter.typeAnnotation?.start;
	return annotationStart === undefined
		? sourceText
		: sourceText.slice(0, annotationStart - parameter.start).trimEnd();
}
