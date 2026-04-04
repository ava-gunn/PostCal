export interface SharedContent {
  text: string | null;
  imageUri: string | null;
  mimeType: string | null;
}

export interface ExtractionConfidence {
  eventName: number | null;
  date: number | null;
  time: number | null;
  venue: number | null;
}

export interface ExtractionResult {
  eventName: string | null;
  date: string | null;        // ISO 8601: YYYY-MM-DD
  time: string | null;        // 24h format: HH:MM
  venue: string | null;
  rawText: string | null;
  confidence: ExtractionConfidence;
}

export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;              // Default: startDate + 2 hours
  location: string;
}
