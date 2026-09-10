import { defineRule } from "@oxlint/plugins";

import { resolveVariable } from "../shared/scope.ts";

import type { ESTree, SourceCode } from "@oxlint/plugins";

const moduleMockMethods = new Set(["doMock", "mock", "unstable_mockModule"]);

function importedName(node: ESTree.Node): string | null {
  if (node.type !== "ImportSpecifier") return null;
  return node.imported.type === "Identifier" ? node.imported.name : node.imported.value;
}

function isTestFrameworkObject(
  sourceCode: SourceCode,
  expression: ESTree.Expression,
): expression is ESTree.IdentifierReference {
  if (expression.type !== "Identifier") return false;
  if (
    (expression.name === "vi" || expression.name === "jest") &&
    sourceCode.isGlobalReference(expression)
  ) {
    return true;
  }

  const variable = resolveVariable(sourceCode, expression);
  if (variable === null || variable.defs.length === 0) {
    return expression.name === "vi" || expression.name === "jest";
  }
  return variable.defs.some((definition) => {
    if (definition.type !== "ImportBinding" || definition.parent?.type !== "ImportDeclaration") {
      return false;
    }
    const source = definition.parent.source.value;
    const name = importedName(definition.node);
    return (source === "vitest" && name === "vi") ||
      (source === "@jest/globals" && name === "jest") ||
      (source === "bun:test" && (name === "vi" || name === "jest"));
  });
}

function memberName(expression: ESTree.Expression): string | null {
  if (expression.type !== "MemberExpression") return null;
  if (!expression.computed && expression.property.type === "Identifier") return expression.property.name;
  if (expression.computed && expression.property.type === "Literal" && typeof expression.property.value === "string") {
    return expression.property.value;
  }
  return null;
}

function isBunMockObject(sourceCode: SourceCode, expression: ESTree.Expression): boolean {
  const namespace = expression.type === "MemberExpression" && memberName(expression) === "mock";
  const binding = namespace ? expression.object : expression;
  if (binding.type !== "Identifier") return false;
  const variable = resolveVariable(sourceCode, binding);
  return variable?.defs.some((definition) => {
    if (definition.type !== "ImportBinding" || definition.parent?.type !== "ImportDeclaration") return false;
    if (definition.parent.source.value !== "bun:test") return false;
    return namespace
      ? definition.node.type === "ImportNamespaceSpecifier"
      : importedName(definition.node) === "mock";
  }) ?? false;
}

function moduleMockCall(sourceCode: SourceCode, callee: ESTree.Expression): boolean {
  if (callee.type !== "MemberExpression" || callee.object.type === "Super") return false;
  const method = memberName(callee);
  if (method === "module") return isBunMockObject(sourceCode, callee.object);
  return method !== null && moduleMockMethods.has(method) && isTestFrameworkObject(sourceCode, callee.object);
}

/** Ban test framework module mocking in favor of real dependency seams. */
export const noModuleMockingRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow Bun, Vitest, and Jest module mocking; tests must replace dependencies through real interfaces.",
    },
    messages: {
      moduleMock:
        "Replace module mocking with dependency injection through a real interface, service layer, or faithful test implementation.",
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        if (node.callee.type === "Super" || node.callee.type === "V8IntrinsicExpression") return;
        if (moduleMockCall(context.sourceCode, node.callee)) {
          context.report({ node, messageId: "moduleMock" });
        }
      },
    };
  },
});
