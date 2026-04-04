# Story 3.3: Success Confirmation with Auto-Dismiss

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see a brief confirmation that my event was saved,
so that I have confidence it's in my calendar and can return to what I was doing.

## Acceptance Criteria

1. **Given** an event has been successfully saved to the device calendar
   **When** the Success screen renders
   **Then** the screen displays "Saved to Calendar" as the headline (Manrope Bold 24px, `headline` preset)
   **And** an understated checkmark icon is displayed (not celebratory — proportional to the micro-task)
   **And** the saved event name is displayed as confirmation text

2. **Given** the Success screen is displayed
   **When** 2 seconds have elapsed
   **Then** the screen auto-dismisses with a fade transition
   **And** the user returns to the previous app context (Android: `BackHandler.exitApp()`, iOS: `router.replace('/')`)

3. **Given** the system reduced motion preference is enabled
   **When** the Success screen auto-dismisses
   **Then** the screen dismisses instantly without the fade animation (NFR13)

4. **Given** the auto-dismiss timer is active
   **When** the user taps the "Done" primary CTA or taps the screen
   **Then** the screen dismisses immediately without waiting for the timer

5. **Given** the "Done" button is displayed
   **When** the user views it
   **Then** it uses gradient fill styling (`primary` #005bbf → `primaryContainer` #1a73e8 at 135° via `expo-linear-gradient`), white text, Manrope Bold, full-width, 48px minimum height — consistent with all primary CTAs

6. **Given** a screen reader is active
   **When** the Success screen renders
   **Then** the confirmation text is announced via `accessibilityLiveRegion="polite"`
   **And** the "Done" button has `accessibilityLabel="Done"` and `accessibilityRole="button"`

## Tasks / Subtasks

- [x] Task 1: Build Success screen layout (AC: #1, #5)
  - [x] Replace placeholder content in `app/success.tsx`
  - [x] Import `useExtraction` from `@/context/extraction-context`
  - [x] Import `colorTokens`, `spacing`, `radii` from `@/theme/digital-concierge`
  - [x] Import `typeScale` from `@/theme/typography`
  - [x] Import `LinearGradient` from `expo-linear-gradient`
  - [x] Import `BackHandler`, `Platform`, `TouchableWithoutFeedback` from `react-native`
  - [x] Import `Animated` from `react-native` (for fade transition)
  - [x] Compute display event name: `userEdits.eventName ?? extraction?.eventName ?? 'Your event'`
  - [x] Render centered layout with `surface` background
  - [x] Render checkmark icon — use `@expo/vector-icons` Ionicons `checkmark-circle-outline` (48px, `primary` color) — understated, not celebratory
  - [x] Render "Saved to Calendar" headline with `accessibilityRole="header"`
  - [x] Render event name in `body` preset, `onSurfaceVariant` color
  - [x] Render "Done" gradient button at bottom (same pattern as Review screen Save button): `LinearGradient` wrapper + `TouchableOpacity` inside, `start={{ x: 1, y: 0 }}` / `end={{ x: 0, y: 1 }}` for 135° angle
  - [x] Wrap entire screen in `TouchableWithoutFeedback` with `onPress` that triggers immediate dismiss (AC #4)

- [x] Task 2: Implement auto-dismiss with fade (AC: #2, #3)
  - [x] Create `fadeAnim` using `useRef(new Animated.Value(1))`
  - [x] Use `useEffect` to start a 2-second `setTimeout` on mount
  - [x] When timer fires: check `AccessibilityInfo.isReduceMotionEnabled()` (async)
  - [x] If reduced motion: dismiss immediately (no animation)
  - [x] If normal motion: run `Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })` then dismiss
  - [x] Wrap root `View` in `Animated.View` with `style={{ opacity: fadeAnim }}`
  - [x] Dismiss function: call `reset()` on context, then platform-specific exit (Android: `BackHandler.exitApp()`, iOS: `router.replace('/')`) — same pattern as `handleCancel` in `review.tsx`
  - [x] Return cleanup function to clear the timeout on unmount

- [x] Task 3: Wire "Done" button and tap-to-dismiss (AC: #4)
  - [x] "Done" `onPress` calls dismiss function immediately (clears timer, skips animation)
  - [x] `TouchableWithoutFeedback` wrapping the screen calls same dismiss
  - [x] Use `isNavigating` ref pattern (from review.tsx) to prevent double-fire
  - [x] Clear the auto-dismiss timeout before manual dismiss

- [x] Task 4: Accessibility (AC: #6)
  - [x] Add `accessibilityLiveRegion="polite"` to the `View` containing event name confirmation
  - [x] Add `accessibilityLabel="Done"` and `accessibilityRole="button"` on Done button
  - [x] Add `accessibilityRole="header"` on "Saved to Calendar" headline

- [x] Task 5: Write tests
  - [x] Create `app/__tests__/success.test.tsx`
  - [x] Test: event name display logic (7 test cases covering extraction, user edits, null, fallback)
  - [x] Test: auto-dismiss and fade duration constants
  - [x] Jest config updated to include `app` in test roots

## Dev Notes

### Emotional Design Principle

This screen embodies "quiet competence" and "proportional response." A 5-second interaction gets a 1-second confirmation. Do NOT over-celebrate a micro-task — no confetti, no large animations, no "Congratulations!" text.

### Architecture Boundaries

- `app/success.tsx` is the ONLY file that should contain React/UI code for this story
- NO new files in `lib/` needed — this is purely a presentation screen
- Import from context to read saved event data; do NOT duplicate state
- Use `reset()` from ExtractionContext on dismiss to clean up state

### Established Patterns to Follow

| Pattern | Source | How to Apply |
|---------|--------|--------------|
| Gradient button | `app/review.tsx:258-284` | `LinearGradient` wrapper + `TouchableOpacity`, start `{x:1,y:0}` / end `{x:0,y:1}` |
| Platform-specific dismiss | `app/review.tsx:113-118` | Android: `BackHandler.exitApp()`, iOS: `router.replace('/')` |
| Double-tap prevention | `app/review.tsx:47,106` | `const isNavigating = useRef(false)` — check and set before async work |
| Context reading | `app/review.tsx:41` | `const { extraction, userEdits, status, reset } = useExtraction()` |
| Responsive spacing | `app/review.tsx:30-37` | `useWindowDimensions()` with width < 375 breakpoint |
| SafeAreaView wrapper | `app/review.tsx:161` | `SafeAreaView style={{ flex: 1, backgroundColor: colorTokens.surface }}` |
| Headline style | `app/review.tsx:175-181` | `<Text headline accessibilityRole="header">` |

### Theme Tokens Reference

- Background: `colorTokens.surface` (#f8f9fa)
- Headline: `headline` preset (Manrope-Bold 24px)
- Body text: `body` preset (Inter-Medium 14px), `colorTokens.onSurfaceVariant`
- Icon color: `colorTokens.primary` (#005bbf)
- Gradient: `[colorTokens.primary, colorTokens.primaryContainer]` at 135°
- Button text: `colorTokens.white`, `typeScale.title.fontFamily` (Manrope-Bold), fontSize 16
- Spacing: `spacing.lg` (24), `spacing.md` (16), `spacing.xl` (32)

### Icon Decision

Use `@expo/vector-icons` which is bundled with Expo — no new dependency. Ionicons `checkmark-circle-outline` at 48px size in `primary` color provides the understated look the UX spec requires. Do NOT use a filled/solid icon or anything larger.

Check if `@expo/vector-icons` is already available (it ships with Expo by default). Import as:
```typescript
import { Ionicons } from '@expo/vector-icons';
```

### Reduced Motion Check

```typescript
import { AccessibilityInfo } from 'react-native';

// Inside the timer callback:
const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
if (reduceMotion) {
  dismiss(); // instant
} else {
  // fade then dismiss
}
```

### Navigation After Dismiss

The success screen was reached via `router.replace('/success')` from review.tsx. On dismiss:
- Android: `BackHandler.exitApp()` — returns user to Instagram (or whichever app shared)
- iOS: `router.replace('/')` — returns to PostCal home (iOS cannot programmatically exit)
- Call `reset()` BEFORE navigation to clean up ExtractionContext

### What NOT to Do

- Do NOT add a back button or back navigation
- Do NOT show event details beyond the event name (no date, time, location on success screen)
- Do NOT add an "Open Calendar" button (user should return to Instagram)
- Do NOT use `router.push` — only `router.replace`
- Do NOT add `Animated` from `react-native-reanimated` — use React Native's built-in `Animated` API (simpler, sufficient for a single fade)
- Do NOT reset context before the fade animation completes

### Project Structure Notes

- File: `app/success.tsx` (already exists as placeholder — replace content)
- Test: `app/__tests__/success.test.tsx` (new file)
- No changes to `_layout.tsx`, `review.tsx`, or any other files
- No new `lib/` modules or `components/` needed

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 3, Story 3.3]
- [Source: _bmad-output/planning-artifacts/prd.md#FR21, FR22, UX-DR3, UX-DR9, NFR13]
- [Source: _bmad-output/planning-artifacts/architecture.md#Navigation Patterns, Data Flow]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Success Screen, Feedback Patterns, Emotional Design]
- [Source: _bmad-output/implementation-artifacts/3-2-calendar-permission-and-event-save.md#Dev Notes]
- [Source: _bmad-output/implementation-artifacts/3-1-review-screen-with-pre-populated-event-form.md#Dev Notes]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

### Completion Notes List

- Task 1: Built complete success screen layout with checkmark icon (Ionicons checkmark-circle-outline, 48px), "Saved to Calendar" headline, event name display, gradient "Done" button (135° angle matching review screen), and tap-to-dismiss wrapper
- Task 2: Auto-dismiss via 2-second setTimeout, reduced motion check via AccessibilityInfo.isReduceMotionEnabled(), fade animation (300ms Animated.timing with useNativeDriver), cleanup on unmount
- Task 3: Done button and screen tap both call dismiss (clears timer, resets context, platform-specific exit). isNavigating ref prevents double-fire
- Task 4: accessibilityLiveRegion="polite" on event name, accessibilityRole="header" on headline, accessibilityLabel="Done" + accessibilityRole="button" on Done button
- Task 5: 9 tests covering getDisplayEventName logic (7 cases) and timer/fade constants (2 cases). Jest config updated to include app/ in roots. Mocks for react-native, RNUILib, expo modules needed for node environment
- Extracted getDisplayEventName as exported pure function for testability
- All 86 tests pass (9 new + 77 existing, 0 regressions)
- Code review fix (P5): Added BackHandler useEffect for Android hardware back button — calls dismiss() and returns true
- Code review fix (P6): Wrapped AccessibilityInfo.isReduceMotionEnabled() in try/catch — defaults to animate on rejection
- All 94 tests pass after fixes (0 regressions)

### Change Log

- 2026-04-03: Addressed code review findings — 2 items resolved (P5: missing BackHandler, P6: unhandled promise rejection)

### File List

- app/success.tsx (modified — replaced placeholder with full implementation)
- app/__tests__/success.test.tsx (new — 9 test cases)
- jest.config.ts (modified — added 'app' to roots)
