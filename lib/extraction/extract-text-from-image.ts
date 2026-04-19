import { reportError } from '../report-error';

export async function extractTextFromImage(
  imageUri: string
): Promise<string | null> {
  try {
    const {
      extractTextFromImage: extractText,
      isSupported,
    } = require('expo-text-extractor');

    if (!isSupported) {
      return null;
    }

    const blocks = await extractText(imageUri);
    const joined = blocks.join('\n').trim();

    if (__DEV__) console.debug('[ocr] text', joined);

    return joined || null;
  } catch (e) {
    if (__DEV__) console.debug('[ocr] error', e);
    reportError('extract.ocr', e, { imageUri });
    return null;
  }
}
