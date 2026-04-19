import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { View, Text, TextFieldRef } from 'react-native-ui-lib';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colorTokens, spacing, radii } from '@/theme/digital-concierge';
import { typeScale } from '@/theme/typography';
import { ExtractedTextPreview } from '@/components/extracted-text-preview';
import { EventField } from '@/components/review/EventField';
import type { ExtractionResult } from '@/lib/extraction/types';

type EditableField = keyof Omit<ExtractionResult, 'confidence' | 'rawText'>;

interface ReviewFormProps {
  horizontalPadding: number;
  rawText: string | null | undefined;
  eventName: string;
  date: string;
  time: string;
  venue: string;
  isSaving: boolean;
  onFieldChange: (field: EditableField, text: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ReviewForm({
  horizontalPadding,
  rawText,
  eventName,
  date,
  time,
  venue,
  isSaving,
  onFieldChange,
  onSave,
  onCancel,
}: ReviewFormProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const dateRef = useRef<TextFieldRef>(null);
  const timeRef = useRef<TextFieldRef>(null);
  const locationRef = useRef<TextFieldRef>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorTokens.surface }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: horizontalPadding }}
          >
            <Text
              headline
              accessibilityRole="header"
              style={{ marginTop: spacing.lg, marginBottom: spacing.lg }}
            >
              Confirm Event Details
            </Text>

            {rawText?.trim() ? (
              <View style={{ marginBottom: spacing.lg }}>
                <ExtractedTextPreview rawText={rawText} />
              </View>
            ) : null}

            <EventField
              label="Event Name"
              value={eventName}
              onChangeText={text => onFieldChange('eventName', text)}
              focused={focusedField === 'eventName'}
              onFocus={() => setFocusedField('eventName')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="next"
              onSubmitEditing={() => dateRef.current?.focus()}
            />

            <EventField
              ref={dateRef}
              label="Date"
              value={date}
              onChangeText={text => onFieldChange('date', text)}
              focused={focusedField === 'date'}
              onFocus={() => setFocusedField('date')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="next"
              onSubmitEditing={() => timeRef.current?.focus()}
            />

            <EventField
              ref={timeRef}
              label="Time"
              value={time}
              onChangeText={text => onFieldChange('time', text)}
              focused={focusedField === 'time'}
              onFocus={() => setFocusedField('time')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="next"
              onSubmitEditing={() => locationRef.current?.focus()}
            />

            <EventField
              ref={locationRef}
              label="Location"
              value={venue}
              onChangeText={text => onFieldChange('venue', text)}
              focused={focusedField === 'venue'}
              onFocus={() => setFocusedField('venue')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              marginBottom={spacing.xl}
            />

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
                onPress={onSave}
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

            <TouchableOpacity
              onPress={onCancel}
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
