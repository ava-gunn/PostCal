import { reportError } from '../report-error'
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
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

// Instagram OG tags always embed preview-style wrappers around the caption.
// "Church Cantina on Instagram: \"Let's do this again!!\""
// "61 likes, 1 comments - church on April 2, 2026: \"Let's do this again!!\""
// Author = the display name before " on Instagram"; useful as a venue hint.
// Posted date/likes contaminate date parsing, so strip them from the caption text.
const INSTAGRAM_TITLE_RE = /^(.+?)\s+on Instagram:\s*"([\s\S]*)"\s*$/
const INSTAGRAM_DESC_RE = /^\s*[\d,]+\s+likes?(?:,\s*[\d,]+\s+comments?)?\s+-\s+\S+\s+on\s+\w+\s+\d+,\s+\d+:\s*"([\s\S]*?)"\s*\.?\s*$/

function stripInstagramDescription(text: string | null): string | null {
  if (!text) return null
  const m = text.match(INSTAGRAM_DESC_RE)
  return (m?.[1] ?? text).trim() || null
}

function parseInstagramTitle(text: string | null): { author: string | null; caption: string | null } {
  if (!text) return { author: null, caption: null }
  const m = text.match(INSTAGRAM_TITLE_RE)
  if (!m) return { author: null, caption: text.trim() || null }
  return { author: m[1].trim() || null, caption: m[2].trim() || null }
}

// Instagram embeds the full-resolution image URL in its HTML. The og:image is
// a 640×640 cropped thumbnail which OCRs poorly. Try multiple JSON keys.
const IG_IMAGE_KEYS = ['display_url', 'displayUrl', 'src'] as const

function unescapeJsonUrl(s: string): string {
  return s.replace(/\\\//g, '/').replace(/\\u0026/g, '&').replace(/\\u002F/gi, '/')
}

function extractInstagramDisplayUrl(html: string): string | null {
  for (const key of IG_IMAGE_KEYS) {
    const re = new RegExp(`"${key}":"(https:[^"]+\\.(?:jpg|jpeg|png|webp)[^"]*)"`, 'i')
    const m = html.match(re)
    if (m?.[1]) return unescapeJsonUrl(m[1])
  }
  // image_versions2.candidates[0].url
  const versionsMatch = html.match(/"image_versions2":\s*\{[^}]*?"candidates":\s*\[\s*\{[^}]*?"url":"([^"]+)"/)
  if (versionsMatch?.[1]) return unescapeJsonUrl(versionsMatch[1])
  return null
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

export type DownloadImpl = (imageUrl: string) => Promise<{ uri: string; mimeType: string } | null>

const defaultDownloadImage: DownloadImpl = async (imageUrl) => {
  try {
    const { File, Paths } = require('expo-file-system') as typeof import('expo-file-system')
    const file = new File(Paths.cache, `og-${Date.now()}.jpg`)
    const downloaded = await File.downloadFileAsync(imageUrl, file)
    return { uri: downloaded.uri, mimeType: 'image/jpeg' }
  } catch (e) {
    reportError('extract.url', e, { imageUrl, step: 'downloadImage' })
    return null
  }
}

export interface HydrateOptions {
  fetchImpl?: typeof fetch
  downloadImpl?: DownloadImpl
}

export async function hydrateFromUrl(url: string, options: HydrateOptions = {}): Promise<SharedContent | null> {
  const { fetchImpl = fetch, downloadImpl = defaultDownloadImage } = options
  if (__DEV__) console.debug('[hydrate] fetching', url)
  try {
    const res = await fetchImpl(url, {
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    if (__DEV__) console.debug('[hydrate] response', res.status, res.headers.get('content-type'))
    if (!res.ok) return null
    const html = await res.text()
    if (__DEV__) console.debug('[hydrate] html bytes', html.length)

    const ogTitleRaw = extractMeta(html, 'og:title')
    const ogDescriptionRaw = extractMeta(html, 'og:description')
    const ogImage = extractMeta(html, 'og:image')
    const twitterImage = extractMeta(html, 'twitter:image')
    const displayUrl = extractInstagramDisplayUrl(html)

    const { author, caption } = parseInstagramTitle(ogTitleRaw)
    const description = stripInstagramDescription(ogDescriptionRaw)
    if (__DEV__) console.debug('[hydrate] og', { ogTitleRaw, author, caption, ogDescriptionRaw, description, ogImage, twitterImage, displayUrl })

    const parts: string[] = []
    if (caption) parts.push(caption)
    if (description && description !== caption) parts.push(description)
    const text = parts.length ? parts.join('\n') : null

    const imageSource = displayUrl || ogImage || twitterImage
    const image = imageSource ? await downloadImpl(imageSource) : null
    if (__DEV__) console.debug('[hydrate] image', { source: imageSource, ...image })

    if (!text && !image && !author) return null

    return {
      text,
      imageUri: image?.uri ?? null,
      mimeType: image?.mimeType ?? null,
      venueHint: author,
    }
  } catch (e) {
    if (__DEV__) console.debug('[hydrate] error', e)
    reportError('extract.url', e, { url })
    return null
  }
}
