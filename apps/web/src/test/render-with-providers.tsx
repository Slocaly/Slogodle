import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render as baseRender } from "@testing-library/react";
import type { ReactElement } from "react";

interface RenderOptions {
  /** URL the in-memory router starts on (components read it through useLocation). */
  path?: string;
}

/**
 * Renders `ui` inside the providers the app gives every component: a TanStack
 * Query client (no retries) and a memory-history TanStack Router. The router
 * has no routes besides the root one that renders `ui`, so any `<Link>` builds
 * its href and navigating updates `router.state.location`.
 *
 * The router mounts asynchronously: `await act(() => render(...))`.
 */
export function render(ui: ReactElement, { path = "/" }: RenderOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createRouter({
    defaultNotFoundComponent: () => null,
    history: createMemoryHistory({ initialEntries: [path] }),
    routeTree: createRootRoute({ component: () => ui }),
  });

  const result = baseRender(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...result, router };
}
