# Use the shared test utilities

> _Permissions, feature flags, form context, and search params are controlled through the helpers in `src/test`, never by re-mocking what `setup.ts` already mocks._

## TL;DR

- Check `src/test` before writing any custom mock.
- `mockCan` for permissions, `mockFeatureFlags` for flags, `TestFormProvider` for form context, `NuqsTestingAdapter` for search params.
- `useCan` and `getFeatureFlags` are already mocked globally in `src/test/setup.ts`: override the values, do not re-mock the module.

## Why

Re-mocking `useCan` or `getFeatureFlags` in a test file replaces the global mock with a partial one, so anything the component reads that the local mock forgot comes back `undefined` and the failure points at the component instead of the mock. It also means every change to the permission or flag API has to be applied in dozens of test files. The helpers give one place to update and a single, well-formed default shape.

| Need | Utility | Import |
| --- | --- | --- |
| Permissions | `mockCan` | `src/test/mock-can` |
| Feature flags | `mockFeatureFlags` | `src/test/mock-feature-flags` |
| React Hook Form context | `TestFormProvider` | `src/test/TestFormProvider` |
| URL search params | `NuqsTestingAdapter` | `nuqs/adapters/testing` |

## Rules

- Before writing a custom mock or helper, `src/test` **MUST** be checked for an existing utility.
- Permissions **MUST** be overridden with `mockCan`; `useCan` **MUST NOT** be re-mocked in a test file.
- Feature flags **MUST** be overridden with `mockFeatureFlags`; `getFeatureFlags` and `useSuspenseFeatureFlags` **MUST NOT** be re-mocked in a test file.
- When a component reads several flags at once, every flag **MUST** be passed explicitly, since `isEnabled` requires all listed flags to be `true`.
- Components relying on `useFormContext` **MUST** be wrapped in `TestFormProvider`.

## Example

**❌ Avoid: re-mocking a global**

```tsx
vi.mock("src/hooks/useCan", () => ({
  useCan: () => ({ deleteInboundInvoice: { isAllowed: false } }),
}));
```

Every other permission the component reads is now `undefined`.

**✅ Do this: override through the helpers**

```tsx
mockCan({
  deleteInboundInvoice: { isAllowed: false, reason: "role" },
});
```

**✅ Do this: one flag value per scenario**

```tsx
import { mockFeatureFlags } from "src/test/mock-feature-flags";

it("shows the addons entry when the flag is enabled", () => {
  mockFeatureFlags({ ADDONS: true });
  render(<SettingsMenu />);

  expect(screen.getByRole("link", { name: "Packs" })).toBeVisible();
});

it("hides the addons entry when the flag is disabled", () => {
  mockFeatureFlags({ ADDONS: false });
  render(<SettingsMenu />);

  expect(screen.queryByRole("link", { name: "Packs" })).not.toBeInTheDocument();
});
```

**✅ Do this: form context through TestFormProvider**

```tsx
render(
  <TestFormProvider options={{ defaultValues: { name: "" } }}>
    <MyForm />
  </TestFormProvider>,
);
```

## Exceptions

- **A need with no existing utility**: add the helper to `src/test` so the next test reuses it, rather than keeping it local to one file.

## Recap

- Look in `src/test` first; add helpers there when something is missing.
- Override globals with `mockCan` / `mockFeatureFlags`; never re-mock them.
