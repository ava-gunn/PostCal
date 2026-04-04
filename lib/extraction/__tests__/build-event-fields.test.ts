import { buildEventFields } from '../build-event-fields';

describe('buildEventFields', () => {
  it('returns ExtractionResult with all fields populated and confidence all 1', () => {
    const result = buildEventFields({
      eventName: 'Summer Festival',
      date: '2026-03-28',
      time: '22:00',
      venue: 'The Warehouse',
      rawText: 'Summer Festival at The Warehouse',
    });

    expect(result.eventName).toBe('Summer Festival');
    expect(result.date).toBe('2026-03-28');
    expect(result.time).toBe('22:00');
    expect(result.venue).toBe('The Warehouse');
    expect(result.rawText).toBe('Summer Festival at The Warehouse');
    expect(result.confidence).toEqual({
      eventName: 1,
      date: 1,
      time: 1,
      venue: 1,
    });
  });

  it('returns null confidence for missing fields', () => {
    const result = buildEventFields({
      eventName: 'Summer Festival',
      date: '2026-03-28',
      time: null,
      venue: null,
      rawText: 'Summer Festival March 28',
    });

    expect(result.eventName).toBe('Summer Festival');
    expect(result.date).toBe('2026-03-28');
    expect(result.time).toBeNull();
    expect(result.venue).toBeNull();
    expect(result.confidence).toEqual({
      eventName: 1,
      date: 1,
      time: null,
      venue: null,
    });
  });

  it('returns all null fields with all null confidence', () => {
    const result = buildEventFields({
      eventName: null,
      date: null,
      time: null,
      venue: null,
      rawText: null,
    });

    expect(result.eventName).toBeNull();
    expect(result.date).toBeNull();
    expect(result.time).toBeNull();
    expect(result.venue).toBeNull();
    expect(result.rawText).toBeNull();
    expect(result.confidence).toEqual({
      eventName: null,
      date: null,
      time: null,
      venue: null,
    });
  });
});
