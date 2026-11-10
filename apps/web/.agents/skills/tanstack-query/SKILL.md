---
name: tanstack-query
description: Conventions for TanStack Query (React Query) in React/Next.js code. Use when writing or changing a `useQuery`/`useSuspenseQuery` call, a `queryOptions` factory, a query key, a query hook (naming, file placement), or when invalidating/prefetching the cache after a mutation.
---

# TanStack Query

How I structure data fetching: one pure `queryOptions` factory per query, keys built from a hierarchical key factory, and every component consuming data through a dedicated hook.

## Core principles

1. **Never call `useQuery` / `useSuspenseQuery` inline in a component.** Go through a dedicated `useXQuery` hook (suspense variant by default).
2. **One `XQueryOptions.ts` factory per query**, in its own file: explicit arguments, no hooks, no React context, so it works in hooks, prefetch and cache updates.
3. **Query keys come from a `_constants/*.keys.ts` factory**: they mirror the endpoint path, start with `organizationId`, are built by spreading the parent key, and return `as const`. No raw arrays.
4. **Invalidate through the key factory at the broadest prefix** that covers what changed; `exact: true` to refetch only a list.
5. **Colocate** hook + factory in `_hooks/queries/` next to the consumer; share only when a second feature needs it.

## Layering

```
_constants/<scope>.keys.ts        # key factory
_hooks/queries/<x>QueryOptions.ts # pure queryOptions factory (uses the keys)
_hooks/queries/use<X>Query.ts     # React hook: reads context, spreads the factory
```

## How to use this skill

Read the rules relevant to the task before writing or changing query code; each file has a TL;DR, the rationale, MUST/MUST NOT rules, ❌/✅ examples and exceptions. When creating a new query from scratch, read at least: options-factory, keys-hierarchy, hook-wrapper, hook-naming.

## Rules

- [Colocate query hooks with their consumer](references/colocation.md) — Query hooks and their `queryOptions` factories live together in the `_hooks/queries` folder closest to where they are consumed; promote to a shared location only when a second feature needs the query.
- [Name query hooks after the entity](references/hook-naming.md) — Query hook names derive from the entity they fetch: `use<Entity>Query` for a single record, `useList<Entities>Query` for a collection, with the file name matching the non-suspense hook.
- [Consume queries through a dedicated hook](references/hook-wrapper.md) — Every query is consumed through a dedicated `useXQuery` hook that reads context and spreads its `queryOptions` factory — never by calling `useQuery` inline in a component.
- [Invalidate queries by key prefix](references/invalidation-prefix.md) — Invalidate through the key factory at the broadest level that covers what changed; use `exact: true` to target only the collection list without touching individual entity caches.
- [Build hierarchical query keys that mirror endpoints](references/keys-hierarchy.md) — Query keys live in a `_constants/*.keys.ts` factory, mirror the endpoint path, start with `organizationId`, spread the parent factory, and return `as const` — never inline a raw array.
- [Define a queryOptions factory per query](references/options-factory.md) — Every query defines an `XQueryOptions` factory built with `queryOptions(...)` in its own file, taking all inputs as explicit arguments and reading no React context, so it stays reusable in hooks, prefetch, and cache updates.

## Project-specific conventions

The examples use this project's setup (`organizationId` as first key segment, `useDefinedOrganizationId`, `_hooks/queries` and `_constants` folders, `src/services/...`). Treat them as the reference implementation and adapt names and paths to the project at hand; the principles above are project-independent.
