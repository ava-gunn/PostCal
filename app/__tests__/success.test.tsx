// Mock native/UI modules that can't be parsed in node environment
jest.mock('react-native', () => ({
  Animated: {
    Value: jest.fn().mockImplementation((val: number) => val),
    View: 'Animated.View',
    timing: jest.fn().mockReturnValue({ start: (cb?: () => void) => cb?.() }),
  },
  BackHandler: { exitApp: jest.fn() },
  Platform: { OS: 'ios' },
  TouchableOpacity: 'TouchableOpacity',
  TouchableWithoutFeedback: 'TouchableWithoutFeedback',
  AccessibilityInfo: { isReduceMotionEnabled: jest.fn().mockResolvedValue(false) },
}));
jest.mock('react-native-ui-lib', () => ({
  View: 'View',
  Text: 'Text',
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));
jest.mock('@/context/extraction-context', () => ({
  useExtraction: () => ({ extraction: null, userEdits: {}, reset: jest.fn() }),
}));
jest.mock('@/theme/digital-concierge', () => ({
  colorTokens: {},
  spacing: {},
  radii: {},
}));
jest.mock('@/theme/typography', () => ({
  typeScale: { title: {} },
}));

import { getDisplayEventName, AUTO_DISMISS_MS, FADE_DURATION_MS } from '../success';

describe('SuccessScreen', () => {
  describe('getDisplayEventName', () => {
    it('uses extraction event name when no user edits', () => {
      const result = getDisplayEventName({}, { eventName: 'DJ Night at Warehouse' });
      expect(result).toBe('DJ Night at Warehouse');
    });

    it('uses user edit over extraction', () => {
      const result = getDisplayEventName(
        { eventName: 'Edited Name' },
        { eventName: 'Original Name' },
      );
      expect(result).toBe('Edited Name');
    });

    it('returns fallback when event name is null in extraction', () => {
      const result = getDisplayEventName({}, { eventName: null });
      expect(result).toBe('Your event');
    });

    it('returns fallback when extraction is null', () => {
      const result = getDisplayEventName({}, null);
      expect(result).toBe('Your event');
    });

    it('returns fallback when both sources have no event name', () => {
      const result = getDisplayEventName({}, {});
      expect(result).toBe('Your event');
    });

    it('uses user edit even when extraction is null', () => {
      const result = getDisplayEventName({ eventName: 'User Event' }, null);
      expect(result).toBe('User Event');
    });

    it('treats explicit null user edit as absent (falls through to extraction)', () => {
      const result = getDisplayEventName(
        { eventName: null },
        { eventName: 'Extraction Name' },
      );
      expect(result).toBe('Extraction Name');
    });
  });

  describe('constants', () => {
    it('auto-dismiss is 2 seconds', () => {
      expect(AUTO_DISMISS_MS).toBe(2000);
    });

    it('fade duration is 300ms', () => {
      expect(FADE_DURATION_MS).toBe(300);
    });
  });
});
