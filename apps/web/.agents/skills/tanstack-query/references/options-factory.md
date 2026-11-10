# Define a queryOptions factory per query

> _Every query defines an `XQueryOptions` factory built with `queryOptions(...)` in its own file, taking all inputs as explicit arguments and reading no React context, so it stays reusable in hooks, prefetch, and cache updates._

## TL;DR

- One `XQueryOptions.ts` file per query, **never** in the hook file.
- Single entity → `<entity>QueryOptions`. Collection → `list<Entities>QueryOptions`.
- Params interface extends `UseQueryOptions` minus `queryKey` / `queryFn`; required inputs are explicit fields.
- Never call hooks inside a factory. `organizationId` comes in as an argument.
- The factory sets `queryKey` and `queryFn`; callers spread optional overrides.

## Why

Colocating the factory in the hook file hides it from server-side prefetch and mutation callbacks that need the same key and fetcher. A dedicated file makes the query definition a reusable unit: hooks, loaders, and invalidation all import the same factory without duplicating configuration.

Hooks inside a factory break that reuse outright. Loaders and route handlers cannot call React hooks, so a factory that reads context is client-only, and server prefetch silently falls back to a client fetch waterfall. Explicit arguments keep one factory usable everywhere: the hook reads context and passes values in, the loader receives them from the request.

## Rules

- Every query **MUST** define an `XQueryOptions` factory built with `queryOptions(...)`.
- The factory **MUST** live in its own `XQueryOptions.ts` file and **MUST NOT** live in the hook file.
- A factory that fetches a single entity **MUST** be named `<entity>QueryOptions` (camelCase entity).
- A factory that fetches a collection **MUST** be named `list<Entities>QueryOptions` (plural entity).
- The file name **MUST** match the factory name (e.g. `inboundInvoiceQueryOptions.ts`).
- The params interface **MUST** be PascalCase, named after the factory, and extend `Omit<UseQueryOptions<…>, 'queryKey' | 'queryFn'>`.
- The factory **MUST** take all inputs as explicit arguments, including `organizationId` and entity ids; remaining options **MUST** be spread into `queryOptions(...)`.
- The factory **MUST NOT** call React hooks or read React context, and **MUST** stay usable outside React (`prefetchQuery`, `fetchQuery`, `invalidateQueries`, `setQueryData`).
- The factory **MUST** consume key factories from `_constants/*.keys.ts` and **MUST NOT** inline a raw key array.

## Example

| Fetches    | Entity          | Factory                      | File                            |
| ---------- | --------------- | ---------------------------- | ------------------------------- |
| single     | Inbound invoice | `inboundInvoiceQueryOptions` | `inboundInvoiceQueryOptions.ts` |
| collection | Suppliers       | `listSuppliersQueryOptions`  | `listSuppliersQueryOptions.ts`  |
| single     | Supplier        | `supplierQueryOptions`       | `supplierQueryOptions.ts`       |

**❌ Avoid: factory in the hook file with inline key**

```ts
// useInboundInvoiceQuery.ts
export const useInboundInvoiceSuspenseQuery = (invoiceId: string) => {
  const organizationId = useDefinedOrganizationId();

  return useSuspenseQuery({
    queryKey: [organizationId, 'inbound-invoices', invoiceId],
    queryFn: ({ signal }) => getInboundInvoice({ invoiceId, organizationId, signal }),
  });
};
```

**❌ Avoid: reading context inside the factory**

```ts
export const inboundInvoiceQueryOptions = (invoiceId: string) => {
  const organizationId = useDefinedOrganizationId(); // hooks are illegal here

  return queryOptions({
    queryKey: inboundInvoiceKeys.details(organizationId, invoiceId),
    queryFn: ({ signal }) => getInboundInvoice({ invoiceId, organizationId, signal }),
  });
};
```

**✅ Do this: inboundInvoiceQueryOptions.ts**

```ts
import { queryOptions, UseQueryOptions } from '@tanstack/react-query';
import { inboundInvoiceKeys } from '../../_constants/inbound-invoice.keys';
import { getInboundInvoice } from 'src/services/purchase.services/inbound-invoice.services';

interface InboundInvoiceQueryOptions
  extends Omit<UseQueryOptions<Awaited<ReturnType<typeof getInboundInvoice>>>, 'queryKey' | 'queryFn'> {
  invoiceId: string;
  organizationId: string;
}

export const inboundInvoiceQueryOptions = ({ invoiceId, organizationId, ...options }: InboundInvoiceQueryOptions) =>
  queryOptions({
    queryKey: inboundInvoiceKeys.details(organizationId, invoiceId),
    queryFn: ({ signal }) => getInboundInvoice({ invoiceId, organizationId, signal }),
    ...options,
  });
```

**✅ Do this: the same factory drives server-side prefetch**

```ts
await queryClient.prefetchQuery(
  inboundInvoiceQueryOptions({ invoiceId, organizationId: orgIdFromRequest }),
);
```

## Exceptions

- None.

## Recap

- One factory file per query, separate from the hook.
- Pure function with explicit args: no hooks, no context, `organizationId` passed in.
- Keys come from the key factory, never inline.
