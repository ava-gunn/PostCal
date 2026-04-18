import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextField, TextFieldRef } from 'react-native-ui-lib';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useShareIntentContext } from 'expo-share-intent';
import { useRouter } from 'expo-router';

import { useExtraction } from '@/context/extraction-context';
import { parseShareIntent } from '@/lib/extraction/parse-share-intent';
import { runPipeline } from '@/lib/extraction/run-pipeline';
import { requestCalendarPermission } from '@/lib/calendar/request-permission';
import { buildCalendarEvent, writeEvent } from '@/lib/calendar/write-event';
import { colorTokens, spacing, radii } from '@/theme/digital-concierge';
import { typeScale } from '@/theme/typography';
import { ExtractedTextPreview } from '@/components/extracted-text-preview';
import type { ExtractionResult, SharedContent } from '@/lib/extraction/types';

const primaryBorderFocused = `${colorTokens.primary}66`; // 40% opacity

function useResponsiveSpacing() {
  const { width } = useWindowDimensions();
  const isSmall = width < 375;

  return {
    horizontalPadding: isSmall ? spacing.md : spacing.lg,
  };
}

export function isExtractionFailure(result: ExtractionResult): boolean {
  return !result.eventName && !result.date && !result.time && !result.venue && !result.rawText;
}

