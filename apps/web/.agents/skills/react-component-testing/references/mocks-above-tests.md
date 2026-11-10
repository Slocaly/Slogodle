# Declare mocks above the tests

> _Module mock declarations sit at the top of the file, above the first `describe`; only per-scenario values live inside a test._

## TL;DR

- `vi.mock`, `vi.hoisted`, and `vi.setConfig` go at module top level, after the imports and before the first `describe`.
- Never put a `vi.mock` inside a `describe`, an `it`, or a `beforeEach`.
- Per-scenario return values still belong in `beforeEach` or in the test, via `vi.mocked(fn)`.

## Why

Vitest hoists every `vi.mock` call to the top of the module, above the imports, whatever line you wrote it on. A `vi.mock` nested in a `describe` therefore applies to the entire file, including the tests declared before it. The code says "this mock belongs to these tests" and the runtime says otherwise, which is how you get a test that passes alone and fails in the suite. Hoisting also runs the factory before any surrounding variable is initialized, so a nested mock referencing a local const throws "Cannot access before initialization" and sends the author hunting through the wrong file.

Keeping declarations at the top also makes a test file readable in one pass: the reader learns which modules are fake before reading a single assertion, instead of discovering a mock buried three hundred lines down.

## Rules

- `vi.mock`, `vi.hoisted`, and `vi.setConfig` **MUST** be called at module top level, after the imports and before the first `describe`.
- `vi.mock` **MUST NOT** be called inside a `describe`, an `it`, or a hook such as `beforeEach`.
- A value referenced inside a `vi.mock` factory **MUST** be created with `vi.hoisted`.
- Per-scenario return values **MUST** be configured with `vi.mocked(fn)` in `beforeEach` or in the test, and **MUST NOT** be expressed as an extra `vi.mock` call.

## Example

**❌ Avoid: mock nested in a describe**

```ts
describe("InboundInvoiceHeader", () => {
  const invoice = createTestingImportedInboundInvoice();

  vi.mock("src/services/inbound-invoices/get-inbound-invoice.services", () => ({
    getInboundInvoice: vi.fn(async () => invoice),
  }));

  it("shows the invoice number", async () => { /* … */ });
});
```

Hoisting moves the `vi.mock` above the imports, so the factory runs before `invoice` exists and the test fails on initialization, not on the behavior.

**✅ Do this: declarations at the top, values per scenario**

```ts
import { getInboundInvoice } from "src/services/inbound-invoices/get-inbound-invoice.services";
import { createTestingImportedInboundInvoice } from "src/test/createTestingInboundInvoice";

vi.setConfig({ restoreMocks: true });

vi.mock("src/services/inbound-invoices/get-inbound-invoice.services", () => ({
  getInboundInvoice: vi.fn(),
}));

describe("InboundInvoiceHeader", () => {
  beforeEach(() => {
    vi.mocked(getInboundInvoice).mockResolvedValue(createTestingImportedInboundInvoice());
  });

  it("shows a cancelled invoice as cancelled", async () => {
    vi.mocked(getInboundInvoice).mockResolvedValue(
      createTestingImportedInboundInvoice({ status: "cancelled" }),
    );

    /* … */
  });
});
```

**✅ Do this: vi.hoisted when the factory needs a value**

```ts
const { getInboundInvoice } = vi.hoisted(() => ({ getInboundInvoice: vi.fn() }));

vi.mock("src/services/inbound-invoices/get-inbound-invoice.services", () => ({
  getInboundInvoice,
}));
```

## Exceptions

- **`vi.doMock`** is not hoisted and exists precisely to swap a module per test. It **MAY** be called inside a test, and **MUST** be paired with `vi.resetModules()` and a dynamic `import()` of the module under test.

## Recap

- Declarations at the top, values in `beforeEach` or the test.
- A `vi.mock` inside a `describe` applies to the whole file anyway. Vitest hoists it.
