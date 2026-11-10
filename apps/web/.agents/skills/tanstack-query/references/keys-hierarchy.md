# Build hierarchical query keys that mirror endpoints

> _Query keys live in a `_constants/*.keys.ts` factory, mirror the endpoint path, start with `organizationId`, spread the parent factory, and return `as const` — never inline a raw array._

## TL;DR

- Keys live in `_constants/<scope>.keys.ts` (e.g. `inbound-invoice.keys.ts`).
- `organizationId` is always the first segment.
- Build keys by spreading a parent factory, then appending the next segment.
- Every factory method returns `as const`. Never inline a raw key array in `queryOptions`.

## Why

Flat, ad-hoc key arrays don't compose: invalidating "all inbound invoices" requires knowing every key shape in the app. Hierarchical keys that mirror REST paths let prefix invalidation do the right thing — invalidate `details(id)` and its comments disappear too, because the comments key extends the details key.

## Rules

- Query keys **MUST** live in a `_constants/*.keys.ts` file scoped to the feature.
- A query key **MUST** be treated as a path that mirrors the endpoint it calls.
- `organizationId` **MUST** be the first segment of every key.
- Keys **MUST** be built by spreading a parent factory and appending the next segment.
- Key factory methods **MUST** return `as const`.
- Raw key arrays **MUST NOT** be inlined in `queryOptions` or hooks.

## Example

| Query        | Endpoint                                         | Key factory method                                    | Resolved query key                                            |
| ------------ | ------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------- |
| all (root)   | N/A                                              | `all(organizationId)`                                 | `[organizationId, 'inbound-invoices']`                        |
| list         | `GET /.../inbound-invoices`                      | `list(organizationId)`                                  | `[organizationId, 'inbound-invoices', 'list']`                |
| one invoice  | `GET /.../inbound-invoices/{invoiceId}`          | `details(organizationId, invoiceId)`                  | `[organizationId, 'inbound-invoices', invoiceId]`             |
| its comments | `GET /.../inbound-invoices/{invoiceId}/comments` | `comments(organizationId, invoiceId)`                   | `[organizationId, 'inbound-invoices', invoiceId, 'comments']` |

**❌ Avoid: inline key array in queryOptions**

```ts
export const inboundInvoiceQueryOptions = ({ invoiceId, organizationId }: InboundInvoiceQueryOptions) =>
  queryOptions({
    queryKey: [organizationId, 'inbound-invoices', invoiceId],
    queryFn: ({ signal }) => getInboundInvoice({ invoiceId, organizationId, signal }),
  });
```

**✅ Do this: inbound-invoice.keys.ts**

```ts
export const inboundInvoiceKeys = {
  all: (organizationId: string) => [organizationId, 'inbound-invoices'] as const,

  list: (organizationId: string) => [...inboundInvoiceKeys.all(organizationId), 'list'] as const,

  details: (organizationId: string, invoiceId: string) =>
    [...inboundInvoiceKeys.all(organizationId), invoiceId] as const,

  comments: (organizationId: string, invoiceId: string) =>
    [...inboundInvoiceKeys.details(organizationId, invoiceId), 'comments'] as const,
};
```

**✅ Do this: factory consumes the key**

```ts
export const inboundInvoiceQueryOptions = ({ invoiceId, organizationId, ...options }: InboundInvoiceQueryOptions) =>
  queryOptions({
    queryKey: inboundInvoiceKeys.details(organizationId, invoiceId),
    queryFn: ({ signal }) => getInboundInvoice({ invoiceId, organizationId, signal }),
    ...options,
  });
```

## Exceptions

- None.

## Recap

- Keys = endpoint paths, built from a factory, `organizationId` first.
- Sub-resources inherit from their parent key via spread.
- Never inline a raw array.
