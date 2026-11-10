# Keep the default happy-dom environment

> _Tests run in happy-dom; a file opts into jsdom only when happy-dom cannot support what it needs._

## TL;DR

- Do nothing: happy-dom is the configured default.
- Add `// @vitest-environment jsdom` at the top of the file only when happy-dom is genuinely insufficient.
- Never add the pragma preventively or by copy-paste.

## Why

happy-dom is several times faster to boot than jsdom, and with a few thousand component tests that difference is most of the suite runtime, locally and in CI. The pragma spreads by copy-paste: one test genuinely needed jsdom, the next author copied the file as a starting point, and the suite slowly gets slower for no reason. Keeping the opt-in deliberate and rare is what preserves the speed.

## Rules

- Test files **MUST** run in the default happy-dom environment.
- `// @vitest-environment jsdom` **MUST** be added only when a required DOM API is missing or misbehaving in happy-dom.
- A file carrying the jsdom pragma **SHOULD** state in a comment which API forced the switch.

## Example

**❌ Avoid: pragma copied into a test that doesn't need it**

```tsx
// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import { render } from "src/test/render-with-providers";

it("shows the invoice label", () => {
  render(<InvoiceHeader />);

  expect(screen.getByRole("heading", { name: "Facture 42" })).toBeVisible();
});
```

**✅ Do this: default environment, no pragma**

```tsx
import { screen } from "@testing-library/react";
import { render } from "src/test/render-with-providers";

it("shows the invoice label", () => {
  render(<InvoiceHeader />);

  expect(screen.getByRole("heading", { name: "Facture 42" })).toBeVisible();
});
```

## Exceptions

- **A DOM API happy-dom does not implement** (some layout, range, or canvas APIs): add the pragma and name the API in a comment.
- **A third-party library that only works under jsdom**: same, with the library named.

## Recap

- happy-dom by default, jsdom by exception with a stated reason.
- Adding the pragma to a whole folder is a red flag, not a fix.
