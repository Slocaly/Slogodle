# Assert behavior, not implementation

> _A component test asserts what the user sees and can do, never the internals that produce it._

## TL;DR

- Assert visible text, roles, links, form values, and navigation.
- Never assert on internal state, hook calls, or the component tree.
- If the assertion would survive a rewrite of the component, it is the right assertion.

## Why

Tests coupled to internals turn every refactor into a test rewrite. Rename a hook, extract a subcomponent, or swap `useState` for a reducer, and a suite full of `expect(useSubmitForm).toHaveBeenCalled()` goes red even though the product still works. Worse, those tests pass while the button stays disabled and the user can't submit. Asserting the outcome is the only way a test keeps its value across refactors.

## Rules

- Assertions **MUST** target user-observable output: visible text, roles, labels, links, form values, navigation.
- Tests **MUST NOT** assert that a hook or an internal function was called, when the resulting UI can be asserted instead.
- Tests **MUST NOT** assert on internal component state or on the shape of the rendered component tree.

## Example

**❌ Avoid: asserting internals**

```tsx
expect(useSubmitForm).toHaveBeenCalled();
expect(wrapper.find("InternalPanel")).toHaveLength(1);
```

Both pass while the user stares at a broken screen, and both break on a rename that changes nothing.

**✅ Do this: assert the outcome**

```tsx
expect(screen.getByRole("button", { name: "Enregistrer" })).toBeEnabled();

await user.click(screen.getByRole("button", { name: "Enregistrer" }));

expect(screen.getByText("Facture enregistrée")).toBeVisible();
```

## Exceptions

- **Callback props** exposed by the component under test are part of its public contract: asserting `onChange` was called with the right payload is behavior, not implementation.
- **Analytics and tracking calls** have no visible output; assert the emitted event directly.

## Recap

- Assert what the user perceives, not how the component gets there.
- A good component test survives a full rewrite of the component's internals.
