# Invalidate queries by key prefix

> _Invalidate through the key factory at the broadest level that covers what changed; use `exact: true` to target only the collection list without touching individual entity caches._

## TL;DR

- Always pass a key from the key factory to `invalidateQueries`, never a raw array.
- Invalidate the broadest key that covers the changed data — prefix matching does the rest.
- Sub-resource keys inherit from their parent, so invalidating `details(...)` clears `comments(...)` too.
- Add `exact: true` to refetch only the list query without touching individual entity caches.

## Why

Hierarchical keys exist so invalidation can be coarse or fine without maintaining a list of every affected query. Prefix matching means one `invalidateQueries` call after creating an invoice refreshes the list and every related detail view — as long as keys were built by spreading parent factories. Without this discipline, mutations leave stale slices of the cache that only surface in edge-case navigation.

## Rules

- Invalidation **MUST** use keys from the key factory, not raw arrays.
- Invalidation **MUST** target the broadest key that covers the data that changed.
- Sub-resource keys **MUST** inherit from their parent key so prefix invalidation cascades correctly.
- To refetch only the collection list without invalidating individual entity caches, `exact: true` **MUST** be passed.

## Example

**✅ Do this: invalidate at the right scope**

```ts
// everything in the inbound-invoices scope (list + every invoice + sub-resources)
queryClient.invalidateQueries({ queryKey: inboundInvoiceKeys.all(organizationId) });

// only the list query and its sub-resources
queryClient.invalidateQueries({ queryKey: inboundInvoiceKeys.list(organizationId) });

// one invoice and all of its sub-resources (invoice + comments + …)
queryClient.invalidateQueries({ queryKey: inboundInvoiceKeys.details(organizationId, invoiceId) });

// only that invoice's comments
queryClient.invalidateQueries({ queryKey: inboundInvoiceKeys.comments(organizationId, invoiceId) });

// refetch only the list, not individual invoice caches
queryClient.invalidateQueries({ queryKey: inboundInvoiceKeys.list(organizationId), exact: true });
```

**❌ Avoid: raw key array or wrong scope**

```ts
// misses sub-resources that use a different prefix
queryClient.invalidateQueries({ queryKey: [organizationId, 'inbound-invoices', invoiceId, 'comments'] });

// too broad — clears unrelated scopes
queryClient.invalidateQueries({ queryKey: [organizationId] });
```

## Exceptions

- None.

## Recap

- Invalidate via the key factory, at the broadest matching prefix.
- `details(...)` invalidation cascades to `comments(...)`.
- `exact: true` when you only want the list.
