# Ship tests with a clean output

> _A test that emits a warning is not finished: fix the cause before it ships._

## TL;DR

- A new or modified test **MUST** produce no warning in the output.
- Fix the cause: `act` warnings, missing keys, unhandled rejections, deprecated APIs.
- Silencing the console instead of fixing the cause does not count.

## Why

Warnings are the suite telling you the test does not reflect how the component behaves. An `act` warning means an assertion ran against a stale render; an unhandled rejection means a code path failed and nobody noticed. Once a few are tolerated, the output becomes noise nobody reads, and the real warning from the next change scrolls past unseen. Keeping it clean is what makes a warning worth reacting to.

## Rules

- A new or modified test **MUST NOT** emit warnings when the suite runs.
- Every warning **MUST** be fixed at its cause: React `act` warnings, missing `key` props, unhandled promise rejections, deprecated API usage.
- Warnings **MUST NOT** be hidden by stubbing `console.warn` or `console.error`.
- A test emitting warnings **MUST NOT** be merged.

## Example

**❌ Avoid: muting the console**

```tsx
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
```

The `act` warning is gone and so is every future signal from this file.

**✅ Do this: fix the cause**

```tsx
const renderMyComponent = async () => {
  await act(() => render(<MyComponent />));
};
```

## Exceptions

- **A warning emitted on purpose by the code under test** (a deprecation notice you are asserting on) may be asserted with a spy, provided the assertion is the point of the test.

## Recap

- Clean output is part of the definition of done for a test.
- Fix the cause; muting the console removes the signal, not the bug.
