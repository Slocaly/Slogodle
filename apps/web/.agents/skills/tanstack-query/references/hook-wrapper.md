# Consume queries through a dedicated hook

> _Every query is consumed through a dedicated `useXQuery` hook that reads context and spreads its `queryOptions` factory — never by calling `useQuery` inline in a component._

## TL;DR

- Never call `useQuery` / `useSuspenseQuery` inline in a component.
- One `useXQuery.ts` file exports both `useXQuery` and `useXSuspenseQuery` when both are consumed.
- Suspense is the default variant for new queries.
- The hook is the React layer: it reads context (`useDefinedOrganizationId()`) and spreads the factory.

## Why

Inline queries weld the key, the fetcher, and the context read into one component. The next screen that needs the same data copy-pastes all three, and they drift: a key that differs by one segment produces a second cache entry that invalidation never reaches. Routing every consumer through a single hook makes the set of components sharing a cache entry greppable.

## Rules

- Components **MUST NOT** call `useQuery` or `useSuspenseQuery` inline. Every query **MUST** be consumed through a dedicated custom hook.
- The hook **MUST** spread its matching `queryOptions` factory and **MUST NOT** declare `queryKey` or `queryFn` itself.
- The hook **MUST** be the layer that reads React context for the query (organization id, session, locale).
- `useXQuery` and `useXSuspenseQuery` **MUST** live in the same `useXQuery.ts` file, and both **MUST** be provided when both are consumed.
- New queries **SHOULD** default to the suspense variant.

## Example

**❌ Avoid: inline query in a component**

```tsx
const InboundInvoicePage = ({ invoiceId }: InboundInvoicePageProps) => {
  const organizationId = useDefinedOrganizationId();
  const { data } = useSuspenseQuery({
    queryKey: [organizationId, 'inbound-invoices', invoiceId],
    queryFn: ({ signal }) => getInboundInvoice({ invoiceId, organizationId, signal }),
  });

  return <InvoiceSummary invoice={data} />;
};
```

**✅ Do this: useInboundInvoiceQuery.ts**

```ts
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useDefinedOrganizationId } from 'src/store';
import { inboundInvoiceQueryOptions } from './inboundInvoiceQueryOptions';

export const useInboundInvoiceSuspenseQuery = (invoiceId: string) => {
  const organizationId = useDefinedOrganizationId();

  return useSuspenseQuery(inboundInvoiceQueryOptions({ invoiceId, organizationId }));
};

export const useInboundInvoiceQuery = (invoiceId: string) => {
  const organizationId = useDefinedOrganizationId();

  return useQuery(inboundInvoiceQueryOptions({ invoiceId, organizationId }));
};
```

## Exceptions

- **`useQueries` over a dynamic list**: the factory **MAY** be mapped inline, since the number of queries isn't known statically. The factory itself is still required.

## Recap

- No `useQuery` in a component body, ever.
- The hook reads context; the factory owns the key and the fetcher.
- Reach for the suspense variant first.
