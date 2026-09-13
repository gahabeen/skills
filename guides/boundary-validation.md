# Validate unknown inputs at their owner

Use this guide when adding a parser, decoder, assertion, or runtime narrowing.
An untrusted value can safely start as `unknown`. Establish its contract at the
boundary and pass the validated result to domain operations.

An implemented boundary may accept unknown inputs when it declares a concrete
return type. Type predicates and the explicit error `cause` convention also remain
supported. The annotation describes the result; it does not prove validation.
Compiler checks, tests with invalid inputs, and contextual review establish that.

```ts
function parseLabel(value: unknown): string {
  if (typeof value !== "string") throw new TypeError("Expected a label");
  return value;
}

function decodeUser(value: unknown): User {
  return UserSchema.parse(value);
}
```

Use an existing schema when it owns the contract. Schema-free code may use normal
runtime checks. Do not add a dependency solely to avoid writing a type guard.
Reject malformed inputs, preserve required business invariants, and test both
accepted and rejected values through the public boundary.

Ordinary union narrowing remains valid:

```ts
function display(value: string | number): string {
  return typeof value === "number" ? value.toFixed(2) : value;
}
```

The `no-runtime-typeof` rule now targets redundant checks of locally declared
primitive contracts. Unknown, union, optional, imported, property, and unresolved types
are not diagnosed by that syntax/scope rule. It does not prove a guard necessary
or unnecessary throughout a program. Narrowing is not itself a defect.

Unknown inputs without a concrete boundary result still violate 510 policy:

```ts
function save(value: unknown): void { database.save(value); }
```

Give domain operations their owner-provided input types. Broad return aliases,
unsafe assertions, and loss of known type information remain subject to the other
rules. Named return types can require contextual validation; this rule does not
resolve every imported alias or infer that a function is at the I/O boundary.

References: [TypeScript unknown](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown),
[narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html).
