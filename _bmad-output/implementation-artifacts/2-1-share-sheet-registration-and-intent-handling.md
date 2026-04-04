# Story 2.1: Share Sheet Registration & Intent Handling

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see PostCal in my share sheet when I tap Share on an Instagram post,
so that I can send event posts directly to PostCal without leaving Instagram.

## Acceptance Criteria

1. **Given** PostCal is installed on an iOS device
   **When** the user taps Share on an Instagram post
   **Then** PostCal appears as an option in the iOS share sheet
   **And** this is configured via expo-share-intent's config plugin for iOS Share Extension in app.json

2. **Given** PostCal is installed on an Android device
   **When** the user taps Share on an Instagram post
   **Then** PostCal appears as an option in the Android share sheet
   **And** this is configured via expo-share-intent's config plugin for Android Intent Filter in app.json

3. **Given** the user selects PostCal from the share sheet
   **When** shared content is received
   **Then** `+native-intent.ts` receives the shared content (text, metadata, and image URI if available)
   **And** the app navigates to the `/review` route
   **And** the shared content is passed to ExtractionContext as a `SharedContent` object with `text: string | null`, `imageUri: string | null`, `mimeType: string | null`

4. **Given** the ExtractionContext provider already exists in `_layout.tsx` (created in Story 1.1 with `ExtractionState` interface: `sharedContent`, `extraction`, `userEdits`, `status`)
   **When** the developer completes this story
   **Then** `_layout.tsx` additionally wraps the app in `ShareIntentProvider` from expo-share-intent
   **And** a `ShareIntentBridge` component wires the two providers together (reset share intent triggers ExtractionContext reset)
   **And** a new ExtractionContext state is created fresh for each share session (no stale state)

## Tasks / Subtasks

