# Story 2.2: Text Parsing & OCR Extraction

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want PostCal to read both the caption text and the image from my shared Instagram post,
so that the app has the best possible source material for extracting event details.

## Acceptance Criteria

1. **Given** shared content contains text/metadata from Instagram
   **When** `parseShareIntent(sharedContent)` is called
   **Then** it returns the raw text and image URI (if available) extracted from the shared content
   **And** the function returns `null` for any field it cannot extract (never throws)

2. **Given** shared content includes an image URI
   **When** `extractTextFromImage(imageUri)` is called
   **Then** it performs on-device OCR via expo-text-extractor (ML Kit on Android, Apple Vision on iOS)
   **And** it returns the extracted text as a string
   **And** it returns `null` if OCR produces no usable text (never throws)

3. **Given** both metadata text and OCR text are available
   **When** `mergeExtractionSources(metadataText, ocrText)` is called
   **Then** it returns a combined raw text string with both sources merged
   **And** if only one source has text, it returns that source alone
   **And** it returns `null` if both sources are null

4. **Given** the extraction functions are implemented
   **When** unit tests run
   **Then** `extractTextFromImage` has tests with mocked expo-text-extractor (success, empty result, error)
   **And** `mergeExtractionSources` has tests covering all combination scenarios
   **And** all tests pass via `npx jest`

## Tasks / Subtasks

