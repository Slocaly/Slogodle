import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  return createTanStackRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    scrollRestoration: true,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
