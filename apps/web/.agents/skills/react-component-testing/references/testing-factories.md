# Build mock data with createTesting factories

> _Mock entities come from a `createTesting*` factory in `src/test`, overriding only the fields the scenario cares about._

## TL;DR

- Need a mock entity? Use `createTesting<Entity>` from `src/test`.
- New factory → `create-testing-<entity>.ts`, matching the import path of existing factories for that entity.
- Pass only the fields the test depends on; the factory supplies the rest.

## Why

Hand-written object literals go stale the moment a field is added to the entity: the type error appears in fifty test files at once, and each one gets patched with a different placeholder. A factory absorbs that change in one place. It also makes the test readable, because the two fields the test actually depends on are the only two written down, instead of being buried in thirty lines of filler.

## Rules

- A mock entity **MUST** be built with a `createTesting<Entity>` factory from `src/test`.
- Entity literals **MUST NOT** be hand-written inline in a test when a factory exists.
- A new factory **MUST** live in `create-testing-<entity>.ts` and follow the import path already used for that entity.
- A factory call **SHOULD** override only the fields the scenario depends on.

## Example

**❌ Avoid: hand-written entity literal**

```tsx
vi.mocked(getOrganization).mockResolvedValue({
  outcome: "found",
  entity: {
    id: "org-1",
    name: "Acme",
    siren: "732829320",
    createdAt: new Date(),
    // …every other required field, restated in every test
  },
});
```

**✅ Do this: factory with a targeted override**

```tsx
import { createTestingOrganization } from "src/test/create-testing-organization";

vi.mocked(getOrganization).mockResolvedValue({
  outcome: "found",
  entity: createTestingOrganization({ name: "Acme" }),
});
```

## Exceptions

- **Small local shapes** that are not domain entities (a props object, a two-field API payload used in one test) do not need a factory.

## Recap

- `createTesting<Entity>` from `src/test`, override only what matters.
- Missing factory? Create `create-testing-<entity>.ts` instead of an inline literal.
