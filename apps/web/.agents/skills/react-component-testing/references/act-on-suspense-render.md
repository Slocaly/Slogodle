# Wrap suspense renders in act

> _When the rendered tree uses a suspense query, `await act(() => render(...))` so the suspended update flushes before the assertions._

## TL;DR

- Tree contains a `use<Entity>SuspenseQuery` (in the component or any parent)? Wrap the render: `await act(() => render(<MyComponent />))`.
- Put the wrapped render in an `async render<Component>` helper and `await` it in every test.
- This is what removes the "not wrapped in act(...)" warning on suspense trees.

## Why

A suspense query throws a promise on first render. React resolves it outside the test's synchronous flow, so the state update lands after the test body has moved on. React logs "An update to X inside a test was not wrapped in act(...)", assertions run against a fallback that is still on screen, and the failure looks random. Awaiting `act` flushes the suspended update before the first assertion, which turns an intermittent failure into a deterministic one.

## Rules

- When the component under test, or any parent in the rendered tree, uses a suspense query hook, the `render` call **MUST** be wrapped in `await act(() => render(...))`.
- The wrapped render **SHOULD** be extracted into an `async render<Component>` helper, awaited at the start of each test.
- A suspense render **MUST NOT** be followed by assertions that run before the awaited `act` resolves.

## Example

**❌ Avoid: unwrapped render on a suspense tree**

```tsx
it("shows data", () => {
  render(<MyComponent />);

  expect(screen.getByText("Données chargées")).toBeVisible();
});
```

Warning in the output, and the assertion races the suspended update.

**✅ Do this: await act around the render**

```tsx
import { act, screen } from "@testing-library/react";
import { render } from "src/test/render-with-providers";

const renderMyComponent = async () => {
  await act(() => render(<MyComponent />));
};

it("shows data", async () => {
  await renderMyComponent();

  expect(await screen.findByText("Données chargées")).toBeVisible();
});
```

## Exceptions

- **Non-suspense queries** (`use<Entity>Query`) expose loading state instead of suspending: assert the loading UI, then use `findBy*` for the loaded UI. No `act` needed.
- **Asserting the fallback itself** is a valid reason to render without `act`, since you want to observe the suspended state.

## Recap

- Suspense in the tree means `await act(() => render(...))`.
- An `act` warning in a test output is this rule telling you it was skipped.
