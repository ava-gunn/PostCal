import { View, Text } from 'react-native-ui-lib';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colorTokens } from '@/theme/digital-concierge';

export function ReviewExtracting() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorTokens.surface }}>
      <View flex center>
        <Text body>Processing shared content...</Text>
      </View>
    </SafeAreaView>
  );
}
