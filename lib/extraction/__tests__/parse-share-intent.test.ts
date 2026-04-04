import { parseShareIntent, type ShareIntentInput } from '../parse-share-intent';

describe('parseShareIntent', () => {
  it('handles text-only share (Instagram caption with URL)', () => {
    const input: ShareIntentInput = {
      type: 'text',
      text: 'Check out this event! 🎶 Live music at the park',
      webUrl: 'https://www.instagram.com/p/ABC123/',
      files: null,
    };

    const result = parseShareIntent(input);

    expect(result).toEqual({
      text: 'Check out this event! 🎶 Live music at the park\nhttps://www.instagram.com/p/ABC123/',
      imageUri: null,
      mimeType: null,
    });
  });

  it('handles image-only share (flyer image, no text)', () => {
    const input: ShareIntentInput = {
      type: 'media',
      text: null,
      webUrl: null,
      files: [
        {
          path: '/tmp/share/flyer.jpg',
          mimeType: 'image/jpeg',
          fileName: 'flyer.jpg',
        },
      ],
    };

    const result = parseShareIntent(input);

    expect(result).toEqual({
      text: null,
      imageUri: '/tmp/share/flyer.jpg',
      mimeType: 'image/jpeg',
    });
  });

  it('handles text + image share (both available)', () => {
    const input: ShareIntentInput = {
      type: 'media',
      text: 'Summer Festival this Saturday!',
      webUrl: null,
      files: [
        {
          path: '/tmp/share/poster.png',
          mimeType: 'image/png',
          fileName: 'poster.png',
        },
      ],
    };

    const result = parseShareIntent(input);

    expect(result).toEqual({
      text: 'Summer Festival this Saturday!',
      imageUri: '/tmp/share/poster.png',
      mimeType: 'image/png',
    });
  });

  it('returns null for empty/null share (no usable data)', () => {
    const input: ShareIntentInput = {
      type: null,
      text: null,
      webUrl: null,
      files: null,
    };

    expect(parseShareIntent(input)).toBeNull();
  });

  it('returns null for share with empty strings', () => {
    const input: ShareIntentInput = {
      type: 'text',
      text: '',
      webUrl: '',
      files: [],
    };

    expect(parseShareIntent(input)).toBeNull();
  });

  it('returns null for share with whitespace-only text', () => {
    const input: ShareIntentInput = {
      type: 'text',
      text: '   ',
      webUrl: '  ',
      files: null,
    };

    expect(parseShareIntent(input)).toBeNull();
  });

  it('handles share with webUrl but no text', () => {
    const input: ShareIntentInput = {
      type: 'weburl',
      text: null,
      webUrl: 'https://www.instagram.com/p/XYZ789/',
      files: null,
    };

    const result = parseShareIntent(input);

    expect(result).toEqual({
      text: 'https://www.instagram.com/p/XYZ789/',
      imageUri: null,
      mimeType: null,
    });
  });

  it('ignores non-image files (e.g., text/plain)', () => {
    const input: ShareIntentInput = {
      type: 'file',
      text: null,
      webUrl: null,
      files: [
        {
          path: '/tmp/share/document.txt',
          mimeType: 'text/plain',
          fileName: 'document.txt',
        },
      ],
    };

    expect(parseShareIntent(input)).toBeNull();
  });

  it('ignores non-image files but keeps text content', () => {
    const input: ShareIntentInput = {
      type: 'file',
      text: 'Check this out',
      webUrl: null,
      files: [
        {
          path: '/tmp/share/document.pdf',
          mimeType: 'application/pdf',
          fileName: 'document.pdf',
        },
      ],
    };

    const result = parseShareIntent(input);

    expect(result).toEqual({
      text: 'Check this out',
      imageUri: null,
      mimeType: null,
    });
  });

  it('uses only the first file when multiple files are shared', () => {
    const input: ShareIntentInput = {
      type: 'media',
      text: null,
      webUrl: null,
      files: [
        {
          path: '/tmp/share/first.jpg',
          mimeType: 'image/jpeg',
          fileName: 'first.jpg',
        },
        {
          path: '/tmp/share/second.jpg',
          mimeType: 'image/jpeg',
          fileName: 'second.jpg',
        },
      ],
    };

    const result = parseShareIntent(input);

    expect(result).toEqual({
      text: null,
      imageUri: '/tmp/share/first.jpg',
      mimeType: 'image/jpeg',
    });
  });
});
