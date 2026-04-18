import * as Calendar from 'expo-calendar';
import type { ExtractionResult, CalendarEvent } from '@/lib/extraction/types';

function parseDateOnly(dateStr: string | null): { year: number; month: number; day: number } {
  const now = new Date();
  const fallback = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };

  if (!dateStr) return fallback;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return fallback;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (
    isNaN(year) || isNaN(month) || isNaN(day) ||
    month < 0 || month > 11 || day < 1 || day > 31
  ) {
    return fallback;
  }
  return { year, month, day };
}

function parseTimeOnly(timeStr: string | null): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (
    isNaN(hours) || isNaN(minutes) ||
    hours < 0 || hours > 23 || minutes < 0 || minutes > 59
  ) {
    return null;
  }
  return { hours, minutes };
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Build a CalendarEvent from extraction results merged with user edits.
 * When no time is known, creates an all-day event instead of defaulting to 7–9 PM.
 */
export function buildCalendarEvent(
  extraction: ExtractionResult | null,
  userEdits: Partial<Omit<ExtractionResult, 'confidence' | 'rawText'>>,
): CalendarEvent {
  const title = userEdits.eventName ?? extraction?.eventName ?? 'Untitled Event';
  const dateStr = userEdits.date ?? extraction?.date ?? null;
  const timeStr = userEdits.time ?? extraction?.time ?? null;
  const location = userEdits.venue ?? extraction?.venue ?? '';

  const { year, month, day } = parseDateOnly(dateStr);
  const time = parseTimeOnly(timeStr);

  if (time) {
    const startDate = new Date(year, month, day, time.hours, time.minutes);
    const endDate = new Date(startDate.getTime() + TWO_HOURS_MS);
    return { title, startDate, endDate, location };
  }

  const startDate = new Date(year, month, day, 0, 0);
  const endDate = new Date(startDate.getTime() + ONE_DAY_MS);
  return { title, startDate, endDate, location, allDay: true };
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
    allDay: event.allDay ?? false,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  return eventId;
}
