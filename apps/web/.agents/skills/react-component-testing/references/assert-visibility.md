# Assert visibility, not presence

> _Presence uses `getBy*` with `.toBeVisible()`; absence uses `queryBy*` with `.not.toBeInTheDocument()`._

## TL;DR

- Element is shown → `expect(screen.getByRole(...)).toBeVisible()`.
- Element is gone → `expect(screen.queryByRole(...)).not.toBeInTheDocument()`.
- Never `getBy*` for an absence: it throws instead of failing on the assertion.

## Why

`.toBeInTheDocument()` passes on an element hidden by `display: none`, `visibility: hidden`, or the `hidden` attribute. A collapsed panel, a modal that never opened, a toast still faded out: all in the document, none visible to anyone. Visibility is what the user actually experiences, so it is what the assertion should check. On the absence side, `getBy*` throws its own "unable to find element" error before the assertion runs, which produces a confusing failure instead of a clean diff.

## Rules

- An assertion that an element is shown **MUST** use `.toBeVisible()` rather than `.toBeInTheDocument()`.
- An assertion that an element is absent **MUST** use `queryBy*` with `.not.toBeInTheDocument()`.
- `getBy*` **MUST NOT** be used to assert absence.

## Example

**❌ Avoid: presence check and getBy on an absence**

```tsx
expect(screen.getByRole("dialog")).toBeInTheDocument();
expect(screen.getByRole("button", { name: "Supprimer la facture" })).toBeNull();
```

The first passes on a hidden dialog; the second throws before it can fail properly.

**✅ Do this**

```tsx
expect(screen.getByRole("dialog")).toBeVisible();
expect(screen.queryByRole("button", { name: "Supprimer la facture" })).not.toBeInTheDocument();
```

## Exceptions

- **Deliberately hidden but present elements** (a visually hidden live region, an `aria-hidden` decoration) are asserted with `.toBeInTheDocument()`, since visibility is not the point.
- **Elements rendered outside the visible flow** whose styling happy-dom does not compute may need `.toBeInTheDocument()`; note why in the test.

## Recap

- Shown → `getBy*` + `.toBeVisible()`. Gone → `queryBy*` + `.not.toBeInTheDocument()`.
- `.toBeInTheDocument()` on a visible element hides bugs in collapsed and unopened UI.