- [x] Task 1: Create `extractTextFromImage` function (AC: #2)
  - [x] Create `lib/extraction/extract-text-from-image.ts`
  - [x] Import `extractTextFromImage as extractText` from `expo-text-extractor` and `isSupported`
  - [x] Check `isSupported` before calling OCR — return `null` if not supported
  - [x] Call `extractText(imageUri)` which returns `Promise<string[]>` (array of text blocks)
  - [x] Join the returned string array with newlines to produce a single string
  - [x] Trim the result — return `null` if empty after trim
  - [x] Wrap entire function in try/catch — return `null` on any error (never throw)
  - [x] Export as `async function extractTextFromImage(imageUri: string): Promise<string | null>`

- [x] Task 2: Create `mergeExtractionSources` function (AC: #3)
  - [x] Create `lib/extraction/merge-extraction-sources.ts`
  - [x] Accept `metadataText: string | null` and `ocrText: string | null`
  - [x] If both present, combine with `\n---\n` separator (metadata first, OCR second)
  - [x] If only one present, return that one
  - [x] If both null, return `null`
  - [x] Export as `function mergeExtractionSources(metadataText: string | null, ocrText: string | null): string | null`

- [x] Task 3: Write unit tests for `extractTextFromImage` (AC: #4)
  - [x] Create `lib/extraction/__tests__/extract-text-from-image.test.ts`
  - [x] Mock `expo-text-extractor` module (jest.mock)
  - [x] Test: successful OCR returns joined text from string array
  - [x] Test: OCR returns empty array → returns null
  - [x] Test: OCR returns array of empty/whitespace strings → returns null
  - [x] Test: OCR throws error → returns null (no throw propagation)
  - [x] Test: `isSupported` is false → returns null without calling OCR
  - [x] Update jest.config.ts: add `expo-text-extractor` to moduleNameMapper pointing to a manual mock, OR use jest.mock inline

- [x] Task 4: Write unit tests for `mergeExtractionSources` (AC: #4)
  - [x] Create `lib/extraction/__tests__/merge-extraction-sources.test.ts`
  - [x] Test: both sources present → combined with separator
  - [x] Test: metadata only → returns metadata
  - [x] Test: OCR only → returns OCR text
  - [x] Test: both null → returns null
  - [x] Test: one empty string, one valid → returns valid text only
  - [x] Test: both empty strings → returns null

- [x] Task 5: Ensure native module mocking for tests (AC: #4)
  - [x] Used inline `jest.mock('expo-text-extractor')` in test files (simpler than moduleNameMapper for this case; no jest.config.ts change needed)
  - [x] Verify all existing tests still pass (parse-share-intent tests)
  - [x] Verify new tests pass

- [x] Task 6: Run validations (AC: #1, #2, #3, #4)
  - [x] Run `npx jest` — all tests pass (existing + new)
  - [x] Run `npx expo lint` — no errors
  - [x] Run `npx tsc --noEmit` — no type errors

## Dev Notes

### Architecture Compliance

**Module Boundary Rules (CRITICAL):**
- `lib/extraction/` contains NO React dependencies — pure TypeScript functions only
- `extractTextFromImage` is the ONLY file in lib/ that imports from `expo-text-extractor`
- `mergeExtractionSources` is a pure function with zero external imports (only imports from `./types` if needed)
- These functions are NOT wired into the review screen yet — that happens in Story 2.3 when `runPipeline` is built

**Naming Conventions:**
- File names: `kebab-case.ts`
- Functions: `camelCase`
- Test files: `*.test.ts` in `__tests__/` directories

### expo-text-extractor v1.0.0 API Reference

**CRITICAL: This is the exact API — do NOT guess or use a different API shape.**

```typescript
// From expo-text-extractor
export const isSupported: boolean;
export async function extractTextFromImage(uri: string): Promise<string[]>;
```

**Key behaviors:**
- Returns `Promise<string[]>` — an **array of recognized text blocks**, NOT a single string
- The wrapper automatically strips `file://` prefix from URIs internally
- Uses ML Kit on Android, Apple Vision on iOS
- `isSupported` is a boolean property (not a function) indicating device capability
- **Not supported on web** — `isSupported` will be `false` on web platform

**Function signature for our wrapper:**
```typescript
// lib/extraction/extract-text-from-image.ts
import { extractTextFromImage as extractText, isSupported } from 'expo-text-extractor';

export async function extractTextFromImage(imageUri: string): Promise<string | null> {
  // 1. Check isSupported — return null if false
  // 2. Call extractText(imageUri) — returns string[]
  // 3. Join array with '\n', trim result
  // 4. Return null if empty after trim
  // 5. Wrap in try/catch — return null on error
}
```

### mergeExtractionSources Specification

```typescript
// lib/extraction/merge-extraction-sources.ts
export function mergeExtractionSources(
  metadataText: string | null,
  ocrText: string | null
): string | null {
  // Metadata text = caption/URL text from parseShareIntent (SharedContent.text)
  // OCR text = text extracted from image via extractTextFromImage
  // Separator: '\n---\n' when both present
  // Return null if both are null/empty
}
```

**Why the separator matters:** Downstream parsers (Story 2.3) need to distinguish metadata from OCR text. The `---` separator makes this visually clear in rawText display and helps heuristics weight metadata text higher than OCR text for event name extraction.

### Existing Code to Build On

**Already implemented (Story 2.1):**
- `lib/extraction/parse-share-intent.ts` — converts share intent to `SharedContent` (already done, AC#1 is already satisfied)
- `lib/extraction/types.ts` — `SharedContent`, `ExtractionResult`, `ExtractionConfidence`, `CalendarEvent` interfaces
- `lib/extraction/__tests__/parse-share-intent.test.ts` — 8 tests passing
- `jest.config.ts` — Jest configured with ts-jest, roots in `lib/`, `@/` alias mapped
- `context/extraction-context.tsx` — ExtractionProvider with setSharedContent, setExtraction, setStatus, reset

**DO NOT modify these existing files** (except jest.config.ts if needed for native module mocking).

### ExtractionConfidence Type Mismatch Note

The `ExtractionConfidence` type in `lib/extraction/types.ts` currently uses `number | null` fields:
```typescript
export interface ExtractionConfidence {
  eventName: number | null;
  date: number | null;
  time: number | null;
  venue: number | null;
}
```

The architecture doc specifies string source labels (`'metadata' | 'ocr' | 'heuristic' | 'chrono' | null`). The current `number | null` type was implemented in Story 1.1. **Do NOT change it in this story** — this is a deferred architectural reconciliation. Story 2.3 will address confidence scoring when building `buildEventFields`.

### Testing Strategy

**Jest mocking for expo-text-extractor:**
The native module won't be available in the Jest test environment. Use `jest.mock`:

```typescript
// In test file:
jest.mock('expo-text-extractor', () => ({
  isSupported: true,
  extractTextFromImage: jest.fn(),
}));
```

Or in jest.config.ts moduleNameMapper:
```typescript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
  '^expo-text-extractor$': '<rootDir>/lib/extraction/__mocks__/expo-text-extractor.ts',
},
```

Either approach works — inline `jest.mock` is simpler for this story.

**Test data patterns:**
- OCR success: `['DJ Night at Warehouse', 'Saturday March 28', '10 PM', '450 Main St']`
- OCR partial: `['WAREHOUSE PARTY', '']` (some blocks empty)
- OCR failure: throws `Error('OCR engine not available')`
- OCR empty: `[]`

### What This Story Does NOT Include

- **No pipeline orchestrator** — `runPipeline` is Story 2.3
- **No wiring to review.tsx** — the review screen still shows "Processing..." (wired in 2.3)
- **No date/time parsing** — `parseDateTime` is Story 2.3
- **No event name parsing** — `parseEventName` is Story 2.3
- **No venue parsing** — `parseVenue` is Story 2.3
- **No buildEventFields** — Story 2.3
- **No changes to app/ screens** — this is purely `lib/extraction/` work

### Anti-Patterns to Avoid

- Never throw errors from extraction functions — return `null`
- Never use empty strings for missing fields — use `null`
- Never put business logic in screen files — keep in `lib/`
- Never use `any` types
- Never import React in `lib/` files
- Do NOT call `extractTextFromImage` from expo-text-extractor directly in screen code — always go through our wrapper in `lib/extraction/`

### Project Structure After This Story

```
lib/extraction/
  parse-share-intent.ts       # (existing) Stage 1
  extract-text-from-image.ts  # (NEW) Stage 2 - OCR wrapper
  merge-extraction-sources.ts # (NEW) Stage 3 - Text merging
  types.ts                    # (existing) Type definitions
  __tests__/
    parse-share-intent.test.ts       # (existing) 8 tests
    extract-text-from-image.test.ts  # (NEW) ~5 tests
    merge-extraction-sources.test.ts # (NEW) ~6 tests
```

### Code Review Findings from Stories 1-1, 1-2, 2-1

The following issues were identified and fixed during code review. Maintain these patterns:
- All `SafeAreaView` must have `backgroundColor: colorTokens.surface` explicitly set
- Use registered typography presets (`display`, `headline`, `title`, `body`) — never RNUILib built-in presets like `text60`
- Use `trim()` on text inputs before falsy checks to handle whitespace-only strings
- Jest and ts-jest must be on matching major versions (currently both v29)
- `ts-node` is a required dev dependency for Jest to parse `jest.config.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.2 Acceptance Criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — Extraction Pipeline Architecture, Stage 2 & 3]
- [Source: _bmad-output/planning-artifacts/prd.md — FR4, FR5, FR6, NFR1, NFR5]
- [Source: _bmad-output/implementation-artifacts/2-1-share-sheet-registration-and-intent-handling.md — Previous story context, parseShareIntent, Jest setup]
- [Source: node_modules/expo-text-extractor/build/index.d.ts — API: extractTextFromImage returns Promise<string[]>, isSupported: boolean]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- No issues encountered during implementation. All tests passed on first run.

### Completion Notes List

- Implemented `extractTextFromImage` wrapper around expo-text-extractor that returns joined text or null, never throws
- Implemented `mergeExtractionSources` pure function that combines metadata and OCR text with `---` separator
- Used inline `jest.mock` for expo-text-extractor (no jest.config.ts changes needed)
- 11 new tests added (5 for extractTextFromImage, 6 for mergeExtractionSources)
- All 19 tests pass (8 existing + 11 new), no regressions
- TypeScript and ESLint validations pass clean
- Note on Task 5: jest.config.ts did not need modification — inline jest.mock in test files handles native module mocking cleanly
- Note on Task 6 lint: `npx expo lint` exits with error on empty `components/` dir (pre-existing, not related to this story); `npx eslint lib/` passes clean

### Change Log

- 2026-04-01: Implemented extractTextFromImage OCR wrapper and mergeExtractionSources combiner with full test coverage

### File List

- lib/extraction/extract-text-from-image.ts (NEW)
- lib/extraction/merge-extraction-sources.ts (NEW)
- lib/extraction/__tests__/extract-text-from-image.test.ts (NEW)
- lib/extraction/__tests__/merge-extraction-sources.test.ts (NEW)
