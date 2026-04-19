import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { hydrateFromUrl, isUrlOnly } from './hydrate-from-url'

const fixture = (name: string) =>
  readFileSync(join(__dirname, '__fixtures__', 'instagram', name), 'utf8')

const makeFetch = (html: string, init: Partial<Response> = {}): typeof fetch =>
  (async () =>
    ({
      ok: init.ok ?? true,
      status: init.status ?? 200,
      headers: new Map([['content-type', 'text/html']]) as unknown as Headers,
      text: async () => html,
    }) as unknown as Response) as unknown as typeof fetch

const fakeDownload = async (imageUrl: string) => ({
  uri: `file:///cache/${encodeURIComponent(imageUrl)}`,
  mimeType: 'image/jpeg',
})

describe('hydrateFromUrl', () => {
  it('extracts caption, author, description and og:image when only OG tags are present', async () => {
    const html = fixture('post-with-og-tags.html')
    const result = await hydrateFromUrl('https://www.instagram.com/p/OGT4GS0N1Y/', {
      fetchImpl: makeFetch(html),
      downloadImpl: fakeDownload,
    })

    expect(result).toEqual({
      text: 'Open mic this Friday at 7pm — come jam with us!',
      imageUri: `file:///cache/${encodeURIComponent('https://scontent.cdninstagram.com/v/t51.29350-15/og_thumb_640x640.jpg')}`,
      mimeType: 'image/jpeg',
      venueHint: 'Church Cantina',
    })
  })

  it('falls back to embedded JSON display_url when OG meta tags are absent', async () => {
    const html = fixture('post-with-json-ld.html')
    const result = await hydrateFromUrl('https://www.instagram.com/p/JSONLDXYZ/', {
      fetchImpl: makeFetch(html),
      downloadImpl: fakeDownload,
    })

    const expectedImage =
      'https://scontent.cdninstagram.com/v/t51.29350-15/fullres_display_1440.jpg?_nc_cat=101&_nc_ohc=abc&_nc_ht=scontent.cdninstagram.com'

    expect(result).toEqual({
      text: null,
      imageUri: `file:///cache/${encodeURIComponent(expectedImage)}`,
      mimeType: 'image/jpeg',
      venueHint: null,
    })
  })

  it('prefers embedded display_url over og:image and preserves emoji/unicode in caption', async () => {
    const html = fixture('post-with-both-and-emoji.html')
    const result = await hydrateFromUrl('https://www.instagram.com/p/BOTHEMJ123/', {
      fetchImpl: makeFetch(html),
      downloadImpl: fakeDownload,
    })

    const expectedImage =
      'https://scontent.cdninstagram.com/v/t51.29350-15/fullres_both_1440.jpg?_nc_cat=102&ig_cache_key=XYZ'

    expect(result).toEqual({
      text: 'Full moon flow 🌙 & vinyasa on June 21 — bring a mat!',
      imageUri: `file:///cache/${encodeURIComponent(expectedImage)}`,
      mimeType: 'image/jpeg',
      venueHint: 'Sunset Yoga Co',
    })
  })

  it('returns null when the fetch response is not ok', async () => {
    const fetchImpl = (async () =>
      ({
        ok: false,
        status: 404,
        headers: new Map() as unknown as Headers,
        text: async () => '',
      }) as unknown as Response) as unknown as typeof fetch

    const result = await hydrateFromUrl('https://www.instagram.com/p/missing/', {
      fetchImpl,
      downloadImpl: fakeDownload,
    })

    expect(result).toBeNull()
  })

  it('returns null on fetcher throw', async () => {
    const fetchImpl = (async () => {
      throw new Error('network down')
    }) as unknown as typeof fetch

    const result = await hydrateFromUrl('https://www.instagram.com/p/crash/', {
      fetchImpl,
      downloadImpl: fakeDownload,
    })

    expect(result).toBeNull()
  })

  it('returns null when nothing extractable is present', async () => {
    const result = await hydrateFromUrl('https://example.com/bare', {
      fetchImpl: makeFetch('<html><head><title>Nothing</title></head><body></body></html>'),
      downloadImpl: fakeDownload,
    })

    expect(result).toBeNull()
  })

  it('does not fall over when download fails', async () => {
    const html = fixture('post-with-og-tags.html')
    const result = await hydrateFromUrl('https://www.instagram.com/p/OGT4GS0N1Y/', {
      fetchImpl: makeFetch(html),
      downloadImpl: async () => null,
    })

    expect(result).toEqual({
      text: 'Open mic this Friday at 7pm — come jam with us!',
      imageUri: null,
      mimeType: null,
      venueHint: 'Church Cantina',
    })
  })
})

describe('isUrlOnly', () => {
  it('returns true for a bare http(s) URL', () => {
    expect(isUrlOnly('https://www.instagram.com/p/ABC/')).toBe(true)
  })

  it('returns false for a URL mixed with caption text', () => {
    expect(isUrlOnly('check this https://www.instagram.com/p/ABC/')).toBe(false)
  })

  it('returns false for null or empty input', () => {
    expect(isUrlOnly(null)).toBe(false)
    expect(isUrlOnly('')).toBe(false)
  })
})
