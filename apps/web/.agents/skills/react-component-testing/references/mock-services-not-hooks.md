# Mock services, not hooks or children

> _Cut the dependency at the service function the query calls, never at the query hook or the child component._

## TL;DR

- Mock the service function (`getInboundInvoice`, `createInvoicePayment`, …) that a `queryFn` / `mutationFn` calls.
- Never mock TanStack Query hooks, child components, or child hooks.
- Configure return values with `vi.mocked(fn)` in `beforeEach` or in the test.

## Why

Mocking `useInboundInvoiceSuspenseQuery` replaces the whole data layer with a hand-written object, so the test no longer exercises the query key, the `select`, the error mapping, or the suspense boundary. It also freezes the shape of the mock: the service can start returning something different and the test stays green. Mocking child components has the same effect on the render tree, hiding the integration that the component test exists to cover. The service boundary is the one place where cutting is genuinely a network call and nothing else.

## Rules

- Data dependencies **MUST** be mocked at the service function called by `queryFn` / `mutationFn`.
- TanStack Query hooks (`use<X>Query`, `use<X>SuspenseQuery`, `use<X>Mutation`) **MUST NOT** be mocked when the underlying service can be mocked instead.
- Child React components and child hooks **MUST NOT** be mocked.
- Globals already mocked in `src/test/setup.ts` (`useCan`, `next/navigation`, `getFeatureFlags`, auth, analytics) **MUST NOT** be re-mocked at file level.
- Mock declarations **MUST** sit above the tests and return values **MUST** be configured with `vi.mocked(fn)` (see [mocks-above-tests](mocks-above-tests.md)).

## Example

**❌ Avoid: mocking the query hook**

```tsx
vi.mock("./useInboundInvoiceQuery", () => ({
  useInboundInvoiceSuspenseQuery: vi.fn().mockReturnValue({ data: invoice }),
}));
```

The query key, the `select`, and the suspense boundary are now untested.

**✅ Do this: mock the underlying service**

```tsx
import { getInboundInvoice } from "src/services/inbound-invoices/get-inbound-invoice.services";

vi.mock("src/services/inbound-invoices/get-inbound-invoice.services", () => ({
  getInboundInvoice: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(getInboundInvoice).mockResolvedValue(createTestingImportedInboundInvoice());
});
```

**✅ Do this: full test file shape**

```tsx
import { act, screen } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { createTestingImportedInboundInvoice } from "src/test/createTestingInboundInvoice";
import { mockCan } from "src/test/mock-can";
import { mockInboundInvoiceFeatureFlag } from "src/test/mock-inbound-invoice-feature-flag";
import { render } from "src/test/render-with-providers";
import { InboundInvoiceHeader } from "../_components/InboundInvoiceHeader/InboundInvoiceHeader";

vi.setConfig({ restoreMocks: true });

vi.mock("src/services/inbound-invoices/get-inbound-invoice.services", async () => {
  const { createTestingImportedInboundInvoice } = await import("src/test/createTestingInboundInvoice");

  return {
    getInboundInvoice: vi.fn(async () => createTestingImportedInboundInvoice()),
  };
});

const renderInboundInvoiceHeader = async () => {
  await act(() =>
    render(
      <NuqsTestingAdapter>
        <InboundInvoiceHeader />
      </NuqsTestingAdapter>,
    ),
  );
};

describe("InboundInvoiceHeader", () => {
  it("shows the delete action", async () => {
    mockInboundInvoiceFeatureFlag();
    await renderInboundInvoiceHeader();

    expect(screen.getByRole("button", { name: "Supprimer la facture" })).toBeVisible();
  });

  it("hides the delete action when the user lacks permission", async () => {
    mockCan({ deleteInboundInvoice: { isAllowed: false, reason: "role" } });
    mockInboundInvoiceFeatureFlag();
    await renderInboundInvoiceHeader();

    expect(screen.queryByRole("button", { name: "Supprimer la facture" })).not.toBeInTheDocument();
  });
});
```

## Exceptions

- **A child that cannot run in the test environment** (a canvas renderer, a PDF viewer, a map SDK) may be mocked; say why in a comment.
- **A hook with no service behind it** (a browser API wrapper, a timer-based hook) is mocked directly, since there is no lower boundary to cut at.

## Recap

- Cut at the service, keep the query layer and the child tree real.
- A `vi.mock` on a `use…Query` hook or a child component needs a written justification.
