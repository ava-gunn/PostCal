import { parseDateTime } from '../parse-date-time';

describe('parseDateTime', () => {
  it('parses natural language date and time "Saturday March 28 at 10 PM"', () => {
    const result = parseDateTime('Saturday March 28 at 10 PM');
    expect(result.date).toMatch(/^\d{4}-03-28$/);
    expect(result.time).toBe('22:00');
  });

  it('parses date only "March 28, 2026" with null time', () => {
    const result = parseDateTime('March 28, 2026');
    expect(result.date).toBe('2026-03-28');
    expect(result.time).toBeNull();
  });

  it('parses numeric date "3/28/2026 10:00 PM"', () => {
    const result = parseDateTime('3/28/2026 10:00 PM');
    expect(result.date).toBe('2026-03-28');
    expect(result.time).toBe('22:00');
  });

  it('parses abbreviated month "Mar 28 at 10pm"', () => {
    const result = parseDateTime('Mar 28 at 10pm');
    expect(result.date).toMatch(/^\d{4}-03-28$/);
    expect(result.time).toBe('22:00');
  });

  it('parses relative date "next Saturday" returning valid date string', () => {
    const result = parseDateTime('next Saturday');
    expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.time).toBeNull();
  });

  it('returns null for both when no parseable date "just vibes"', () => {
    const result = parseDateTime('just vibes');
    expect(result.date).toBeNull();
    expect(result.time).toBeNull();
  });

  it('returns null for both when given empty string', () => {
    const result = parseDateTime('');
    expect(result.date).toBeNull();
    expect(result.time).toBeNull();
  });

  it('prefers result with a time over an earlier date-only result (posted/event pattern)', () => {
    const result = parseDateTime('Posted April 2. Event Saturday 7pm');
    expect(result.time).toBe('19:00');
  });

  it('picks the event date when a posting date precedes it', () => {
    const result = parseDateTime('Posted on March 1, 2026. Join us May 10, 2026 at 8 PM');
    expect(result.date).toBe('2026-05-10');
    expect(result.time).toBe('20:00');
  });

  it('falls back to the later result when both have equal specificity', () => {
    const result = parseDateTime('First draft April 2. Final date April 20');
    expect(result.date).toMatch(/^\d{4}-04-20$/);
  });
});
