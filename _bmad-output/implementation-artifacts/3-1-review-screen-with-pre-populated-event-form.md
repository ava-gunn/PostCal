# Story 3.1: Review Screen with Pre-Populated Event Form

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see the extracted event details pre-populated in an editable form,
so that I can quickly verify the information and make corrections before saving.

## Acceptance Criteria

1. **Given** the extraction pipeline has completed with results in ExtractionContext
   **When** the Review screen renders
   **Then** the screen displays "Confirm Event Details" as the headline (Manrope Bold 24px)
   **And** four editable TextFields are displayed in order: Event Name, Date, Time, Location
   **And** each field is pre-populated with the corresponding value from ExtractionResult
   **And** fields with `null` extraction values are displayed as empty (no placeholder text)

2. **Given** the extraction produced raw text
   **When** the Review screen renders
   **Then** an Extracted Text Preview component is displayed at the top of the form showing the raw source text
   **And** the preview uses `surfaceContainerLow` background with `onSurfaceVariant` text at caption size (Inter Regular 11px)
   **And** the preview is static and non-interactive

3. **Given** no raw text was extracted (image-only share with no OCR result)
   **When** the Review screen renders
   **Then** the Extracted Text Preview component is hidden entirely

4. **Given** the Review screen is displayed
   **When** the user taps any TextField
   **Then** the field background shifts to `surfaceContainerLowest` (#ffffff) with a 2px ghost border in `primary` (#005bbf) at 40% opacity
   **And** the appropriate keyboard opens
   **And** the "Next" key advances to the next field in order (Name → Date → Time → Location)
   **And** the "Done" key on the last field dismisses the keyboard
   **And** tapping outside any field dismisses the keyboard
   **And** a `KeyboardAvoidingView` wraps the form so no fields are obscured by the keyboard

5. **Given** all TextFields use Digital Concierge styling
   **When** the fields are in their default (unfocused) state
   **Then** each field has `surfaceContainerLow` (#f3f4f5) fill, no borders, `rounded-xl` corners
   **And** labels appear above each field in Inter Semibold 12px `onSurfaceVariant`

6. **Given** the user edits a field value
   **When** the user types in a TextField
   **Then** `setUserEdit(fieldName, newValue)` is called on ExtractionContext
   **And** the field displays the edited value
   **And** the original extraction value is preserved in `extraction` (not overwritten)

7. **Given** a screen reader (VoiceOver/TalkBack) is active
   **When** the user navigates the Review screen
   **Then** reading order follows: extracted text preview → Event Name → Date → Time → Location → Save to Calendar → Cancel
   **And** each TextField has an `accessibilityLabel` matching its visible label
   **And** the screen title has `accessibilityRole="header"`

## Tasks / Subtasks

- [x] Task 1: Create Extracted Text Preview component (AC: #2, #3)
  - [x]Create `components/extracted-text-preview.tsx`
  - [x]Accept `rawText: string | null` prop
  - [x]If `rawText` is null or empty after trim, render nothing (return null)
  - [x]Render a `View` with `surfaceContainerLow` background, `rounded-xl` corners, `md` (16px) padding
  - [x]Render `Text` with `caption` preset, `onSurfaceVariant` color, max 4 lines with `numberOfLines={4}`
  - [x]Add `accessibilityLabel="Extracted text from shared post"`
  - [x]Export as named export `ExtractedTextPreview`

- [x] Task 2: Build Review screen form layout (AC: #1, #5)
  - [x]Replace the current placeholder content in `app/review.tsx`
  - [x]Wrap form content in `KeyboardAvoidingView` with `behavior="padding"` on iOS
  - [x]Add `ScrollView` with `keyboardShouldPersistTaps="handled"` inside KeyboardAvoidingView
  - [x]Add `TouchableWithoutFeedback` wrapping content with `onPress={Keyboard.dismiss}` for tap-outside-to-dismiss
  - [x]Add "Confirm Event Details" headline with `accessibilityRole="header"`
  - [x]Add `ExtractedTextPreview` component below headline, passing `extraction?.rawText`
  - [x]Add four `TextField` components in order: Event Name, Date, Time, Location
  - [x]Each TextField: `surfaceContainerLow` background via `containerStyle`, no border, `rounded-xl` corners
  - [x]Each TextField: label above in `label` preset style (Inter SemiBold 12px, `onSurfaceVariant`)
  - [x]Use `floatingPlaceholder={false}` on all TextFields — labels are static above, never floating
  - [x]No placeholder text inside fields — empty fields stay empty
  - [x]Add `accessibilityLabel` on each TextField matching its label text

- [x] Task 3: Wire TextField values to ExtractionContext (AC: #1, #6)
  - [x]Import `useExtraction` and destructure `extraction`, `userEdits`, `setUserEdit`, `status`
  - [x]Compute display values: `userEdits.eventName ?? extraction?.eventName ?? ''` for each field (convert null to empty string for TextField `value` prop)
  - [x]On each TextField `onChangeText`, call `setUserEdit(fieldName, text || null)` — convert empty string back to null
  - [x]Pre-populate fields only when `status === 'ready'` (not during 'extracting')
  - [x]Show "Processing shared content..." text when `status === 'extracting'`

- [x] Task 4: Implement TextField focus styling (AC: #4)
  - [x]Track focused field via `useState<string | null>(null)` — store the field name
  - [x]On `onFocus`, set focused field name; on `onBlur`, clear it
  - [x]When focused: change `containerStyle` background to `surfaceContainerLowest` (#ffffff)
  - [x]When focused: add 2px border in `primary` (#005bbf) at 40% opacity via `style={{ borderWidth: 2, borderColor: 'rgba(0, 91, 191, 0.4)' }}`
  - [x]When unfocused: `surfaceContainerLow` background, no border (borderWidth: 0)
  - [x]Set `returnKeyType="next"` on Name, Date, Time fields; `returnKeyType="done"` on Location
  - [x]Use `ref` on each TextField; `onSubmitEditing` on each field focuses the next field's ref
  - [x]Location field `onSubmitEditing` calls `Keyboard.dismiss()`

- [x] Task 5: Add placeholder Save/Cancel buttons (AC: #7)
  - [x]Add "Save to Calendar" button below the form fields — gradient CTA (implementation is Story 3.2, but button must be visually present)
  - [x]Use `LinearGradient` from `expo-linear-gradient` wrapping a `TouchableOpacity` with white `Text` (Manrope Bold), full-width, 48px height, `rounded-lg` corners
  - [x]Gradient: `colors={[colorTokens.primary, colorTokens.primaryContainer]}` start `{x: 0, y: 0}` end `{x: 1, y: 1}` (135° angle)
  - [x]Add `accessibilityLabel="Save to Calendar"` and `accessibilityRole="button"`
  - [x]Save button `onPress`: no-op for now (calendar write is Story 3.2) — can show a console.log or alert placeholder
  - [x]Add "Cancel" secondary button below Save — `surfaceContainerHigh` fill, `onSurface` text, Manrope Bold, full-width, 48px height, `rounded-lg`
  - [x]Cancel `onPress`: call `reset()` on ExtractionContext and `router.back()` to dismiss
  - [x]Add `accessibilityLabel="Cancel"` and `accessibilityRole="button"` on Cancel
  - [x]Spacing: `md` (16px) gap between Save and Cancel buttons

- [x] Task 6: Implement responsive layout (AC: #1)
  - [x]Reuse the responsive spacing pattern from `app/index.tsx` — `useWindowDimensions()` width check
  - [x]Screen horizontal padding: `lg` (24px) default, `md` (16px) for small screens (<375pt)
  - [x]Field vertical spacing: `md` (16px) between fields
  - [x]Section spacing: `lg` (24px) between headline and preview, `lg` between preview and first field, `xl` (32px) between last field and buttons
  - [x]Ensure all content is visible without scrolling on standard screens (375pt+)
  - [x]`SafeAreaView` with `backgroundColor: colorTokens.surface` (established pattern)

- [x] Task 7: Write unit tests for ExtractedTextPreview (AC: #2, #3)
  - [x]Create `components/__tests__/extracted-text-preview.test.tsx`
  - [x]Test: renders text when rawText is provided
  - [x]Test: renders nothing when rawText is null
  - [x]Test: renders nothing when rawText is empty string
  - [x]Test: renders nothing when rawText is whitespace only
  - [x]Use `@testing-library/react-native` for component rendering (add as dev dependency if not present)

- [x] Task 8: Run validations (AC: #1–#7)
  - [x]Run `npx jest` — all tests pass (existing + new)
  - [x]Run `npx eslint lib/ app/ components/ context/` — no errors
  - [x]Run `npx tsc --noEmit` — no type errors

## Dev Notes

### Architecture Compliance

**Module Boundary Rules (CRITICAL):**
- `app/review.tsx` is a React screen — it CAN import from `lib/`, `context/`, `components/`, `theme/`
- `components/extracted-text-preview.tsx` is a React component — pure presentational, receives props only
- NO business logic in screen files — field value computation uses ExtractionContext, extraction logic stays in `lib/`
- Only `app/review.tsx` reads from ExtractionContext for field display

**Naming Conventions:**
- File names: `kebab-case.tsx` for React components, `kebab-case.ts` for non-React
- Components: `PascalCase` (e.g., `ExtractedTextPreview`)
- Event handlers: `handle` prefix (e.g., `handleFieldChange`, `handleCancel`)
- Screen components: default export (Expo Router convention)

### RNUILib TextField API Reference

**CRITICAL: Use the correct RNUILib TextField API. Do NOT use React Native's TextInput directly.**

```typescript
import { TextField, Text, View, Button } from 'react-native-ui-lib';

// RNUILib TextField props used in this story:
<TextField
  value={string}
  onChangeText={(text: string) => void}
  label={string}                    // Label text above field
  labelStyle={StyleProp<TextStyle>} // Style the label
  floatingPlaceholder={false}       // MUST be false — labels are static above
  containerStyle={StyleProp<ViewStyle>} // Outer container styling (background, border, radius)
  fieldStyle={StyleProp<ViewStyle>}     // Inner field styling
  style={StyleProp<TextStyle>}          // Text input styling
  onFocus={() => void}
  onBlur={() => void}
  onSubmitEditing={() => void}
  returnKeyType={'next' | 'done'}
  ref={React.RefObject<TextFieldRef>}  // For focusing programmatically
  accessibilityLabel={string}
/>
```

**TextField focus management:**
```typescript
import { TextFieldRef } from 'react-native-ui-lib';

const dateRef = useRef<TextFieldRef>(null);
// To focus: dateRef.current?.focus();
```

**IMPORTANT RNUILib TextField behaviors:**
- `containerStyle` controls the outer wrapper (background color, border, padding, border radius)
- `fieldStyle` controls the inner text area padding
- `style` controls the text input itself (font, color)
- `floatingPlaceholder` defaults to `true` in RNUILib — MUST set to `false` for our design
- `label` + `labelStyle` renders a static label above the field when `floatingPlaceholder={false}`

### KeyboardAvoidingView Pattern

```typescript
import { KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* form content */}
    </ScrollView>
  </TouchableWithoutFeedback>
</KeyboardAvoidingView>
```

**Note:** These are from `react-native` directly — they are layout utilities, NOT UI components. RNUILib is used for the visible UI elements (TextField, Text, View, Button). Layout utilities like `KeyboardAvoidingView`, `ScrollView`, `Platform`, `Keyboard` come from `react-native`.

### Gradient Button Pattern (expo-linear-gradient)

```typescript
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native-ui-lib';

<LinearGradient
  colors={[colorTokens.primary, colorTokens.primaryContainer]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={{
    borderRadius: radii.lg,
    minHeight: 48,
  }}
>
  <TouchableOpacity
    onPress={handleSave}
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 48,
    }}
    accessibilityLabel="Save to Calendar"
    accessibilityRole="button"
  >
    <Text style={{ color: colorTokens.white, fontFamily: 'Manrope-Bold', fontSize: 16 }}>
      Save to Calendar
    </Text>
  </TouchableOpacity>
</LinearGradient>
```

**Why TouchableOpacity inside LinearGradient:** RNUILib `Button` doesn't natively support gradient backgrounds. The gradient wrapper + touchable pattern is the standard Expo approach.

### ExtractionContext Field Mapping

**Field display value computation (merge extraction + userEdits):**

```typescript
const { extraction, userEdits, setUserEdit, status } = useExtraction();

// Display value: userEdits take precedence, then extraction, then empty string
const eventName = userEdits.eventName ?? extraction?.eventName ?? '';
const date = userEdits.date ?? extraction?.date ?? '';
const time = userEdits.time ?? extraction?.time ?? '';
const venue = userEdits.venue ?? extraction?.venue ?? '';
```

**IMPORTANT:** `TextField` `value` must be a string, never null. Convert null → `''` for display. Convert `''` → null when saving edits:

```typescript
const handleFieldChange = (field: keyof Omit<ExtractionResult, 'confidence' | 'rawText'>, text: string) => {
  setUserEdit(field, text || null); // empty string → null
};
```

**Field-to-ExtractionResult mapping:**
| TextField label | ExtractionResult field | userEdits field |
|----------------|----------------------|----------------|
| Event Name | `eventName` | `eventName` |
| Date | `date` | `date` |
| Time | `time` | `time` |
| Location | `venue` | `venue` |

### Existing Code (DO NOT modify unless specified)

- `lib/extraction/` — All extraction pipeline files (Stories 2.1-2.3) — DO NOT modify
- `context/extraction-context.tsx` — ExtractionContext provider — DO NOT modify
- `theme/digital-concierge.ts` — Theme tokens — DO NOT modify
- `theme/typography.ts` — Font configuration — DO NOT modify
- `app/_layout.tsx` — Root layout with providers — DO NOT modify
- `app/index.tsx` — Home screen — DO NOT modify (but reference for patterns)
- `jest.config.ts` — May need update for component tests (add testEnvironment or transform config)

**Files you WILL modify:**
- `app/review.tsx` — Replace placeholder with full form UI

**Files you WILL create:**
- `components/extracted-text-preview.tsx` — Extracted text reference display
- `components/__tests__/extracted-text-preview.test.tsx` — Component tests

### Testing Strategy

**Component tests require `@testing-library/react-native`:**

Check if already installed: `grep '@testing-library/react-native' package.json`. If not present, install as dev dependency: `npx expo install @testing-library/react-native -- --save-dev`

**Jest config may need update for component tests:**
- Current `jest.config.ts` has `roots: ['<rootDir>/lib']` — this only runs tests in `lib/`
- Update to `roots: ['<rootDir>/lib', '<rootDir>/components']` to include component tests
- May need `testEnvironment: 'jsdom'` for React component rendering (or use `jest-expo` preset)

**Alternative approach if jest-expo is problematic:** Keep component tests simple — test the ExtractedTextPreview as a pure function that returns null or a React element, and assert on the output without full DOM rendering.

**expo mock for LinearGradient in tests:**
```typescript
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));
```

### Code Review Findings from Stories 1-1, 1-2, 2-1, 2-2, 2-3

Maintain these patterns established in previous stories:
- All `SafeAreaView` must have `backgroundColor: colorTokens.surface` explicitly set
- Use registered typography presets (`display`, `headline`, `title`, `body`, `label`, `caption`) — never RNUILib built-in presets like `text60`
- Use `trim()` on text inputs before falsy checks to handle whitespace-only strings
- Inline `jest.mock()` works cleanly for native modules — no jest.config.ts changes needed for those
- `npx expo lint` may error on empty dirs — use `npx eslint lib/ app/ components/ context/` instead
- Previous code review found: useEffect in review.tsx now has a `cancelled` flag for race condition prevention — preserve this pattern
- `runPipeline` no longer has a top-level try/catch (OCR failures caught via `.catch(() => null)`) — the `.catch()` in review.tsx IS reachable

### Anti-Patterns to Avoid

- Never use `TextInput` from react-native — always use `TextField` from react-native-ui-lib
- Never put placeholder text inside fields — labels are above, fields are empty when no value
- Never use `floatingPlaceholder={true}` — our design has static labels above fields
- Never hardcode colors — always use `colorTokens` from `theme/digital-concierge`
- Never hardcode font families in style — use typography presets or reference loaded font names
- Never add field validation (min/max length, format checking, required indicators) — all fields accept any input
- Never import `Button` from react-native — use `Button` from react-native-ui-lib for Cancel, and LinearGradient wrapper for Save
- Do NOT implement calendar save logic — that is Story 3.2
- Do NOT build the error screen — that is Story 4.1
- Do NOT implement success screen navigation — that is Story 3.2

### What This Story Does NOT Include

- **No calendar save logic** — "Save to Calendar" button is visually present but functionally a no-op (Story 3.2)
- **No success screen navigation** — navigation to success happens in Story 3.2
- **No error screen** — error state handling is Story 4.1
- **No date picker or time picker** — plain text fields for MVP (user types dates/times as text)
- **No field validation** — no required fields, no format checking, no error states on fields

### Project Structure After This Story

```
app/
  review.tsx                    # (MODIFIED) Full Review screen with form
components/
  extracted-text-preview.tsx    # (NEW) Raw text reference display
  __tests__/
    extracted-text-preview.test.tsx  # (NEW) Component tests
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.1 Acceptance Criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — Frontend Architecture, Component Architecture, State Management, Data Format Patterns, Enforcement Guidelines]
- [Source: _bmad-output/planning-artifacts/prd.md — FR10, FR11, FR12, FR13, FR14, NFR1, NFR9-NFR13]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Review Screen layout, Form Patterns, Button Hierarchy, Extracted Text Preview, TextField Focus State, Keyboard Behavior, Navigation Patterns, Accessibility Strategy, Responsive Strategy]
- [Source: _bmad-output/implementation-artifacts/2-3-date-time-event-name-and-venue-parsing-with-pipeline-orchestration.md — Pipeline wiring in review.tsx, ExtractionContext usage patterns, code review fixes (cancelled flag)]
- [Source: theme/digital-concierge.ts — colorTokens, spacing, radii values]
- [Source: app/index.tsx — Responsive spacing pattern, Card/View/Text usage patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Encountered peer dependency conflict installing `@testing-library/react-native` — resolved with `--legacy-peer-deps`
- Jest failed to parse JSX in component files with default ts-jest config — added `jsx: 'react-jsx'` to ts-jest tsconfig override
- Used simple function-call testing approach for ExtractedTextPreview (no react-test-renderer needed)

### Completion Notes List

- Task 1: Created `ExtractedTextPreview` component — pure presentational, renders raw text in styled container or returns null for empty/null input
- Task 2: Replaced placeholder content in `app/review.tsx` with full form layout — KeyboardAvoidingView, ScrollView, headline, ExtractedTextPreview, four TextFields, Save/Cancel buttons
- Task 3: Wired TextFields to ExtractionContext — display values merge userEdits over extraction, setUserEdit converts empty string to null, extracting state shows loading message
- Task 4: Implemented focus styling — useState tracks focused field, focused fields get white background with 2px primary border at 40% opacity, returnKeyType chains fields, Done dismisses keyboard
- Task 5: Added gradient Save to Calendar button (no-op for Story 3.2) and Cancel button that calls reset() and router.back()
- Task 6: Responsive layout using useWindowDimensions — horizontal padding adjusts for small screens, proper spacing between sections
- Task 7: Created 4 unit tests for ExtractedTextPreview covering: text present, null, empty string, whitespace-only
- Task 8: All 57 tests pass (53 existing + 4 new), zero lint errors, zero type errors

### Change Log

- 2026-04-01: Implemented Story 3.1 — Review Screen with pre-populated event form, extracted text preview, focus styling, gradient Save/Cancel buttons, responsive layout, and unit tests

### File List

- `components/extracted-text-preview.tsx` — NEW: Extracted text preview component
- `components/__tests__/extracted-text-preview.test.tsx` — NEW: Unit tests for ExtractedTextPreview
- `app/review.tsx` — MODIFIED: Full review screen with form, keyboard handling, buttons
- `jest.config.ts` — MODIFIED: Added components root, JSX support for ts-jest
- `package.json` — MODIFIED: Added @testing-library/react-native dev dependency
