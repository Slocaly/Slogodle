# Follow the Testing Library query priority

> _Query elements the way a user finds them: role first, then label, then text; `getByTestId` is a last resort you never introduce._

## TL;DR

- Prefer `getByRole`, then `getByLabelText`, then `getByPlaceholderText`, `getByText`, `getByDisplayValue`, `getByAltText`, `getByTitle`.
- `getByTestId` is last, and you **MUST NOT** add a `data-testid` yourself.
- Picking the highest query that works also proves the element is accessible.

## Why

A `data-testid` is invisible to users and to assistive technology, so a suite built on test ids passes on a button with no accessible name, no label on an input, and an icon with no `alt`. Querying by role forces the markup to expose the same affordances a screen reader needs, which turns the test suite into a cheap accessibility check. Test ids also add markup that exists only for tests and quietly outlives the tests that used it.

## Rules

- Queries **MUST** use the highest applicable option in this order: `getByRole`, `getByLabelText`, `getByPlaceholderText`, `getByText`, `getByDisplayValue`, `getByAltText`, `getByTitle`, `getByTestId`.
- A `data-testid` attribute **MUST NOT** be added to production markup to make an element queryable.
- When no accessible query works, the fix **SHOULD** be to give the element an accessible name, not to add a test id.
- Queries **MUST NOT** rely on class names, DOM structure, or `container.querySelector`.

See the [Testing Library query priority](https://testing-library.com/docs/queries/about/#priority) for the reference list.

## Example

**❌ Avoid: test id and structural queries**

```tsx
expect(screen.getByTestId("delete-invoice-button")).toBeVisible();
expect(container.querySelector(".invoice-header h1")).toBeVisible();
```

Both pass on a button with no accessible name and break on any refactor of the markup.

**✅ Do this: query by role and label**

```tsx
expect(screen.getByRole("button", { name: "Supprimer la facture" })).toBeVisible();
expect(screen.getByLabelText("Montant TTC")).toHaveValue("1 200,00 €");
```

## Exceptions

- **An existing `data-testid` already in the markup** may be used rather than adding new markup, but do not add more.
- **Third-party components with no accessible handle** may require a test id; wrap them once and comment why.

## Recap

- Role, then label, then text. Test id only when nothing else exists.
- If no accessible query works, the component has an accessibility bug, not a testing problem.
