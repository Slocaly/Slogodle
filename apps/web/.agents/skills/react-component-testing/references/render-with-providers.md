# Render through the shared providers

> _Component tests render through `src/test/render-with-providers`, import `screen` from Testing Library, and hide repeated setup behind a local render helper._

## TL;DR

- Import `render` (and `renderHook`) from `src/test/render-with-providers`, never from `@testing-library/react`.
- Import `screen` from `@testing-library/react`; do not destructure it from the `render` return value.
- Repeated wrappers, defaults, or props go in a local `render<Component>` helper at the top of the `describe`.

## Why

Components depend on providers they never mention: query client, i18n, theme, router. Rendering with the bare Testing Library `render` throws a context error, and the usual reaction is to bolt providers onto that one test. The suite ends up with a dozen slightly different provider stacks, and adding a global provider means editing every test. One shared render keeps that setup in a single file. Destructured queries scoped to a container also silently miss anything rendered in a portal, which is most of our modals and dropdowns.

## Rules

- Tests **MUST** import `render` and `renderHook` from `src/test/render-with-providers`.
- Tests **MUST NOT** import `render` from `@testing-library/react`.
- `screen` **MUST** be imported from `@testing-library/react` and **MUST NOT** be destructured from the `render` return value.
- A render that needs several wrappers, default values, or props **SHOULD** be extracted into a local `render<Component>` helper declared at the top of the `describe` block.
- Components that read URL search params **MUST** be wrapped in `NuqsTestingAdapter` from `nuqs/adapters/testing`.

## Example

**❌ Avoid: bare Testing Library render and destructured queries**

```tsx
import { render } from "@testing-library/react";

const { getByRole } = render(<MyComponent />);

expect(getByRole("dialog")).toBeVisible();
```

**✅ Do this: shared render, screen from Testing Library**

```tsx
import { screen } from "@testing-library/react";
import { render } from "src/test/render-with-providers";

render(<MyComponent />);

expect(screen.getByRole("dialog")).toBeVisible();
```

**✅ Do this: local helper for a repeated setup**

```tsx
const renderSelectRegionalBankForm = (formValues?: Partial<FormValues>) =>
  render(
    <TestFormProvider options={{ defaultValues: { ...defaultFormValues, ...formValues } }}>
      <SelectRegionalBankForm />
    </TestFormProvider>,
  );
```

## Exceptions

- **Testing `render-with-providers` itself**, or a provider in isolation, may use the Testing Library `render` directly.
- **`within(element)`** is the intended way to scope queries to a subtree; that is not the same as destructuring the render result.

## Recap

- `render` from `src/test/render-with-providers`, `screen` from `@testing-library/react`.
- Repeated setup becomes a `render<Component>` helper, not copy-paste.
