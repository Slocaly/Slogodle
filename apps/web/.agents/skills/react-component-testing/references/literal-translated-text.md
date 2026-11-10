# Query the rendered string, not the i18n key

> _Text queries and assertions use the literal string the user reads, never `t('namespace:key')`._

## TL;DR

- Write the rendered French string: `{ name: 'Supprimer la facture' }`.
- Never call `t()` inside a query or an assertion.
- The test then fails when the wording breaks, which is the point.

## Why

`t('inboundInvoice:actions.delete')` in a test compares the component's translation lookup with the test's translation lookup. Both read the same file, so the assertion is true no matter what the file contains. Delete the key, mistype it, or ship an empty string and the test stays green while the button renders blank. The literal string is an independent expectation, and it makes the test readable: a reviewer sees the actual UI copy instead of resolving a key by hand.

## Rules

- Text-based queries and assertions **MUST** use the literal rendered string.
- Tests **MUST NOT** call `t()` or read a translation resource to build an expected string.
- The literal **MUST** match the default locale copy (French) as rendered.

## Example

**❌ Avoid: asserting against the translation function**

```tsx
expect(screen.getByRole("button", { name: t("inboundInvoice:actions.delete") })).toBeVisible();
```

Both sides resolve the same key, so the assertion cannot fail on a broken translation.

**✅ Do this: the string the user reads**

```tsx
expect(screen.getByRole("button", { name: "Supprimer la facture" })).toBeVisible();
```

## Exceptions

- **Tests of the i18n plumbing itself** (a `Trans` wrapper, an interpolation helper) legitimately reference keys, because the key handling is the behavior under test.
- **Interpolated copy** may be asserted with a regular expression when a dynamic value sits inside the sentence.

## Recap

- Assert the sentence the user reads, not the key that produced it.
- A `t()` call inside an expectation is an assertion comparing a value to itself.
