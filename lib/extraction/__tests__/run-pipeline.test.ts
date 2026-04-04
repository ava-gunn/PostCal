import { runPipeline } from '../run-pipeline';
import type { SharedContent } from '../types';

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

describe('runPipeline', () => {
  it('extracts all fields from text + image (full extraction)', async () => {
    mockExtractText.mockResolvedValue([
      'DJ Night at Warehouse',
      'Saturday March 28',
      '10 PM',
      '450 Main St',
    ]);

    const sharedContent: SharedContent = {
      text: 'Summer Music Festival\nMarch 28 at 10 PM',
      imageUri: '/tmp/flyer.jpg',
      mimeType: 'image/jpeg',
    };

    const result = await runPipeline(sharedContent);

    expect(result.eventName).toBe('Summer Music Festival');
    expect(result.date).toMatch(/^\d{4}-03-28$/);
    expect(result.time).toBe('22:00');
    expect(result.rawText).toContain('Summer Music Festival');
    expect(result.rawText).toContain('---');
    expect(result.confidence.eventName).toBe(1);
    expect(result.confidence.date).toBe(1);
    expect(result.confidence.time).toBe(1);
  });

  it('extracts from text only when no image provided', async () => {
    const sharedContent: SharedContent = {
      text: 'Concert at The Warehouse\nMarch 28, 2026',
      imageUri: null,
      mimeType: null,
    };

    const result = await runPipeline(sharedContent);

    expect(result.eventName).toBe('Concert at The Warehouse');
    expect(result.date).toBe('2026-03-28');
    expect(result.venue).toBe('The Warehouse');
    expect(mockExtractText).not.toHaveBeenCalled();
  });

  it('returns all null fields when no text and no image', async () => {
    const sharedContent: SharedContent = {
      text: null,
      imageUri: null,
      mimeType: null,
    };

    const result = await runPipeline(sharedContent);

    expect(result.eventName).toBeNull();
    expect(result.date).toBeNull();
    expect(result.time).toBeNull();
    expect(result.venue).toBeNull();
    expect(result.rawText).toBeNull();
    expect(result.confidence.eventName).toBeNull();
  });

  it('still extracts from text when OCR fails', async () => {
    mockExtractText.mockRejectedValue(new Error('OCR failed'));

    const sharedContent: SharedContent = {
      text: 'Beach Party\nJuly 4, 2026 at 8 PM',
      imageUri: '/tmp/flyer.jpg',
      mimeType: 'image/jpeg',
    };

    const result = await runPipeline(sharedContent);

    expect(result.eventName).toBe('Beach Party');
    expect(result.date).toBe('2026-07-04');
    expect(result.time).toBe('20:00');
  });

  it('handles null imageUri gracefully (skips OCR)', async () => {
    const sharedContent: SharedContent = {
      text: 'Event details here',
      imageUri: null,
      mimeType: null,
    };

    await runPipeline(sharedContent);

    expect(mockExtractText).not.toHaveBeenCalled();
  });
});
