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
      };
    }
  }

  const metadataText = content.text;

  const ocrText = content.imageUri
    ? await extractTextFromImage(content.imageUri).catch(() => null)
    : null;

  const rawText = mergeExtractionSources(metadataText, ocrText);

  const { date, time } = rawText ? parseDateTime(rawText) : { date: null, time: null };
  const eventName = rawText ? parseEventName(rawText) : null;
  const venue = rawText ? parseVenue(rawText) : null;

  return buildEventFields({ eventName, date, time, venue, rawText });
}
