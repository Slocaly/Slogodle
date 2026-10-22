import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import globalCss from '../styles/global.css?url'
import { getLocale } from '../paraglide/runtime.js'
import { m } from '../paraglide/messages.js'
import { NotFoundPage } from '../components/NotFoundPage'

const queryClient = new QueryClient()

// Link-preview crawlers ignore relative URLs, so OG tags need the absolute production URL.
const SITE_URL = 'https://tech.slogodle.com'
// Rendered from apps/video with `pnpm run render:og`; crawlers don't accept SVG.
const OG_IMAGE_URL = `${SITE_URL}/og-image.png`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width' },
      { title: m.site_title() },
      { name: 'description', content: m.site_description() },
      { name: 'theme-color', content: '#f4a6c6' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: m.site_title() },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:title', content: m.site_title() },
      { property: 'og:description', content: m.site_description() },
      { property: 'og:image', content: OG_IMAGE_URL },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: m.site_description() },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: m.site_title() },
      { name: 'twitter:description', content: m.site_description() },
      { name: 'twitter:image', content: OG_IMAGE_URL },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap',
      },
      { rel: 'stylesheet', href: globalCss },
    ],
    scripts: [{ src: '/theme-init.js' }],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})

function RootComponent() {
  return (
    <html lang={getLocale()}>
      <head>
        <HeadContent />
      </head>
      <body>
        <a href="#main" className="skip-link">
          {m.skip_to_content()}
        </a>
        <QueryClientProvider client={queryClient}>
          <NuqsAdapter>
            <Outlet />
          </NuqsAdapter>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
