import { useCallback, useEffect, useRef } from 'react';
import { Platform, BackHandler, useWindowDimensions } from 'react-native';
import { useShareIntentContext } from 'expo-share-intent';
import { useRouter } from 'expo-router';

import { useExtraction } from '@/context/extraction-context';
import { parseShareIntent } from '@/lib/extraction/parse-share-intent';
import { runPipeline } from '@/lib/extraction/run-pipeline';
import { requestCalendarPermission } from '@/lib/calendar/request-permission';
import { buildCalendarEvent, writeEvent } from '@/lib/calendar/write-event';
import { spacing } from '@/theme/digital-concierge';
import { ReviewError } from '@/components/review/ReviewError';
import { ReviewExtracting } from '@/components/review/ReviewExtracting';
import { ReviewForm } from '@/components/review/ReviewForm';
import type { ExtractionResult, SharedContent } from '@/lib/extraction/types';

function useResponsiveSpacing() {
  const { width } = useWindowDimensions();
  const isSmall = width < 375;
  return { horizontalPadding: isSmall ? spacing.md : spacing.lg };
}

export function isExtractionFailure(result: ExtractionResult): boolean {
  return !result.eventName && !result.date && !result.time && !result.venue && !result.rawText;
}

export default function ReviewScreen() {
  const { hasShareIntent, shareIntent } = useShareIntentContext();
  const { extraction, userEdits, setUserEdit, setSharedContent, setExtraction, setStatus, status, sharedContent, reset } = useExtraction();
  const router = useRouter();
  const responsive = useResponsiveSpacing();

  const isNavigating = useRef(false);
  const cancelledRef = useRef(false);

  const runExtraction = useCallback((content: SharedContent) => {
    cancelledRef.current = false;
    setStatus('extracting');

    runPipeline(content)
      .then(result => {
        if (!cancelledRef.current) {
          setExtraction(result);
          setStatus(isExtractionFailure(result) ? 'error' : 'ready');
        }
      })
      .catch(() => {
        if (!cancelledRef.current) {
          setExtraction(null);
          setStatus('error');
        }
      });
  }, [setExtraction, setStatus]);

  useEffect(() => {
    if (!hasShareIntent || !shareIntent) return;
    const content = parseShareIntent(shareIntent);
    if (!content) return;
    setSharedContent(content);
    runExtraction(content);
    return () => {
      cancelledRef.current = true;
    };
  }, [hasShareIntent, shareIntent, setSharedContent, runExtraction]);

  useEffect(() => {
    if (!hasShareIntent && !sharedContent && status === 'idle') {
      router.replace('/');
    }
  }, [hasShareIntent, sharedContent, status, router]);

  useEffect(() => {
    const onBackPress = () => {
      if (isNavigating.current) return true;
      isNavigating.current = true;
      reset();
      BackHandler.exitApp();
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [reset]);

  const handleFieldChange = (field: keyof Omit<ExtractionResult, 'confidence' | 'rawText'>, text: string) => {
    setUserEdit(field, text || null);
  };

  const handleCancel = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    reset();
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    } else {
      router.replace('/');
    }
  };

  const handleSave = async () => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    const granted = await requestCalendarPermission();
    if (!granted) {
      isNavigating.current = false;
      return;
    }

    try {
      const calendarEvent = buildCalendarEvent(extraction, userEdits);
      setStatus('saving');
      await writeEvent(calendarEvent);
      setStatus('saved');
      router.replace('/success');
    } catch (error) {
      console.warn('Calendar write failed:', error);
      setStatus('ready');
      isNavigating.current = false;
    }
  };

  const handleEnterManually = () => {
    if (isNavigating.current) return;
    cancelledRef.current = true;
    setExtraction(null);
    setStatus('ready');
  };

  const handleTryAgain = () => {
    if (isNavigating.current) return;
    cancelledRef.current = true;
    if (sharedContent) {
      runExtraction(sharedContent);
    }
  };

  if (status === 'error') {
    return <ReviewError onEnterManually={handleEnterManually} onTryAgain={handleTryAgain} />;
  }

  if (status === 'extracting') {
    return <ReviewExtracting />;
  }

  const eventName = userEdits.eventName ?? extraction?.eventName ?? '';
  const date = userEdits.date ?? extraction?.date ?? '';
  const time = userEdits.time ?? extraction?.time ?? '';
  const venue = userEdits.venue ?? extraction?.venue ?? '';

  return (
    <ReviewForm
      horizontalPadding={responsive.horizontalPadding}
      rawText={extraction?.rawText}
      eventName={eventName}
      date={date}
      time={time}
      venue={venue}
      isSaving={status === 'saving'}
      onFieldChange={handleFieldChange}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
