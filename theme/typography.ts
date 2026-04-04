import { Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';

export const fonts = {
  'Manrope-Bold': Manrope_700Bold,
  'Manrope-ExtraBold': Manrope_800ExtraBold,
  'Inter-Regular': Inter_400Regular,
  'Inter-Medium': Inter_500Medium,
  'Inter-SemiBold': Inter_600SemiBold,
};

export const typeScale = {
  display: {
    fontFamily: 'Manrope-ExtraBold',
    fontSize: 36,
    letterSpacing: -0.02 * 36,
  },
  headline: {
    fontFamily: 'Manrope-Bold',
    fontSize: 24,
    letterSpacing: -0.02 * 24,
  },
  title: {
    fontFamily: 'Manrope-Bold',
    fontSize: 18,
    letterSpacing: -0.02 * 18,
  },
  body: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    letterSpacing: 0.01 * 14,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    letterSpacing: 0.01 * 12,
  },
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    letterSpacing: 0.01 * 11,
  },
} as const;
