# Name query hooks after the entity

> _Query hook names derive from the entity they fetch: `use<Entity>Query` for a single record, `useList<Entities>Query` for a collection, with the file name matching the non-suspense hook._

## TL;DR

- Single entity → `use<Entity>Query` / `use<Entity>SuspenseQuery` (e.g. `useInboundInvoiceQuery`).
- Collection → `useList<Entities>Query` / `useList<Entities>SuspenseQuery` (e.g. `useListSuppliersQuery`).
- File name matches the hook name without the `Suspense` suffix: `useInboundInvoiceQuery.ts`.

## Why

Entity-based naming makes hooks discoverable by what they return, not by where they live. A developer searching for "how do I fetch a supplier?" finds `useSupplierQuery` immediately. Mixing naming schemes (`useGetSupplier`, `useSupplierData`) forces grep across multiple patterns and slows code review.

## Rules

- Hook names **MUST** be prefixed with `use` and suffixed with `Query` or `SuspenseQuery`.
- A hook that fetches a single entity **MUST** be named `use<Entity>Query` (camelCase entity).
- A hook that fetches a collection **MUST** be named `useList<Entities>Query` (plural entity).
- The file name **MUST** match the non-suspense hook name (e.g. `useInboundInvoiceQuery.ts`).

## Example

| Fetches    | Entity          | Hook                                                       | File                        |
| ---------- | --------------- | ---------------------------------------------------------- | --------------------------- |
| single     | Inbound invoice | `useInboundInvoiceQuery`, `useInboundInvoiceSuspenseQuery` | `useInboundInvoiceQuery.ts` |
| collection | Suppliers       | `useListSuppliersQuery`, `useListSuppliersSuspenseQuery`   | `useListSuppliersQuery.ts`  |
| single     | Supplier        | `useSupplierQuery`, `useSupplierSuspenseQuery`             | `useSupplierQuery.ts`       |

**❌ Avoid: action-based or inconsistent naming**

```ts
// useGetInboundInvoice.ts
export const useGetInboundInvoice = (invoiceId: string) => { ... };

// useSuppliers.ts — missing List prefix for a collection
export const useSuppliersQuery = () => { ... };
```

**✅ Do this**

```ts
// useListSuppliersQuery.ts
export const useListSuppliersSuspenseQuery = () => { ... };
export const useListSuppliersQuery = () => { ... };
```

## Exceptions

- None.

## Recap

- Single → `use<Entity>Query`. Collection → `useList<Entities>Query`.
- File name = hook name minus `Suspense`.
