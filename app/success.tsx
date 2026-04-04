import { useEffect, useRef, useCallback } from 'react';
import { View, Text } from 'react-native-ui-lib';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Animated,
  BackHandler,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  AccessibilityInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useExtraction } from '@/context/extraction-context';
import { colorTokens, spacing, radii } from '@/theme/digital-concierge';
import { typeScale } from '@/theme/typography';

export const AUTO_DISMISS_MS = 2000;
export const FADE_DURATION_MS = 300;

/** Compute display event name: userEdits take precedence, then extraction, then fallback */
export function getDisplayEventName(
  userEdits: Record<string, string | null>,
  extraction: { eventName?: string | null } | null,
): string {
  return userEdits.eventName ?? extraction?.eventName ?? 'Your event';
}

export default function SuccessScreen() {
  const { extraction, userEdits, reset } = useExtraction();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNavigating = useRef(false);

  const eventName = getDisplayEventName(userEdits, extraction);

  const dismiss = useCallback(() => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    reset();
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    } else {
      router.replace('/');
    }
  }, [reset, router]);

  const handleAutoDismiss = useCallback(async () => {
    if (isNavigating.current) return;

    let reduceMotion = false;
    try {
      reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
    } catch {
      // Default to animating if the API rejects (rare Android OEM issue)
    }
    if (reduceMotion) {
      dismiss();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start(() => dismiss());
    }
  }, [dismiss, fadeAnim]);

  // Android back button dismisses immediately
  useEffect(() => {
    const onBackPress = () => {
      dismiss();
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [dismiss]);

  // Auto-dismiss after 2 seconds
  useEffect(() => {
    timerRef.current = setTimeout(handleAutoDismiss, AUTO_DISMISS_MS);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [handleAutoDismiss]);

  return (
    <TouchableWithoutFeedback onPress={dismiss} accessible={false}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colorTokens.surface }}>
          <View flex center paddingH-lg>
            {/* Checkmark icon — understated, not celebratory */}
            <Ionicons
              name="checkmark-circle-outline"
              size={48}
              color={colorTokens.primary}
              style={{ marginBottom: spacing.lg }}
            />

            {/* Headline */}
            <Text headline accessibilityRole="header" style={{ marginBottom: spacing.sm }}>
              Saved to Calendar
            </Text>

            {/* Event name confirmation */}
            <View accessibilityLiveRegion="polite">
              <Text body style={{ color: colorTokens.onSurfaceVariant, textAlign: 'center' }}>
                {eventName}
              </Text>
            </View>
          </View>

          {/* Done button — gradient CTA at bottom */}
          <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
            <LinearGradient
              colors={[colorTokens.primary, colorTokens.primaryContainer]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                borderRadius: radii.lg,
                minHeight: 48,
              }}
            >
              <TouchableOpacity
                onPress={dismiss}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 48,
                }}
                accessibilityLabel="Done"
                accessibilityRole="button"
              >
                <Text style={{ color: colorTokens.white, fontFamily: typeScale.title.fontFamily, fontSize: 16 }}>
                  Done
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
