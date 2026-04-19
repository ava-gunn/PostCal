import { reportError } from '../report-error'

declare const global: { __DEV__: boolean }

describe('reportError', () => {
  let warnSpy: jest.SpyInstance

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
    global.__DEV__ = false
  })

  it('warns in dev mode with scope, error, and meta', () => {
    global.__DEV__ = true
    const err = new Error('boom')
    const meta = { url: 'https://example.com' }

    reportError('extract.url', err, meta)

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledWith('[extract.url]', err, meta)
  })

  it('warns without meta when omitted', () => {
    global.__DEV__ = true
    const err = new Error('nope')

    reportError('extract.ocr', err)

    expect(warnSpy).toHaveBeenCalledWith('[extract.ocr]', err, undefined)
  })

  it('is silent outside dev mode', () => {
    global.__DEV__ = false

    reportError('extract.parse', new Error('x'), { parser: 'venue' })

    expect(warnSpy).not.toHaveBeenCalled()
  })
})
