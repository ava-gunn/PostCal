import { mergeExtractionSources } from '../merge-extraction-sources';

describe('mergeExtractionSources', () => {
  it('combines both sources with separator when both present', () => {
    const result = mergeExtractionSources(
      'Summer Festival this Saturday!',
      'DJ Night at Warehouse\nSaturday March 28'
    );

    expect(result).toBe(
      'Summer Festival this Saturday!\n---\nDJ Night at Warehouse\nSaturday March 28'
    );
  });

  it('returns metadata only when OCR is null', () => {
    const result = mergeExtractionSources('Check out this event!', null);

    expect(result).toBe('Check out this event!');
  });

  it('returns OCR only when metadata is null', () => {
    const result = mergeExtractionSources(null, 'Text from image');

    expect(result).toBe('Text from image');
  });

  it('returns null when both sources are null', () => {
    const result = mergeExtractionSources(null, null);

    expect(result).toBeNull();
  });

  it('returns valid text when one is empty string and other is valid', () => {
    expect(mergeExtractionSources('', 'OCR text')).toBe('OCR text');
    expect(mergeExtractionSources('Metadata', '')).toBe('Metadata');
  });

  it('returns null when both are empty strings', () => {
    const result = mergeExtractionSources('', '');

    expect(result).toBeNull();
  });

  it('treats whitespace-only strings as absent', () => {
    expect(mergeExtractionSources('   ', null)).toBeNull();
    expect(mergeExtractionSources(null, '   ')).toBeNull();
    expect(mergeExtractionSources('   ', '   ')).toBeNull();
    expect(mergeExtractionSources('   ', 'OCR text')).toBe('OCR text');
    expect(mergeExtractionSources('Metadata', '   ')).toBe('Metadata');
  });

  it('trims whitespace from output when both sources present', () => {
    const result = mergeExtractionSources(
      '  hello  ',
      '  world  '
    );

    expect(result).toBe('hello\n---\nworld');
  });

  it('trims whitespace from single-source output', () => {
    expect(mergeExtractionSources('  hello  ', null)).toBe('hello');
    expect(mergeExtractionSources(null, '  world  ')).toBe('world');
  });
});
