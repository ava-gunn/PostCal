import type { SharedContent, ExtractionResult } from './types';
import { extractTextFromImage } from './extract-text-from-image';
import { hydrateFromUrl, isUrlOnly } from './hydrate-from-url';
import { mergeExtractionSources } from './merge-extraction-sources';
import { parseDateTime } from './parse-date-time';
import { parseEventName } from './parse-event-name';
import { parseVenue } from './parse-venue';
import { buildEventFields } from './build-event-fields';

export async function runPipeline(sharedContent: SharedContent): Promise<ExtractionResult> {
  let content = sharedContent;

  if (!content.imageUri && isUrlOnly(content.text)) {
    const hydrated = await hydrateFromUrl(content.text!.trim());
    if (hydrated) {
      content = {
        text: hydrated.text ?? content.text,
        imageUri: hydrated.imageUri ?? content.imageUri,
        mimeType: hydrated.mimeType ?? content.mimeType,
        venueHint: hydrated.venueHint ?? content.venueHint,
      };
    }
  }

  const metadataText = content.text;

  const ocrText = content.imageUri
    ? await extractTextFromImage(content.imageUri).catch(() => null)
    : null;

  const rawText = mergeExtractionSources(metadataText, ocrText);

  if (__DEV__) console.debug('[pipeline] rawText', rawText);

  const { date, time } = rawText ? parseDateTime(rawText) : { date: null, time: null };
  const eventName = rawText ? parseEventName(rawText) : null;
  const parsedVenue = rawText ? parseVenue(rawText) : null;
  const venue = parsedVenue ?? content.venueHint ?? null;

  if (__DEV__) console.debug('[pipeline] parsed', { eventName, date, time, venue, venueHint: content.venueHint });

  return buildEventFields({ eventName, date, time, venue, rawText });
}
