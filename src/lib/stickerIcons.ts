// src/lib/stickerIcons.ts
// Bakes a solid white "sticker" outline around a transparent icon's silhouette,
// once per icon (cached), so the pile can display it as a plain <img> with no
// per-frame filter cost — a live CSS drop-shadow stack was too expensive to
// animate across dozens of physics-driven elements at once.

const BORDER_RATIO = 0.16
const MIN_BORDER_PX = 10
const RING_STEPS = 24

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load icon: ${src}`))
    img.src = src
  })
}

async function buildStickerIcon(src: string): Promise<string> {
  const img = await loadImage(src)
  const w = img.naturalWidth
  const h = img.naturalHeight
  const border = Math.max(MIN_BORDER_PX, Math.round(Math.max(w, h) * BORDER_RATIO))

  // A white silhouette of the icon, used to stamp the outline ring.
  const silhouette = document.createElement('canvas')
  silhouette.width = w
  silhouette.height = h
  const sctx = silhouette.getContext('2d')
  if (!sctx) return src
  sctx.drawImage(img, 0, 0, w, h)
  sctx.globalCompositeOperation = 'source-in'
  sctx.fillStyle = '#fff'
  sctx.fillRect(0, 0, w, h)

  const canvas = document.createElement('canvas')
  canvas.width = w + border * 2
  canvas.height = h + border * 2
  const ctx = canvas.getContext('2d')
  if (!ctx) return src

  for (let i = 0; i < RING_STEPS; i++) {
    const angle = (i / RING_STEPS) * Math.PI * 2
    const dx = Math.cos(angle) * border
    const dy = Math.sin(angle) * border
    ctx.drawImage(silhouette, border + dx, border + dy)
  }
  ctx.drawImage(img, border, border, w, h)

  return canvas.toDataURL('image/png')
}

const cache = new Map<string, Promise<string>>()

/** Returns a cached data URL for the icon with a baked-in white sticker border. */
export function getStickerIconSrc(src: string): Promise<string> {
  let cached = cache.get(src)
  if (!cached) {
    cached = buildStickerIcon(src).catch(() => src)
    cache.set(src, cached)
  }
  return cached
}
