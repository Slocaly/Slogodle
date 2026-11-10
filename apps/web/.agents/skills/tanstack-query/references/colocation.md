# Colocate query hooks with their consumer

> _Query hooks and their `queryOptions` factories live together in the `_hooks/queries` folder closest to where they are consumed; promote to a shared location only when a second feature needs the query._

## TL;DR

- Pair `useXQuery.ts` and `XQueryOptions.ts` in the same `_hooks/queries/` folder.
- Place that folder in the feature route closest to the consumer.
- Promote to a shared module only when a second feature imports the query.

## Why

Queries placed too high in the tree become grab-bags: every new endpoint lands in the same folder, and ownership blurs. Colocating with the consumer keeps the query next to the screen that owns it. Promotion on second use avoids premature abstraction while preventing duplication once reuse is proven.

## Rules

- `useXQuery.ts` and `XQueryOptions.ts` **MUST** live in the same `_hooks/queries/` folder.
- That folder **MUST** be placed in the feature module closest to where the query is consumed.
- A query **SHOULD NOT** be moved to a shared location until a second feature needs it.

## Example

```
inbound-invoices/[id]/_hooks/queries/
  inboundInvoiceQueryOptions.ts   ← factory
  useInboundInvoiceQuery.ts       ← hooks
```

**❌ Avoid: factory and hook in separate unrelated folders**

```ts
// src/hooks/queries/useInboundInvoiceQuery.ts
// src/services/inboundInvoiceQueryOptions.ts
```

**✅ Do this: paired files next to the feature**

```ts
// inbound-invoices/[id]/_hooks/queries/inboundInvoiceQueryOptions.ts
// inbound-invoices/[id]/_hooks/queries/useInboundInvoiceQuery.ts
```

## Exceptions

- A query consumed by two or more features **MAY** be promoted to a shared `_hooks/queries/` folder at the nearest common ancestor.

## Recap

- Hook + factory together, in `_hooks/queries/`, near the screen.
- Share only after the second consumer appears.
