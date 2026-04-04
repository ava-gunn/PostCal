import { extractTextFromImage } from '../extract-text-from-image';

const mockExtractText = jest.fn();
let mockIsSupported = true;

jest.mock('expo-text-extractor', () => ({
  get isSupported() {
    return mockIsSupported;
  },
  extractTextFromImage: (...args: unknown[]) => mockExtractText(...args),
}));

beforeEach(() => {
  mockExtractText.mockReset();
  mockIsSupported = true;
});

describe('extractTextFromImage', () => {
  it('returns joined text from OCR string array', async () => {
    mockExtractText.mockResolvedValue([
      'DJ Night at Warehouse',
      'Saturday March 28',
      '10 PM',
      '450 Main St',
    ]);

    const result = await extractTextFromImage('/tmp/flyer.jpg');

    expect(result).toBe(
      'DJ Night at Warehouse\nSaturday March 28\n10 PM\n450 Main St'
    );
    expect(mockExtractText).toHaveBeenCalledWith('/tmp/flyer.jpg');
  });

  it('returns null when OCR returns empty array', async () => {
    mockExtractText.mockResolvedValue([]);

    const result = await extractTextFromImage('/tmp/blank.jpg');

    expect(result).toBeNull();
  });

  it('returns null when OCR returns array of empty/whitespace strings', async () => {
    mockExtractText.mockResolvedValue(['', '  ', '\n']);

    const result = await extractTextFromImage('/tmp/noise.jpg');

    expect(result).toBeNull();
  });

  it('returns null when OCR throws an error (no throw propagation)', async () => {
    mockExtractText.mockRejectedValue(new Error('OCR engine not available'));

    const result = await extractTextFromImage('/tmp/corrupt.jpg');

    expect(result).toBeNull();
  });

  it('returns null when isSupported is false without calling OCR', async () => {
    mockIsSupported = false;

    const result = await extractTextFromImage('/tmp/web.jpg');

    expect(result).toBeNull();
    expect(mockExtractText).not.toHaveBeenCalled();
  });

  it('returns null when called with empty string URI', async () => {
    mockExtractText.mockRejectedValue(new Error('Invalid URI'));

    const result = await extractTextFromImage('');

    expect(result).toBeNull();
  });
});
