import type { ExtractionResult } from './types';

interface ParsedFields {
  eventName: string | null;
  date: string | null;
  time: string | null;
  venue: string | null;
  rawText: string | null;
}

export function buildEventFields(fields: ParsedFields): ExtractionResult {
  return {
    eventName: fields.eventName,
    date: fields.date,
    time: fields.time,
    venue: fields.venue,
    rawText: fields.rawText,
    confidence: {
      eventName: fields.eventName !== null ? 1 : null,
      date: fields.date !== null ? 1 : null,
      time: fields.time !== null ? 1 : null,
      venue: fields.venue !== null ? 1 : null,
    },
  };
}
