import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import globalCss from '../styles/global.css?url'
import { getLocale } from '../paraglide/runtime.js'
import { m } from '../paraglide/messages.js'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width' },
      { title: m.site_title() },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
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
})

function RootComponent() {
  return (
    <html lang={getLocale()}>
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
