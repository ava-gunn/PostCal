import type { SharedContent } from './types';

export interface ShareIntentInput {
  type: 'media' | 'file' | 'text' | 'weburl' | null;
  text?: string | null;
  webUrl?: string | null;
  files?: {
    path: string;
    mimeType: string;
    fileName: string;
  }[] | null;
  meta?: Record<string, string | undefined> | null;
}

export function parseShareIntent(input: ShareIntentInput): SharedContent | null {
  let text: string | null = null;
  let imageUri: string | null = null;
  let mimeType: string | null = null;

  // Build text from available sources
  const trimmedText = input.text?.trim();
  if (trimmedText) {
    text = trimmedText;
  }

  // Append webUrl to text if present (skip if identical — Instagram duplicates URL across text and webUrl)
  const trimmedUrl = input.webUrl?.trim();
  if (trimmedUrl && trimmedUrl !== text) {
    text = text ? `${text}\n${trimmedUrl}` : trimmedUrl;
  }

  // Extract first image file if available (validate MIME type)
  const firstFile = input.files?.[0];
  if (firstFile && firstFile.mimeType?.startsWith('image/')) {
    imageUri = firstFile.path;
    mimeType = firstFile.mimeType;
  }

  // Return null if no usable data
  if (!text && !imageUri) {
    return null;
  }

  return { text, imageUri, mimeType };
}
