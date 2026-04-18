import type { SharedContent } from './types'

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'

const URL_ONLY_RE = /^https?:\/\/\S+$/i

export function isUrlOnly(text: string | null): boolean {
  if (!text) return false
  return URL_ONLY_RE.test(text.trim())
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
}

function extractMeta(html: string, property: string): string | null {
  const esc = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${esc}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${esc}["']`, 'i'),
  ]
  for (const re of patterns) {
    const m = html.match(re)
    if (m?.[1]) return decodeEntities(m[1])
  }
  return null
}

async function downloadImage(imageUrl: string): Promise<{ uri: string; mimeType: string } | null> {
  try {
    const { File, Paths } = require('expo-file-system') as typeof import('expo-file-system')
    const file = new File(Paths.cache, `og-${Date.now()}.jpg`)
    const downloaded = await File.downloadFileAsync(imageUrl, file)
    return { uri: downloaded.uri, mimeType: 'image/jpeg' }
  } catch {
    return null
  }
}

export async function hydrateFromUrl(url: string): Promise<SharedContent | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    if (!res.ok) return null
    const html = await res.text()

    const ogTitle = extractMeta(html, 'og:title')
    const ogDescription = extractMeta(html, 'og:description')
    const ogImage = extractMeta(html, 'og:image')
    const twitterImage = extractMeta(html, 'twitter:image')

    const textParts = [ogTitle, ogDescription].filter(Boolean) as string[]
    const text = textParts.length ? textParts.join('\n') : null

    const imageSource = ogImage || twitterImage
    const image = imageSource ? await downloadImage(imageSource) : null

    if (!text && !image) return null

    return {
      text,
      imageUri: image?.uri ?? null,
      mimeType: image?.mimeType ?? null,
    }
  } catch {
    return null
  }
}
