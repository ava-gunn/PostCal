import { ExtractedTextPreview } from '../extracted-text-preview';

// Mock react-native-ui-lib
jest.mock('react-native-ui-lib', () => ({
  View: 'View',
  Text: ({ children, ...props }: any) => ({ type: 'Text', props: { ...props, children } }),
}));

// Mock theme
jest.mock('@/theme/digital-concierge', () => ({
  colorTokens: {
    surfaceContainerLow: '#f3f4f5',
    onSurfaceVariant: '#414754',
  },
  spacing: { md: 16 },
  radii: { xl: 12 },
}));

describe('ExtractedTextPreview', () => {
  it('renders text when rawText is provided', () => {
    const result = ExtractedTextPreview({ rawText: 'Event details here' });
    expect(result).not.toBeNull();
  });

  it('renders nothing when rawText is null', () => {
    const result = ExtractedTextPreview({ rawText: null });
    expect(result).toBeNull();
  });

  it('renders nothing when rawText is empty string', () => {
    const result = ExtractedTextPreview({ rawText: '' });
    expect(result).toBeNull();
  });

  it('renders nothing when rawText is whitespace only', () => {
    const result = ExtractedTextPreview({ rawText: '   \n\t  ' });
    expect(result).toBeNull();
  });
});
