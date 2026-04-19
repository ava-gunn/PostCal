export type ErrorScope = 'extract.url' | 'extract.ocr' | 'extract.parse' | 'extract.pipeline'

export const reportError = (scope: ErrorScope, err: unknown, meta?: Record<string, unknown>): void => {
  if (__DEV__) console.warn(`[${scope}]`, err, meta)
}
