import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import globalCss from '../styles/global.css?url'
import { getLocale } from '../paraglide/runtime.js'
import { m } from '../paraglide/messages.js'
import { NotFoundPage } from '../components/NotFoundPage'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width' },
      { title: m.site_title() },
      { name: 'description', content: m.site_description() },
      { name: 'theme-color', content: '#f4a6c6' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: m.site_title() },
      { property: 'og:description', content: m.site_description() },
      { property: 'og:image', content: '/favicon.svg' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: m.site_title() },
      { name: 'twitter:description', content: m.site_description() },
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
    scripts: [
      {
        children: `try {
  var v = localStorage.getItem('logodle_dark_v1');
  document.documentElement.dataset.theme = v === '1' ? 'dark' : 'light';
} catch (e) {}`,
      },
    ],
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
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
