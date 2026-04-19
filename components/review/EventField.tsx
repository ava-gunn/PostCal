import { forwardRef } from 'react';
import type { ReturnKeyTypeOptions } from 'react-native';
import { View, TextField, TextFieldRef } from 'react-native-ui-lib';

import { colorTokens, spacing, radii } from '@/theme/digital-concierge';

const primaryBorderFocused = `${colorTokens.primary}66`;

interface EventFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  marginBottom?: number;
}

export const EventField = forwardRef<TextFieldRef, EventFieldProps>(function EventField(
  { label, value, onChangeText, focused, onFocus, onBlur, returnKeyType, onSubmitEditing, marginBottom = spacing.md },
  ref,
) {
  return (
    <View style={{ marginBottom }}>
      <TextField
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        label={label}
        floatingPlaceholder={false}
        containerStyle={{
          borderRadius: radii.xl,
          borderWidth: focused ? 2 : 0,
          borderColor: focused ? primaryBorderFocused : 'transparent',
        }}
        fieldStyle={{
          backgroundColor: focused ? colorTokens.surfaceContainerLowest : colorTokens.surfaceContainerLow,
          borderRadius: radii.xl,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm + spacing.xs,
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        accessibilityLabel={label}
      />
    </View>
  );
});
