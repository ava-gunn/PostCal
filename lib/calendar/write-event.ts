import * as Calendar from 'expo-calendar';
import type { ExtractionResult, CalendarEvent } from '@/lib/extraction/types';

/**
 * Parse ISO date string (YYYY-MM-DD) and time string (HH:MM) into a Date object.
 * Falls back to today at 19:00 for missing or unparseable values.
 */
function parseToDate(dateStr: string | null, timeStr: string | null): Date {
  const now = new Date();

  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();

  if (dateStr) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const parsedYear = parseInt(parts[0], 10);
      const parsedMonth = parseInt(parts[1], 10) - 1;
      const parsedDay = parseInt(parts[2], 10);
      if (
        !isNaN(parsedYear) && !isNaN(parsedMonth) && !isNaN(parsedDay) &&
        parsedMonth >= 0 && parsedMonth <= 11 &&
        parsedDay >= 1 && parsedDay <= 31
      ) {
        year = parsedYear;
        month = parsedMonth;
        day = parsedDay;
      }
    }
  }

  let hours = 19;
  let minutes = 0;

  if (timeStr) {
    const timeParts = timeStr.split(':');
    if (timeParts.length >= 2) {
      const parsedHours = parseInt(timeParts[0], 10);
      const parsedMinutes = parseInt(timeParts[1], 10);
      if (
        !isNaN(parsedHours) && !isNaN(parsedMinutes) &&
        parsedHours >= 0 && parsedHours <= 23 &&
        parsedMinutes >= 0 && parsedMinutes <= 59
      ) {
        hours = parsedHours;
        minutes = parsedMinutes;
      }
    }
  }

  return new Date(year, month, day, hours, minutes);
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

/**
 * Build a CalendarEvent from extraction results merged with user edits.
 * User edits take precedence over extraction values.
 */
export function buildCalendarEvent(
  extraction: ExtractionResult | null,
  userEdits: Partial<Omit<ExtractionResult, 'confidence' | 'rawText'>>,
): CalendarEvent {
  const title = userEdits.eventName ?? extraction?.eventName ?? 'Untitled Event';
  const dateStr = userEdits.date ?? extraction?.date ?? null;
  const timeStr = userEdits.time ?? extraction?.time ?? null;
  const location = userEdits.venue ?? extraction?.venue ?? '';

  const startDate = parseToDate(dateStr, timeStr);
  const endDate = new Date(startDate.getTime() + TWO_HOURS_MS);

  return { title, startDate, endDate, location };
}

/**
 * Write a CalendarEvent to the device's default calendar via expo-calendar.
 * Returns the created event ID.
 */
export async function writeEvent(event: CalendarEvent): Promise<string> {
  let calendarId: string;

  try {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    calendarId = defaultCalendar.id;
  } catch {
    // Android may not have getDefaultCalendarAsync — fall back to first writable calendar
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const writable = calendars.find(c => c.allowsModifications);
    if (!writable) {
      throw new Error('No writable calendar found on device');
    }
    calendarId = writable.id;
  }

  const eventId = await Calendar.createEventAsync(calendarId, {
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    location: event.location,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  return eventId;
}
