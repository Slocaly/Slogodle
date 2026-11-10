import { authClient } from "src/lib/auth-client";

type SessionState = { user: { name: string } } | "anonymous" | "pending";

/**
 * Sets what `authClient.useSession()` returns. The test file must declare
 * `vi.mock("src/lib/auth-client", ...)` itself (vi.mock is hoisted per file).
 */
export function mockAuthSession(state: SessionState) {
  const isPending = state === "pending";
  const data = isPending || state === "anonymous" ? null : state;
  vi.mocked(authClient.useSession).mockReturnValue({
    data,
    isPending,
  } as ReturnType<typeof authClient.useSession>);
}
