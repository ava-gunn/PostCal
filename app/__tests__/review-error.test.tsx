jest.mock('react-native', () => ({
  BackHandler: {
    exitApp: jest.fn(),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Platform: { OS: 'ios' },
  TouchableOpacity: 'TouchableOpacity',
  TouchableWithoutFeedback: 'TouchableWithoutFeedback',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  ScrollView: 'ScrollView',
  Keyboard: { dismiss: jest.fn() },
  useWindowDimensions: () => ({ width: 400 }),
}));
jest.mock('react-native-ui-lib', () => ({
  View: 'View',
  Text: 'Text',
  TextField: 'TextField',
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));
jest.mock('expo-share-intent', () => ({
  useShareIntentContext: () => ({ hasShareIntent: false, shareIntent: null }),
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));
jest.mock('@/context/extraction-context', () => ({
  useExtraction: () => ({
    extraction: null,
    userEdits: {},
    status: 'idle',
    sharedContent: null,
    setExtraction: jest.fn(),
    setStatus: jest.fn(),
    setSharedContent: jest.fn(),
    setUserEdit: jest.fn(),
    reset: jest.fn(),
  }),
}));
jest.mock('@/lib/extraction/parse-share-intent', () => ({
  parseShareIntent: jest.fn(),
}));
jest.mock('@/lib/extraction/run-pipeline', () => ({
  runPipeline: jest.fn(),
}));
jest.mock('@/lib/calendar/request-permission', () => ({
  requestCalendarPermission: jest.fn(),
}));
jest.mock('@/lib/calendar/write-event', () => ({
  buildCalendarEvent: jest.fn(),
  writeEvent: jest.fn(),
}));
jest.mock('@/theme/digital-concierge', () => ({
  colorTokens: {
    surface: '#f8f9fa',
    onSurface: '#1a1c1e',
    onSurfaceVariant: '#42474e',
    primary: '#005cbb',
    primaryContainer: '#d6e3ff',
    surfaceContainerHigh: '#dde3ea',
    surfaceContainerLow: '#eef0f4',
    surfaceContainerLowest: '#ffffff',
    white: '#ffffff',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radii: { lg: 12, xl: 16 },
}));
jest.mock('@/theme/typography', () => ({
  typeScale: { title: { fontFamily: 'Manrope-Bold' } },
}));
jest.mock('@/components/extracted-text-preview', () => ({
  ExtractedTextPreview: 'ExtractedTextPreview',
}));

import type { ExtractionResult } from '@/lib/extraction/types';
import { isExtractionFailure } from '../review';

describe('isExtractionFailure', () => {
  it('returns true when all fields are null', () => {
    const result: ExtractionResult = {
      eventName: null,
      date: null,
      time: null,
      venue: null,
      rawText: null,
    };
    expect(isExtractionFailure(result)).toBe(true);
  });

  it('returns false when eventName is present', () => {
    const result: ExtractionResult = {
      eventName: 'DJ Night',
      date: null,
      time: null,
      venue: null,
      rawText: null,
    };
    expect(isExtractionFailure(result)).toBe(false);
  });

  it('returns false when date is present', () => {
    const result: ExtractionResult = {
      eventName: null,
      date: '2026-04-10',
      time: null,
      venue: null,
      rawText: null,
    };
    expect(isExtractionFailure(result)).toBe(false);
  });

  it('returns false when time is present', () => {
    const result: ExtractionResult = {
      eventName: null,
      date: null,
      time: '20:00',
      venue: null,
      rawText: null,
    };
    expect(isExtractionFailure(result)).toBe(false);
  });

  it('returns false when venue is present', () => {
    const result: ExtractionResult = {
      eventName: null,
      date: null,
      time: null,
      venue: 'The Warehouse',
      rawText: null,
    };
    expect(isExtractionFailure(result)).toBe(false);
  });

  it('returns false when rawText is present', () => {
    const result: ExtractionResult = {
      eventName: null,
      date: null,
      time: null,
      venue: null,
      rawText: 'Some extracted text from the post',
    };
    expect(isExtractionFailure(result)).toBe(false);
  });

  it('returns false when multiple fields are present (partial extraction)', () => {
    const result: ExtractionResult = {
      eventName: 'Party',
      date: '2026-05-01',
      time: null,
      venue: null,
      rawText: null,
    };
    expect(isExtractionFailure(result)).toBe(false);
  });

  it('treats empty string as falsy (extraction failure)', () => {
    const result: ExtractionResult = {
      eventName: '',
      date: '',
      time: '',
      venue: '',
      rawText: '',
    };
    expect(isExtractionFailure(result)).toBe(true);
  });
});
