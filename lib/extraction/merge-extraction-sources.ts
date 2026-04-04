export function mergeExtractionSources(
  metadataText: string | null,
  ocrText: string | null
): string | null {
  const trimmedMetadata = metadataText?.trim() || null;
  const trimmedOcr = ocrText?.trim() || null;

  if (trimmedMetadata && trimmedOcr) {
    return `${trimmedMetadata}\n---\n${trimmedOcr}`;
  }

  return trimmedMetadata ?? trimmedOcr ?? null;
}
