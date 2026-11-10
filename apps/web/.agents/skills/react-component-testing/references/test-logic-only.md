# Test components that carry logic

> _Every component with branching or behavior gets a test; purely presentational components do not._

## TL;DR

- Test any component with conditional rendering, interactions, form behavior, permission gates, or data-driven UI.
- A component that only renders its props with no branching needs no test.
- Coverage follows logic, not file count.

## Why

Chasing a coverage number produces tests that assert a component renders its own markup back at you. They break on every restyle and catch no bug. Meanwhile the branch that hides a button from a user without the permission ships untested and reaches production. Spending test effort where the component makes a decision is what actually prevents regressions, and it keeps the suite fast enough that people run it.

## Rules

- A component that contains conditional rendering, user interactions, form behavior, permission gates, or data-driven UI **MUST** have a test.
- A purely presentational component with no branching and no behavior **MUST NOT** require a test.
- A test **MUST NOT** exist only to raise a coverage metric.

## Example

**❌ Avoid: testing a component with no logic**

```tsx
const InvoiceTitle = ({ label }: InvoiceTitleProps) => <h1>{label}</h1>;

it("renders the label", () => {
  render(<InvoiceTitle label="Facture 42" />);

  expect(screen.getByRole("heading", { name: "Facture 42" })).toBeVisible();
});
```

This test asserts that React renders. It fails only when the markup changes, never when a behavior breaks.

**✅ Do this: test the branch**

```tsx
const DeleteInvoiceButton = () => {
  const { deleteInboundInvoice } = useCan();

  if (!deleteInboundInvoice.isAllowed) return null;

  return <Button>Supprimer la facture</Button>;
};

it("hides the delete action when the user lacks permission", () => {
  mockCan({ deleteInboundInvoice: { isAllowed: false, reason: "role" } });
  render(<DeleteInvoiceButton />);

  expect(screen.queryByRole("button", { name: "Supprimer la facture" })).not.toBeInTheDocument();
});
```

## Exceptions

- **Presentational components with an accessibility contract** (a custom `role`, an `aria-*` wiring, a focus behavior) count as logic: test them.
- **Design-system primitives** published for reuse may be tested even without branching, because their API is a contract for other teams.

## Recap

- Logic in, test in. No logic, no test.
- If the test would break only on a restyle, it is testing the wrong thing.
