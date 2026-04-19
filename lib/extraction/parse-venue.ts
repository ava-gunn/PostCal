import { reportError } from '../report-error';

export function parseVenue(rawText: string): string | null {
  try {
    // Priority 1: Street address pattern
    const addressMatch = rawText.match(/\d+\s+\w+\s+(?:St|Ave|Blvd|Rd|Dr|Ln|Way|Ct|Pl)\b/i);
    if (addressMatch) {
      const trimmed = addressMatch[0].trim();
      if (trimmed) return trimmed;
    }

    // Priority 2: "at [Venue]" or "@ [Venue]" pattern
    const atMatch = rawText.match(/\bat\s+([A-Z][^\n,]+)/);
    if (atMatch) {
      const trimmed = atMatch[1].trim();
      if (trimmed) return trimmed;
    }

    const atSymbolMatch = rawText.match(/(?<!\w)@\s+([^\n,]+)/);
    if (atSymbolMatch) {
      const trimmed = atSymbolMatch[1].trim();
      if (trimmed) return trimmed;
    }

    // Priority 3: Labeled venue/location/where
    const labelMatch = rawText.match(/(?:venue|location|where)\s*:\s*(.+)/i);
    if (labelMatch) {
      const trimmed = labelMatch[1].trim();
      if (trimmed) return trimmed;
    }

    return null;
  } catch (e) {
    reportError('extract.parse', e, { parser: 'venue' });
    return null;
  }
}
