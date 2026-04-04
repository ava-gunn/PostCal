import { parseEventName } from '../parse-event-name';

describe('parseEventName', () => {
  it('returns first line from Instagram caption with event name', () => {
    const text = 'Summer Music Festival\nSaturday March 28\nhttps://instagram.com/p/123';
    expect(parseEventName(text)).toBe('Summer Music Festival');
  });

  it('skips URL and returns next non-empty line', () => {
    const text = 'https://instagram.com/p/123\nDJ Night at Warehouse';
    expect(parseEventName(text)).toBe('DJ Night at Warehouse');
  });

  it('extracts from metadata section first when separator present', () => {
    const text = 'Summer Festival\n---\nWAREHOUSE PARTY';
    expect(parseEventName(text)).toBe('Summer Festival');
  });

  it('returns first non-empty line when no separator (OCR only)', () => {
    const text = 'WAREHOUSE PARTY\nSaturday Night';
    expect(parseEventName(text)).toBe('WAREHOUSE PARTY');
  });

  it('returns null when all lines are URLs', () => {
    const text = 'https://instagram.com/p/123\nhttps://example.com';
    expect(parseEventName(text)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseEventName('')).toBeNull();
  });

  it('truncates very long first line to 100 characters', () => {
    const longLine = 'A'.repeat(150);
    expect(parseEventName(longLine)).toBe('A'.repeat(100));
  });
});
