import { Colors, ThemeManager, Typography } from 'react-native-ui-lib';
import { typeScale } from './typography';

// Digital Concierge color tokens
export const colorTokens = {
  primary: '#005bbf',
  primaryContainer: '#1a73e8',
  primaryFixedDim: '#adc7ff',
  surface: '#f8f9fa',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f4f5',
  surfaceContainerHigh: '#e7e8e9',
  surfaceContainerHighest: '#e1e3e4',
  onSurface: '#191c1d',
  onSurfaceVariant: '#414754',
  outlineVariant: '#c1c6d6',
  error: '#ba1a1a',
  white: '#ffffff',
} as const;

// 4px grid spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Component corner radii
export const radii = {
  lg: 8,   // buttons
  xl: 12,  // cards, input fields
} as const;

export function configureTheme() {
  // Register color tokens
  Colors.loadColors(colorTokens);

  // Register typography presets
  Typography.loadTypographies({
    display: typeScale.display,
    headline: typeScale.headline,
    title: typeScale.title,
    body: typeScale.body,
    label: typeScale.label,
    caption: typeScale.caption,
  });

  // Configure component defaults
  ThemeManager.setComponentTheme('Text', {
    color: colorTokens.onSurface,
  });

  ThemeManager.setComponentTheme('View', {
    backgroundColor: colorTokens.surface,
  });

  ThemeManager.setComponentTheme('TextField', {
    style: {
      fontFamily: typeScale.body.fontFamily,
      fontSize: typeScale.body.fontSize,
      color: colorTokens.onSurface,
    },
    fieldStyle: {
      backgroundColor: colorTokens.surfaceContainerLow,
      borderRadius: radii.xl,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + spacing.xs,
    },
    labelStyle: {
      fontFamily: typeScale.label.fontFamily,
      fontSize: typeScale.label.fontSize,
      color: colorTokens.onSurfaceVariant,
      marginBottom: spacing.xs,
    },
    placeholderTextColor: 'transparent',
  });

  ThemeManager.setComponentTheme('Button', {
    labelStyle: {
      fontFamily: typeScale.title.fontFamily,
      fontSize: typeScale.title.fontSize,
    },
    style: {
      minHeight: 48,
      borderRadius: radii.lg,
    },
  });
}
