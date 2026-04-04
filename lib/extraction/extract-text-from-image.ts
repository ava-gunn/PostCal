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

    return joined || null;
  } catch {
    return null;
  }
}