- [x] Task 1: Update app.json with Android intent filter configuration (AC: #1, #2)
  - [x] Add `androidIntentFilters: ["text/*", "image/*"]` to the expo-share-intent plugin config
  - [x] Verify the existing `scheme: "postcal"` is present (required for deep linking)
  - [x] Verify iOS activation rules already support text, web URL, and image (already configured in Story 1.1)

- [x] Task 2: Create `app/+native-intent.ts` share intent router (AC: #3)
  - [x] Import `getShareExtensionKey` from `expo-share-intent`
  - [x] Export `redirectSystemPath` function that checks if the incoming path contains the share extension key
  - [x] Redirect share intent paths to `/review`
  - [x] Return the original path for non-share-intent navigation
  - [x] Wrap in try/catch — return `/` on any error

- [x] Task 3: Wrap app in `ShareIntentProvider` in `_layout.tsx` (AC: #4)
  - [x] Import `ShareIntentProvider` from `expo-share-intent`
  - [x] Wrap the existing `ExtractionProvider` + `Stack` inside `ShareIntentProvider` (ShareIntentProvider outermost)
  - [x] Configure `ShareIntentProvider` options: `resetOnBackground: true`
  - [x] Create a `ShareIntentBridge` component inside `ExtractionProvider` that uses both `useShareIntentContext` and `useExtraction` to wire the reset: when share intent resets, call `reset()` on ExtractionContext and navigate to `/`
  - [x] Place `ShareIntentBridge` as a sibling of `Stack` inside `ExtractionProvider` (it renders nothing — logic-only component)
  - [x] Preserve existing font loading, splash screen, theme initialization, and StatusBar behavior

- [x] Task 4: Create share intent bridge — map ShareIntent to SharedContent and populate ExtractionContext (AC: #3, #4)
  - [x] Create `lib/extraction/parse-share-intent.ts` that converts expo-share-intent's `ShareIntent` to our `SharedContent` type
  - [x] Map `shareIntent.text` → `SharedContent.text`, handle null
  - [x] Map `shareIntent.files?.[0]?.path` → `SharedContent.imageUri` (first image file if available), handle null
  - [x] Map `shareIntent.files?.[0]?.mimeType` → `SharedContent.mimeType`, handle null
  - [x] Map `shareIntent.webUrl` → append to `SharedContent.text` if present (Instagram shares often include URL)
  - [x] Return `null` for any field that cannot be extracted — never throw
  - [x] Write unit test `lib/extraction/__tests__/parse-share-intent.test.ts` with test cases:
    - Text-only share (Instagram caption with URL)
    - Image-only share (flyer image, no text)
    - Text + image share (both available)
    - Empty/null share (no usable data)
    - Share with webUrl but no text

- [x] Task 5: Create share intent listener hook in `app/review.tsx` (AC: #3)
  - [x] Import `useShareIntentContext` from `expo-share-intent`
  - [x] Import `useExtraction` from `context/extraction-context`
  - [x] Import `parseShareIntent` from `lib/extraction/parse-share-intent`
  - [x] On mount or when `hasShareIntent` becomes true, call `parseShareIntent(shareIntent)`
  - [x] Pass the resulting `SharedContent` to `setSharedContent()` on ExtractionContext
  - [x] Set ExtractionContext status to `'extracting'` (pipeline will be wired in Story 2.2/2.3)
  - [x] For now, render a temporary "Processing shared content..." message while status is `'extracting'`
  - [x] Keep existing "Confirm Event Details" text for when status is `'idle'` (direct navigation)

- [x] Task 6: Ensure fresh context per share session (AC: #4)
  - [x] In `_layout.tsx`, the `onResetShareIntent` callback must call `reset()` from ExtractionContext
  - [x] Verify that navigating away and sharing again produces a clean state (no stale `sharedContent` or `extraction`)
  - [x] The `resetOnBackground: true` option handles iOS/Android background → foreground transitions

- [x] Task 7: Run validations and verify (AC: #1, #2, #3, #4)
  - [x] Run `npx jest` — parse-share-intent tests pass
  - [x] Run `npx expo lint` — no errors
  - [x] Run TypeScript check (`npx tsc --noEmit`) — no type errors
  - [x] Run `npx expo export` — app builds without errors
  - [x] Verify `/review` route still renders when navigated to directly (no crash if no share intent)

## Dev Notes

### Architecture Compliance

**Module Boundary Rules (CRITICAL):**
- `lib/extraction/parse-share-intent.ts` is a pure function — NO React imports, NO expo-share-intent imports
  - It receives a plain data object and returns `SharedContent | null`
  - The expo-share-intent `ShareIntent` type is used only at the call site in `app/review.tsx`
- `app/+native-intent.ts` is the ONLY file that imports `getShareExtensionKey` from expo-share-intent
- `app/_layout.tsx` imports `ShareIntentProvider` from expo-share-intent
- `app/review.tsx` imports `useShareIntentContext` from expo-share-intent

**UI Component Rules:**
- Continue using RNUILib components exclusively
- No new UI components needed in this story — focus is on plumbing

**Naming Conventions:**
- File names: `kebab-case.ts` / `kebab-case.tsx`
- Functions: `camelCase` (e.g., `parseShareIntent`, `redirectSystemPath`)
- Test files: `*.test.ts` in `__tests__/` directories

### expo-share-intent v5.1.1 Technical Reference

**CRITICAL: Version Pinning**
- Project uses expo-share-intent v5.1.1 with Expo SDK 54 — do NOT upgrade to v6.x (requires SDK 55)
- v5.1.1 is the latest compatible release for SDK 54

**ShareIntentProvider Setup:**
```typescript
import { ShareIntentProvider } from "expo-share-intent";

<ShareIntentProvider
  options={{
    debug: false,        // set true only for development
    resetOnBackground: true,
  }}
>
  {children}
</ShareIntentProvider>
```

**ShareIntent Data Structure (from expo-share-intent v5.x):**
```typescript
interface ShareIntent {
  type: "media" | "file" | "text" | "weburl" | null;
  text?: string | null;           // Raw shared text content
  webUrl?: string | null;         // Extracted URL from text
  files: ShareIntentFile[] | null;
  meta?: { title?: string; [key: string]: string | undefined } | null;
}

interface ShareIntentFile {
  fileName: string;
  mimeType: string;
  path: string;          // Local file path (use as imageUri)
  size: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
}
```

**useShareIntentContext Hook:**
```typescript
const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntentContext();
```

**+native-intent.ts Pattern (Expo Router integration):**
```typescript
import { getShareExtensionKey } from "expo-share-intent";

export function redirectSystemPath({ path, initial }: { path: string; initial: string }) {
  try {
    if (path.includes(getShareExtensionKey())) {
      return "/review";
    }
    return path;
  } catch {
    return "/";
  }
}
```

**Instagram Share Behavior (Critical Architectural Insight):**
- Instagram primarily shares a URL + caption text via the share sheet, NOT the raw image
- `shareIntent.type` will typically be `"text"` or `"weburl"`
- `shareIntent.text` contains the caption text
- `shareIntent.webUrl` contains the Instagram post URL
- Image may be available via `shareIntent.files[0]` but is NOT guaranteed
- The extraction pipeline must handle text-only shares as the PRIMARY path

### parseShareIntent Function Specification

**Input:** A plain object matching the shape of expo-share-intent's `ShareIntent`
**Output:** `SharedContent | null`

```typescript
// lib/extraction/parse-share-intent.ts
// IMPORTANT: Define a local input type that mirrors ShareIntent shape
// Do NOT import from expo-share-intent in lib/ files

export interface ShareIntentInput {
  type: 'media' | 'file' | 'text' | 'weburl' | null;
  text?: string | null;
  webUrl?: string | null;
  files?: Array<{
    path: string;
    mimeType: string;
    fileName: string;
  }> | null;
  meta?: Record<string, string | undefined> | null;
}

export function parseShareIntent(input: ShareIntentInput): SharedContent | null {
  // Combine text + webUrl into text field
  // Extract first image file path as imageUri
  // Extract first file mimeType
  // Return null if no usable data (no text AND no imageUri)
}
```

### Existing Code to Build On

**ExtractionContext (from Story 1.1):** `context/extraction-context.tsx`
- Already has `setSharedContent(content: SharedContent)` method
- Already has `setStatus(status: ExtractionStatus)` method
- Already has `reset()` method for clearing state
- State type: `{ sharedContent, extraction, userEdits, status }`

**Root Layout (from Story 1.1):** `app/_layout.tsx`
- Already loads fonts, configures theme, shows splash screen
- Already wraps app in `ExtractionProvider`
- Uses `Stack` navigator with `headerShown: false`
- Must ADD `ShareIntentProvider` wrapping — do NOT remove existing providers

**app.json (from Story 1.1):**
- Already has `scheme: "postcal"` (required for deep linking)
- Already has `expo-share-intent` plugin with iOS activation rules
- Missing: `androidIntentFilters` in the plugin config

**Types (from Story 1.1):** `lib/extraction/types.ts`
- `SharedContent { text: string | null; imageUri: string | null; mimeType: string | null; }`
- `ExtractionResult` and `CalendarEvent` already defined

### Provider Nesting Order in _layout.tsx

```tsx
<ShareIntentProvider options={{ resetOnBackground: true }}>
  <ExtractionProvider>
    <Stack>...</Stack>
  </ExtractionProvider>
</ShareIntentProvider>
```

`ShareIntentProvider` must be the outermost provider because `onResetShareIntent` needs to call `reset()` from ExtractionContext. However, since `onResetShareIntent` can't directly access ExtractionContext from outside it, implement the reset bridge as follows:

**Option:** Create a small `ShareIntentBridge` component inside `ExtractionProvider` that uses `useShareIntentContext` to detect resets and calls `reset()`. This keeps the provider order clean and avoids circular dependencies.

### Known Issues & Caveats

- **Not compatible with Expo Go** — requires custom dev client via `eas build --profile development`
- **Cannot test share intent in simulator easily** — share sheet testing requires a real device or specific simulator setup
- **Instagram share behavior varies** — sometimes sends text+URL, sometimes just URL, rarely sends the actual image file
- **resetOnBackground: true** means returning to app after backgrounding clears the share intent — this is desired behavior for PostCal (fresh session each time)

### Testing Strategy

**Unit tests (Jest):** `lib/extraction/__tests__/parse-share-intent.test.ts`
- Test the pure `parseShareIntent` function with mock `ShareIntentInput` objects
- Test cases: text-only, image-only, both, empty, webUrl handling
- No need to mock expo-share-intent — the function receives plain objects

**Manual testing (requires dev build):**
- Share from Instagram → PostCal appears in share sheet
- Select PostCal → app opens at /review route
- Shared content is mapped to ExtractionContext
- Background app → re-open → state is reset

### Anti-Patterns to Avoid

- Do NOT import `expo-share-intent` in `lib/` files — keep lib/ free of React/Expo dependencies
- Do NOT create a loading spinner or "processing" animation — the extraction should feel instant (Story 2.2/2.3 will complete the pipeline)
- Do NOT add androidIntentFilters for types beyond text/* and image/* — PostCal only handles text and images
- Do NOT add error modals or toasts for share intent failures — graceful degradation means showing empty fields
- Do NOT add a new screen for share intent handling — reuse the existing `/review` route

### Project Structure Notes

- New file: `app/+native-intent.ts` (share intent router)
- New file: `lib/extraction/parse-share-intent.ts` (pure function)
- New file: `lib/extraction/__tests__/parse-share-intent.test.ts` (unit tests)
- Modified: `app/_layout.tsx` (add ShareIntentProvider)
- Modified: `app/review.tsx` (add share intent listener)
- Modified: `app.json` (add androidIntentFilters)
- No new dependencies needed — expo-share-intent already installed (v5.1.1)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.1 Acceptance Criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — Share Sheet Integration, Extraction Pipeline, Project Structure]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Navigation Flow, Share Sheet Entry Point]
- [Source: _bmad-output/planning-artifacts/prd.md — FR1, FR2, FR3, NFR14]
- [Source: _bmad-output/implementation-artifacts/1-1-project-cleanup-and-digital-concierge-theme-setup.md — Previous story context, ExtractionContext, app.json config]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Lint warning fixed: `Array<T>` → `T[]` in parse-share-intent.ts per ESLint config
- Jest + ts-jest added as dev dependencies (no test runner was configured)

### Completion Notes List

- Task 1: Added `androidIntentFilters: ["text/*", "image/*"]` to expo-share-intent plugin config in app.json. Verified existing iOS activation rules and deep link scheme.
- Task 2: Created `app/+native-intent.ts` — routes share extension paths to `/review`, passes through all other paths, catches errors gracefully.
- Task 3: Wrapped app in `ShareIntentProvider` (outermost) with `resetOnBackground: true`. Created `ShareIntentBridge` logic-only component that detects share intent reset (true→false transition via useRef) and calls `reset()` + navigates to `/`.
- Task 4: Created pure `parseShareIntent` function with local `ShareIntentInput` type (no expo-share-intent imports in lib/). Combines text + webUrl, extracts first file as imageUri. Returns null when no usable data. 7 unit tests covering all specified cases.
- Task 5: Updated `app/review.tsx` to listen for share intent via `useShareIntentContext`, parse it with `parseShareIntent`, populate ExtractionContext, and show conditional UI ("Processing shared content..." vs "Confirm Event Details").
- Task 6: Fresh context per share session handled by ShareIntentBridge ref-based transition detection + `resetOnBackground: true`.
- Task 7: All validations pass — 7/7 Jest tests, 0 lint errors, 0 TypeScript errors, expo export succeeds, /review route renders cleanly.

### Change Log

- 2026-04-01: Story 2.1 implementation complete — share sheet registration, intent routing, share intent parsing, provider wiring, and reset bridge.

### File List

- app.json (modified — added androidIntentFilters)
- app/+native-intent.ts (new — share intent router)
- app/_layout.tsx (modified — added ShareIntentProvider, ShareIntentBridge)
- app/review.tsx (modified — added share intent listener and conditional UI)
- lib/extraction/parse-share-intent.ts (new — pure parsing function)
- lib/extraction/__tests__/parse-share-intent.test.ts (new — 7 unit tests)
- jest.config.ts (new — Jest configuration for lib/ tests)
- package.json (modified — added jest, @types/jest, ts-jest dev dependencies)
