import { View, Text } from 'react-native-ui-lib';
import { colorTokens, spacing, radii } from '@/theme/digital-concierge';

interface ExtractedTextPreviewProps {
  rawText: string | null;
}

export function ExtractedTextPreview({ rawText }: ExtractedTextPreviewProps) {
  if (!rawText || !rawText.trim()) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: colorTokens.surfaceContainerLow,
        borderRadius: radii.xl,
        padding: spacing.md,
      }}
    >
      <Text
        caption
        numberOfLines={4}
        style={{ color: colorTokens.onSurfaceVariant }}
        accessibilityLabel="Extracted text from shared post"
      >
        {rawText}
      </Text>
    </View>
  );
}