export default function ReviewScreen() {
  const { hasShareIntent, shareIntent } = useShareIntentContext();
  const { extraction, userEdits, setUserEdit, setSharedContent, setExtraction, setStatus, status, sharedContent, reset } = useExtraction();
  const router = useRouter();
  const responsive = useResponsiveSpacing();

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isNavigating = useRef(false);
  const cancelledRef = useRef(false);
  const dateRef = useRef<TextFieldRef>(null);
  const timeRef = useRef<TextFieldRef>(null);
  const locationRef = useRef<TextFieldRef>(null);

  const runExtraction = useCallback((content: SharedContent) => {
    cancelledRef.current = false;
    setStatus('extracting');

    runPipeline(content)
      .then(result => {
        if (!cancelledRef.current) {
          setExtraction(result);
          if (isExtractionFailure(result)) {
            setStatus('error');
          } else {
            setStatus('ready');
          }
        }
      })
      .catch(() => {
        if (!cancelledRef.current) {
          setExtraction(null as unknown as ExtractionResult);
          setStatus('error');
        }
      });
  }, [setExtraction, setStatus]);

  useEffect(() => {
    if (!hasShareIntent || !shareIntent) return;

    if (__DEV__) {
      console.debug('[review] raw shareIntent:', JSON.stringify(shareIntent, null, 2));
    }

    const content = parseShareIntent(shareIntent);
    if (!content) return;

    setSharedContent(content);
    runExtraction(content);

    return () => {
      cancelledRef.current = true;
    };
  }, [hasShareIntent, shareIntent, setSharedContent, runExtraction]);

  // Redirect to home if navigated here without share intent or content
  // Guard on status === 'idle' to prevent redirect while extraction is in progress
  useEffect(() => {
    if (!hasShareIntent && !sharedContent && status === 'idle') {
      router.replace('/');
    }
  }, [hasShareIntent, sharedContent, status, router]);

  // Android back button acts as Cancel (AC 3.2 #6) — exits app to return to previous app
  useEffect(() => {
    const onBackPress = () => {
      if (isNavigating.current) return true;
      isNavigating.current = true;
      reset();
      BackHandler.exitApp();
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [reset]);

  // Display values: userEdits take precedence, then extraction, then empty string
  const eventName = userEdits.eventName ?? extraction?.eventName ?? '';
  const date = userEdits.date ?? extraction?.date ?? '';
  const time = userEdits.time ?? extraction?.time ?? '';
  const venue = userEdits.venue ?? extraction?.venue ?? '';

  const isSaving = status === 'saving';

  const handleFieldChange = (field: keyof Omit<ExtractionResult, 'confidence' | 'rawText'>, text: string) => {
    setUserEdit(field, text || null);
  };

  const handleCancel = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    reset();
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    } else {
      router.replace('/');
    }
  };

  const handleSave = async () => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    const granted = await requestCalendarPermission();
    if (!granted) {
      isNavigating.current = false;
      return;
    }

    try {
      const calendarEvent = buildCalendarEvent(extraction, userEdits);
      setStatus('saving');
      await writeEvent(calendarEvent);
      setStatus('saved');
      router.replace('/success');
    } catch (error) {
      console.warn('Calendar write failed:', error);
      setStatus('ready');
      isNavigating.current = false;
    }
  };

  const getContainerStyle = (fieldName: string) => ({
    borderRadius: radii.xl,
    borderWidth: focusedField === fieldName ? 2 : 0,
    borderColor: focusedField === fieldName ? primaryBorderFocused : 'transparent',
  });

  const getFieldStyle = (fieldName: string) => ({
    backgroundColor: focusedField === fieldName ? colorTokens.surfaceContainerLowest : colorTokens.surfaceContainerLow,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
  });

  const handleEnterManually = () => {
    if (isNavigating.current) return;
    cancelledRef.current = true;
    setExtraction(null as unknown as ExtractionResult);
    setStatus('ready');
  };

  const handleTryAgain = () => {
    if (isNavigating.current) return;
    cancelledRef.current = true;
    if (sharedContent) {
      runExtraction(sharedContent);
    }
  };

  if (status === 'error') {
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

          {/* Enter Manually — primary gradient CTA */}
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
              onPress={handleEnterManually}
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

          {/* Try Again — secondary CTA */}
          <TouchableOpacity
            onPress={handleTryAgain}
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

  if (status === 'extracting') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colorTokens.surface }}>
        <View flex center>
          <Text body>Processing shared content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorTokens.surface }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: responsive.horizontalPadding,
            }}
          >
            {/* Headline */}
            <Text
              headline
              accessibilityRole="header"
              style={{ marginTop: spacing.lg, marginBottom: spacing.lg }}
            >
              Confirm Event Details
            </Text>

            {/* Extracted Text Preview — hidden entirely when no text */}
            {extraction?.rawText?.trim() ? (
              <View style={{ marginBottom: spacing.lg }}>
                <ExtractedTextPreview rawText={extraction.rawText} />
              </View>
            ) : null}

            {/* Event Name */}
            <View style={{ marginBottom: spacing.md }}>
              <TextField
                value={eventName}
                onChangeText={(text: string) => handleFieldChange('eventName', text)}
                label="Event Name"
                floatingPlaceholder={false}
                containerStyle={getContainerStyle('eventName')}
                fieldStyle={getFieldStyle('eventName')}
                onFocus={() => setFocusedField('eventName')}
                onBlur={() => setFocusedField(null)}
                returnKeyType="next"
                onSubmitEditing={() => dateRef.current?.focus()}
                accessibilityLabel="Event Name"
              />
            </View>

            {/* Date */}
            <View style={{ marginBottom: spacing.md }}>
              <TextField
                ref={dateRef}
                value={date}
                onChangeText={(text: string) => handleFieldChange('date', text)}
                label="Date"
                floatingPlaceholder={false}
                containerStyle={getContainerStyle('date')}
                fieldStyle={getFieldStyle('date')}
                onFocus={() => setFocusedField('date')}
                onBlur={() => setFocusedField(null)}
                returnKeyType="next"
                onSubmitEditing={() => timeRef.current?.focus()}
                accessibilityLabel="Date"
              />
            </View>

            {/* Time */}
            <View style={{ marginBottom: spacing.md }}>
              <TextField
                ref={timeRef}
                value={time}
                onChangeText={(text: string) => handleFieldChange('time', text)}
                label="Time"
                floatingPlaceholder={false}
                containerStyle={getContainerStyle('time')}
                fieldStyle={getFieldStyle('time')}
                onFocus={() => setFocusedField('time')}
                onBlur={() => setFocusedField(null)}
                returnKeyType="next"
                onSubmitEditing={() => locationRef.current?.focus()}
                accessibilityLabel="Time"
              />
            </View>

            {/* Location */}
            <View style={{ marginBottom: spacing.xl }}>
              <TextField
                ref={locationRef}
                value={venue}
                onChangeText={(text: string) => handleFieldChange('venue', text)}
                label="Location"
                floatingPlaceholder={false}
                containerStyle={getContainerStyle('venue')}
                fieldStyle={getFieldStyle('venue')}
                onFocus={() => setFocusedField('venue')}
                onBlur={() => setFocusedField(null)}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                accessibilityLabel="Location"
              />
            </View>

            {/* Save to Calendar button */}
            <LinearGradient
              colors={[colorTokens.primary, colorTokens.primaryContainer]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                borderRadius: radii.lg,
                minHeight: 48,
                opacity: isSaving ? 0.5 : 1,
              }}
            >
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 48,
                }}
                accessibilityLabel="Save to Calendar"
                accessibilityRole="button"
              >
                <Text style={{ color: colorTokens.white, fontFamily: typeScale.title.fontFamily, fontSize: 16 }}>
                  {isSaving ? 'Saving...' : 'Save to Calendar'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Cancel button */}
            <TouchableOpacity
              onPress={handleCancel}
              style={{
                backgroundColor: colorTokens.surfaceContainerHigh,
                borderRadius: radii.lg,
                minHeight: 48,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: spacing.md,
                marginBottom: spacing.lg,
              }}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text style={{ color: colorTokens.onSurface, fontFamily: typeScale.title.fontFamily, fontSize: 16 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
