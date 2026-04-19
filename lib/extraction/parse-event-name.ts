import { reportError } from '../report-error';

export function parseEventName(rawText: string): string | null {
  try {
    const separator = '\n---\n';
    const separatorIndex = rawText.indexOf(separator);

    let metadataLines: string[];
    let ocrLines: string[];

    if (separatorIndex !== -1) {
      metadataLines = rawText.slice(0, separatorIndex).split('\n');
      ocrLines = rawText.slice(separatorIndex + separator.length).split('\n');
    } else {
      metadataLines = rawText.split('\n');
      ocrLines = [];
    }

    // Prefer OCR (flyer text) — the actual event name is usually printed on the image.
    // Fall back to metadata (caption), which is noisier.
    const candidate = findCandidate(ocrLines) ?? findCandidate(metadataLines);

    if (!candidate) {
      return null;
    }

    return candidate.length > 100 ? candidate.slice(0, 100) : candidate;
  } catch (e) {
    reportError('extract.parse', e, { parser: 'event-name' });
    return null;
  }
}

function findCandidate(lines: string[]): string | null {
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) continue;
    return trimmed;
  }
  return null;
}
