# Interact with user-event

> _User interactions go through `@testing-library/user-event`, with `userEvent.setup()` called at the start of every test that interacts._

## TL;DR

- Use `userEvent` for clicks, typing, tabbing, and selection; not `fireEvent`.
- Call `const user = userEvent.setup()` at the start of each interacting test.
- Always `await` the interaction.

## Why

`fireEvent.click` dispatches one synthetic event. A real click also produces pointer, mouse down/up, and focus events, and it does nothing on a disabled or pointer-events-none element. That gap is where bugs hide: the test clicks a button the user physically cannot reach, and the feature ships broken. `userEvent` replays the full sequence and respects those guards. Calling `setup()` per test keeps the pointer and keyboard state isolated, so a test that leaves focus somewhere odd can't corrupt the next one.

## Rules

- Interactions **MUST** use `@testing-library/user-event`.
- `fireEvent` **MUST NOT** be used when a `userEvent` API covers the interaction.
- Every test performing an interaction **MUST** call `userEvent.setup()` at its start and use the returned instance.
- Every `userEvent` call **MUST** be awaited.

## Example

**❌ Avoid: fireEvent and a shared instance**

```tsx
import { fireEvent } from "@testing-library/react";

it("submits the form", () => {
  render(<MyForm />);

  fireEvent.click(screen.getByRole("button", { name: "Valider" }));

  expect(screen.getByText("Enregistré")).toBeVisible();
});
```

The click lands even if the button is disabled, so the test passes on a form the user cannot submit.

**✅ Do this: user-event with setup per test**

```tsx
import userEvent from "@testing-library/user-event";

it("submits the form", async () => {
  const user = userEvent.setup();
  render(<MyForm />);

  await user.click(screen.getByRole("button", { name: "Valider" }));

  expect(await screen.findByText("Enregistré")).toBeVisible();
});
```

## Exceptions

- **Events with no `userEvent` equivalent** (`scroll`, `resize`, a custom DOM event, a `drop` payload that `userEvent` cannot build): `fireEvent` is the right tool.
- **Fake timers** require `userEvent.setup({ advanceTimers })` rather than a bare `setup()`.

## Recap

- `const user = userEvent.setup()` first, then `await user.click(...)`.
- Reach for `fireEvent` only when `userEvent` has no equivalent.
