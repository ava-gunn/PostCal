import { View, Text, Card } from 'react-native-ui-lib';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { colorTokens, spacing, radii } from '@/theme/digital-concierge';

const STEPS = [
  {
    number: '1',
    title: 'Share from Instagram',
    description: 'Tap share on any event post, then select PostCal',
  },
  {
    number: '2',
    title: 'Review Details',
    description: 'Check the extracted event name, date, time, and venue',
  },
  {
    number: '3',
    title: 'Save to Calendar',
    description: 'One tap saves the event to your device calendar',
  },
];

function useResponsiveSpacing() {
  const { width } = useWindowDimensions();
  const isSmall = width < 375;

  return {
    horizontalPadding: isSmall ? spacing.md : spacing.lg,
    titleTopMargin: isSmall ? spacing.xl : spacing['2xl'],
    titleBottomMargin: isSmall ? spacing.md : spacing.lg,
    sectionHeaderBottom: isSmall ? spacing.lg : spacing.xl,
    cardGap: isSmall ? spacing.sm : spacing.md,
    cardPadding: spacing.md,
  };
}

export default function HomeScreen() {
  const responsive = useResponsiveSpacing();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorTokens.surface }}>
      <View flex padding-0 style={{ paddingHorizontal: responsive.horizontalPadding }}>
        <Text
          display
          accessibilityRole="header"
          style={{
            marginTop: responsive.titleTopMargin,
            marginBottom: responsive.titleBottomMargin,
          }}
        >
          PostCal
        </Text>

        <Text
          title
          style={{ marginBottom: responsive.sectionHeaderBottom }}
        >
          How it Works
        </Text>

        {STEPS.map((step) => (
          <Card
            key={step.number}
            style={{
              backgroundColor: colorTokens.surfaceContainerLowest,
              borderRadius: radii.xl,
              padding: responsive.cardPadding,
              marginBottom: responsive.cardGap,
            }}
            accessibilityLabel={`Step ${step.number}: ${step.title}. ${step.description}.`}
          >
            <Text
              headline
              style={{ color: colorTokens.primary, marginBottom: spacing.xs }}
            >
              {step.number}
            </Text>
            <Text
              title
              style={{ marginBottom: spacing.xs }}
            >
              {step.title}
            </Text>
            <Text
              body
              style={{ color: colorTokens.onSurfaceVariant }}
            >
              {step.description}
            </Text>
          </Card>
        ))}
      </View>
    </SafeAreaView>
  );
}
