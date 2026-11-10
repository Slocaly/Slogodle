# Colocate tests in __tests__

> _A component test lives in a `__tests__` folder next to the component and is named after it._

## TL;DR

- Put the test in a `__tests__` folder **next to** the component under test.
- Name the file `<ComponentName>.test.tsx`.
- No central `tests/` mirror directory.

## Why

A mirrored test tree drifts: the component moves, the test stays behind, and nobody notices until the folder is full of tests for components that no longer exist. Colocation makes the test move with the component in the same rename, shows reviewers at a glance whether a component is covered, and keeps the relative import to the component one level deep.

## Rules

- A component test **MUST** live in a `__tests__` folder placed next to the component under test.
- The `__tests__` folder **MUST** be a sibling of the component file, inside the same folder.
- The test file **MUST** be named after the component: `<ComponentName>.test.tsx`.
- A `__tests__` folder **MUST NOT** hold tests for components that live in a different folder.
- Component tests **MUST NOT** live in a central directory that mirrors the source tree.

## Example

**❌ Avoid: mirrored test tree**

```text
src/
  components/MyComponent/MyComponent.tsx
tests/
  components/MyComponent.test.tsx
```

**❌ Avoid: __tests__ holding tests for a component in another folder**

```text
some-feature/_components/
  AccountingEntries/
    AccountingEntries.tsx
  __tests__/
    AccountingEntries.test.tsx
```

**✅ Do this: colocated**

```text
MyComponent/
  MyComponent.tsx
  __tests__/
    MyComponent.test.tsx
```

**✅ Do this: recursive — each owned sub-component folder has its own __tests__**

```text
some-feature/_components/
  AccountingEntries/
    AccountingEntries.tsx
    __tests__/
      AccountingEntries.test.tsx
    AccountingEntryCard/
      AccountingEntryCard.tsx
      __tests__/
        AccountingEntryCard.test.tsx
```

## Exceptions

- **Cross-component integration tests** that cover a whole page or flow live in the `__tests__` folder of the page or route that owns the flow, named after that page.

## Recap

- `__tests__` next to the component, file named after the component.
- One `__tests__` per component folder, all the way down the sub-component tree.
- Move the component, move its `__tests__` folder with it.
