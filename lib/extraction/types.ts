export interface SharedContent {
  text: string | null;
  imageUri: string | null;
  mimeType: string | null;
  venueHint?: string | null;
}

export interface ExtractionResult {
  eventName: string | null;
  date: string | null;        // ISO 8601: YYYY-MM-DD
  time: string | null;        // 24h format: HH:MM
  venue: string | null;
  rawText: string | null;
}

export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;              // Default: startDate + 2 hours, or +24h when allDay
  location: string;
  allDay?: boolean;
}
