import type { SharedContent, ExtractionResult } from './types';
import { extractTextFromImage } from './extract-text-from-image';
import { mergeExtractionSources } from './merge-extraction-sources';
import { parseDateTime } from './parse-date-time';
import { parseEventName } from './parse-event-name';
import { parseVenue } from './parse-venue';
import { buildEventFields } from './build-event-fields';

export async function runPipeline(sharedContent: SharedContent): Promise<ExtractionResult> {
  const metadataText = sharedContent.text;

  const ocrText = sharedContent.imageUri
    ? await extractTextFromImage(sharedContent.imageUri).catch(() => null)
    : null;

  const rawText = mergeExtractionSources(metadataText, ocrText);

  const { date, time } = rawText ? parseDateTime(rawText) : { date: null, time: null };
  const eventName = rawText ? parseEventName(rawText) : null;
  const venue = rawText ? parseVenue(rawText) : null;

  return buildEventFields({ eventName, date, time, venue, rawText });
}
