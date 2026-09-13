# React and Next.js changes

Use only for relevant component, rendering, or framework data-flow work.

Confirm installed React/Next.js versions, router conventions, and the relevant
server/client boundary. Preserve local framework patterns. Keep server credentials
and request-specific state on the server; validate and authorize external inputs
at the operation that owns the trust boundary.

Trace data dependencies before changing fetch order. Parallelize independent
operations only; preserve sequencing, errors, and cancellation when dependencies
exist. Inspect loading and error states and whether data is serialized to clients.

Prefer observable behavior tests over component internals. Verify hydration,
navigation, and server/client integration when affected. Measure a demonstrated
performance problem before adding caching or memoization; account for cache scope
and invalidation. Framework-specific checks supplement the complete static suite.

Consult version-matching first-party guidance when behavior is uncertain:
[React](https://react.dev/learn), [Next.js](https://nextjs.org/docs),
[Vercel performance rules](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices).
