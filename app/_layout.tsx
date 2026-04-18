import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import 'react-native-reanimated';

import { fonts } from '@/theme/typography';
import { configureTheme } from '@/theme/digital-concierge';
import { ExtractionProvider, useExtraction } from '@/context/extraction-context';

// Prevent splash screen from auto-hiding before fonts load
SplashScreen.preventAutoHideAsync();

// Configure theme before any component renders
configureTheme();

function ShareIntentBridge() {
  const { hasShareIntent } = useShareIntentContext();
  const { reset } = useExtraction();
  const router = useRouter();
  const hadShareIntent = useRef(false);
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    if (hasShareIntent) {
      if (!hadShareIntent.current) {
        hadShareIntent.current = true;
        routerRef.current.push('/review');
      }
    } else if (hadShareIntent.current) {
      hadShareIntent.current = false;
      reset();
      routerRef.current.replace('/');
    }
  }, [hasShareIntent, reset]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fonts);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Allow rendering even if fonts fail (falls back to system fonts)
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ShareIntentProvider options={{ resetOnBackground: true, debug: __DEV__ }}>
      <ExtractionProvider>
        <ShareIntentBridge />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="review" />
          <Stack.Screen name="success" />
        </Stack>
        <StatusBar style="dark" />
      </ExtractionProvider>
    </ShareIntentProvider>
  );
}
