import type { ExtractionResult } from '@/lib/extraction/types';

jest.mock('expo-calendar', () => ({
  getDefaultCalendarAsync: jest.fn(),
  getCalendarsAsync: jest.fn(),
  createEventAsync: jest.fn(),
  EntityTypes: { EVENT: 'event' },
}));

import * as Calendar from 'expo-calendar';
import { buildCalendarEvent, writeEvent } from '../write-event';

const mockGetDefaultCalendar = Calendar.getDefaultCalendarAsync as jest.Mock;
const mockGetCalendars = Calendar.getCalendarsAsync as jest.Mock;
const mockCreateEvent = Calendar.createEventAsync as jest.Mock;

const fullExtraction: ExtractionResult = {
  eventName: 'DJ Night at Warehouse',
  date: '2026-03-28',
  time: '22:00',
  venue: 'The Warehouse, 450 Main St',
  rawText: 'DJ Night this Saturday...',
  confidence: { eventName: 0.9, date: 0.95, time: 0.9, venue: 0.8 },
};

describe('buildCalendarEvent', () => {
  it('uses extraction values when no user edits', () => {
    const event = buildCalendarEvent(fullExtraction, {});

    expect(event.title).toBe('DJ Night at Warehouse');
    expect(event.location).toBe('The Warehouse, 450 Main St');
    expect(event.startDate.getFullYear()).toBe(2026);
    expect(event.startDate.getMonth()).toBe(2); // March = 2 (0-indexed)
    expect(event.startDate.getDate()).toBe(28);
    expect(event.startDate.getHours()).toBe(22);
    expect(event.startDate.getMinutes()).toBe(0);
  });

  it('user edits take precedence over extraction', () => {
    const event = buildCalendarEvent(fullExtraction, {
      eventName: 'My Custom Event',
      venue: 'New Venue',
    });

    expect(event.title).toBe('My Custom Event');
    expect(event.location).toBe('New Venue');
    // Date/time should still come from extraction
    expect(event.startDate.getHours()).toBe(22);
  });

  it('creates an all-day event on today when date and time are both null', () => {
    const now = new Date();
    const event = buildCalendarEvent(null, {});

    expect(event.allDay).toBe(true);
    expect(event.startDate.getFullYear()).toBe(now.getFullYear());
    expect(event.startDate.getMonth()).toBe(now.getMonth());
    expect(event.startDate.getDate()).toBe(now.getDate());
    expect(event.startDate.getHours()).toBe(0);
    expect(event.startDate.getMinutes()).toBe(0);
  });

  it('creates an all-day event when time is null', () => {
    const event = buildCalendarEvent(
      { ...fullExtraction, time: null },
      {},
    );

    expect(event.allDay).toBe(true);
    expect(event.startDate.getHours()).toBe(0);
    expect(event.startDate.getMinutes()).toBe(0);
  });

  it('falls back to "Untitled Event" when name is null', () => {
    const event = buildCalendarEvent(
      { ...fullExtraction, eventName: null },
      {},
    );

    expect(event.title).toBe('Untitled Event');
  });

  it('falls back to empty string when venue is null', () => {
    const event = buildCalendarEvent(
      { ...fullExtraction, venue: null },
      {},
    );

    expect(event.location).toBe('');
  });

  it('endDate is startDate + 2 hours for timed events', () => {
    const event = buildCalendarEvent(fullExtraction, {});
    const diffMs = event.endDate.getTime() - event.startDate.getTime();

    expect(diffMs).toBe(2 * 60 * 60 * 1000);
    expect(event.allDay).toBeFalsy();
  });

  it('endDate is startDate + 24 hours for all-day events', () => {
    const event = buildCalendarEvent({ ...fullExtraction, time: null }, {});
    const diffMs = event.endDate.getTime() - event.startDate.getTime();

    expect(diffMs).toBe(24 * 60 * 60 * 1000);
    expect(event.allDay).toBe(true);
  });

  it('falls back to today for out-of-range date values and treats as all-day when time invalid', () => {
    const now = new Date();
    const event = buildCalendarEvent(
      { ...fullExtraction, date: '2026-13-45', time: '25:99' },
      {},
    );

    expect(event.startDate.getFullYear()).toBe(now.getFullYear());
    expect(event.startDate.getMonth()).toBe(now.getMonth());
    expect(event.startDate.getDate()).toBe(now.getDate());
    // Invalid time → all-day event starting at midnight
    expect(event.allDay).toBe(true);
    expect(event.startDate.getHours()).toBe(0);
    expect(event.startDate.getMinutes()).toBe(0);
  });

  it('handles partial extraction with partial edits', () => {
    const partial: ExtractionResult = {
      ...fullExtraction,
      eventName: null,
      date: null,
      time: '14:30',
      venue: null,
    };

    const event = buildCalendarEvent(partial, {
      eventName: 'Edited Name',
    });

    expect(event.title).toBe('Edited Name');
    expect(event.startDate.getHours()).toBe(14);
    expect(event.startDate.getMinutes()).toBe(30);
    expect(event.location).toBe('');
  });
});

describe('writeEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses default calendar when available', async () => {
    mockGetDefaultCalendar.mockResolvedValue({ id: 'default-cal-1' });
    mockCreateEvent.mockResolvedValue('event-123');

    const event = buildCalendarEvent(fullExtraction, {});
    const eventId = await writeEvent(event);

    expect(eventId).toBe('event-123');
    expect(mockCreateEvent).toHaveBeenCalledWith('default-cal-1', expect.objectContaining({
      title: 'DJ Night at Warehouse',
      location: 'The Warehouse, 450 Main St',
    }));
  });

  it('falls back to first writable calendar when default fails', async () => {
    mockGetDefaultCalendar.mockRejectedValue(new Error('Not supported'));
    mockGetCalendars.mockResolvedValue([
      { id: 'cal-readonly', allowsModifications: false },
      { id: 'cal-writable', allowsModifications: true },
    ]);
    mockCreateEvent.mockResolvedValue('event-456');

    const event = buildCalendarEvent(fullExtraction, {});
    const eventId = await writeEvent(event);

    expect(eventId).toBe('event-456');
    expect(mockCreateEvent).toHaveBeenCalledWith('cal-writable', expect.anything());
  });

  it('throws when no writable calendar exists', async () => {
    mockGetDefaultCalendar.mockRejectedValue(new Error('Not supported'));
    mockGetCalendars.mockResolvedValue([
      { id: 'cal-readonly', allowsModifications: false },
    ]);

    const event = buildCalendarEvent(fullExtraction, {});
    await expect(writeEvent(event)).rejects.toThrow('No writable calendar found on device');
  });
});
