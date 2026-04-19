import { TouchableOpacity } from 'react-native';
import { View, Text } from 'react-native-ui-lib';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colorTokens, spacing, radii } from '@/theme/digital-concierge';
import { typeScale } from '@/theme/typography';

interface ReviewErrorProps {
  onEnterManually: () => void;
  onTryAgain: () => void;
}

export function ReviewError({ onEnterManually, onTryAgain }: ReviewErrorProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorTokens.surface }}>
      <View flex center paddingH-lg>
        <Text
          title
          accessibilityRole="header"
          style={{ marginBottom: spacing.md, color: colorTokens.onSurface }}
        >
          Couldn't extract event details
        </Text>
        <Text
          body
          style={{ marginBottom: spacing.xl, color: colorTokens.onSurfaceVariant, textAlign: 'center' }}
        >
          We weren't able to find event info in that post.
        </Text>

        <LinearGradient
          colors={[colorTokens.primary, colorTokens.primaryContainer]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            borderRadius: radii.lg,
            minHeight: 48,
            width: '100%',
          }}
        >
          <TouchableOpacity
            onPress={onEnterManually}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 48,
            }}
            accessibilityLabel="Enter Manually"
            accessibilityRole="button"
          >
            <Text style={{ color: colorTokens.white, fontFamily: typeScale.title.fontFamily, fontSize: 16 }}>
              Enter Manually
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <TouchableOpacity
          onPress={onTryAgain}
          style={{
            backgroundColor: colorTokens.surfaceContainerHigh,
            borderRadius: radii.lg,
            minHeight: 48,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: spacing.md,
            width: '100%',
          }}
          accessibilityLabel="Try Again"
          accessibilityRole="button"
        >
          <Text style={{ color: colorTokens.onSurface, fontFamily: typeScale.title.fontFamily, fontSize: 16 }}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
