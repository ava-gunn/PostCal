---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-27'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-PostCal-2026-03-27.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/research/technical-tesseractjs-ocr-research-2026-03-19.md
workflowType: 'architecture'
project_name: 'PostCal'
user_name: 'Ava'
date: '2026-03-27'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
24 FRs organized into 6 capability groups:
- Share Sheet Integration (FR1-FR3): Register as share target on iOS/Android, receive and process shared content
- Content Extraction (FR4-FR9): Parse share sheet metadata, OCR image text, merge results, extract date/time/name/venue
- Event Review & Editing (FR10-FR14): Pre-populated editable form, partial saves, source text reference, cancel flow
- Calendar Export (FR15-FR17): Single-tap save, permission request on first use, write event to device calendar
- Error Handling & Recovery (FR18-FR20): Detect extraction failure, manual entry fallback, retry
- Success & Home (FR21-FR24): Auto-dismissing confirmation, instructional home screen

**Non-Functional Requirements:**
16 NFRs across 4 categories:
- Performance: OCR + parsing < 2s, end-to-end < 10s, app launch < 1s, calendar write < 500ms
- Security/Privacy: All processing on-device, no data collection, no analytics/tracking, permission-on-demand
- Accessibility: WCAG 2.1 AA contrast, 44px touch targets, screen reader labels, dynamic type up to 1.5x, reduced motion support
- Integration: Instagram share flow compatibility on both platforms, native calendar compatibility, iOS 16+ / Android API 24+

**Scale & Complexity:**
- Primary domain: Cross-platform mobile (React Native / Expo)
- Complexity level: Low
- Estimated architectural components: ~8 (share sheet handler, extraction pipeline, OCR module, text parser, event form, calendar writer, theme provider, navigation shell)

### Technical Constraints & Dependencies

- **Expo SDK 52+** with EAS Build (Expo Go not supported due to native OCR module)
- **expo-text-extractor** — native module using ML Kit (Android) and Apple Vision (iOS)
- **chrono-node** — pure JS date/time parser, no native dependency
- **RNUILib** — component library with theme system for Digital Concierge design
- **expo-font** — Manrope + Inter typeface loading
- **expo-calendar** — native calendar write abstraction
- **expo-linear-gradient** — gradient CTA button
- **No backend, no network, no cloud services** — fully on-device architecture

### Cross-Cutting Concerns Identified

- **Share sheet native configuration**: iOS Share Extension and Android Intent Filter require platform-specific app.json/app.config.js entries and potentially native code
- **Font loading**: Manrope and Inter must load before first render; fallback to system fonts (SF Pro / Roboto) if loading fails
- **Accessibility**: Screen reader labels, dynamic type, reduced motion, and contrast requirements affect every screen
- **Platform permission differences**: Calendar write permission flow differs between iOS (EventKit) and Android (Calendar Content Provider)
- **Error boundary**: Extraction pipeline must gracefully handle OCR failures, parse failures, and empty results without crashing

## Starter Template Evaluation

### Primary Technology Domain

Cross-platform mobile (React Native / Expo) — identified from PRD platform requirements.

### Starter Options Considered

The project was initialized using `create-expo-app` with the default template (tabs + Expo Router), which is the standard and recommended approach for Expo projects. No alternative starters were evaluated because:
- Expo's default template is the canonical starting point for Expo SDK projects
- The project already exists with this template applied
- No custom starter provides advantages for PostCal's simple architecture

### Existing Project State: PostCal (Already Scaffolded)

**Initialization Command (already executed):**

```bash
npx create-expo-app PostCal
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript ~5.9.2 with strict mode and path aliases (`@/*`)
- React 19.1.0 with React Compiler enabled
- React Native 0.81.5 with New Architecture enabled

**Routing & Navigation:**
- Expo Router v6 with file-based routing under `app/`
- React Navigation v7
- Typed routes enabled via `experiments.typedRoutes: true`

**Build Tooling:**
- Expo SDK 54 managed workflow
- EAS Build required for native modules (expo-text-extractor)
- ESLint v9 with expo config

**UI Framework:**
- RNUILib v8.4.0 (already installed)
- expo-font for custom typeface loading (already installed)

**Development Experience:**
- Hot reloading via `expo start`
- Platform-specific builds via `expo start --ios` / `--android`
- Web fallback available (not needed for PostCal)

### Dependencies to Add

| Package | Purpose | Native Module? |
|---------|---------|---------------|
| `expo-text-extractor` | On-device OCR (ML Kit / Apple Vision) | Yes — EAS Build required |
| `expo-calendar` | Native calendar read/write | Yes |
| `expo-linear-gradient` | Gradient CTA button | Yes |
| `chrono-node` | Natural language date/time parsing | No — pure JS |

### Dependencies to Remove

| Package | Reason |
|---------|--------|
| `tesseract.js` | Incompatible with React Native runtime (requires browser/Node.js APIs) |
| `install` | Accidental installation artifact |
| `npm` | Accidental installation artifact |

### Project Structure Adaptation

The default template includes tab navigation and example screens that will be replaced. PostCal needs:
- Remove default tab layout and example screens
- Restructure `app/` for PostCal's 3-screen flow (Home, Review, Success)
- Add share sheet entry point configuration in app.json/app.config.js
- Add extraction pipeline modules under `lib/` or `utils/`

**Note:** Project cleanup and restructuring should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. Share sheet integration library
2. State management approach
3. Extraction pipeline architecture
4. Project file structure

**Important Decisions (Shape Architecture):**
5. Testing strategy
6. Error handling patterns

**Deferred Decisions (Post-MVP):**
- Event history/persistence (Phase 2)
- NLP.js integration (Phase 2)
- On-device LLM extraction (Phase 3)

### Data Architecture

**Decision: No persistent data layer**
- Rationale: PostCal has no database, no user accounts, no event history in MVP. All data exists transiently during a single extraction session — shared content in, calendar event out.
- Session data flows through React Context from extraction → review → calendar write, then is discarded.
- Calendar persistence is handled by the native calendar app, not PostCal.

### Authentication & Security

**Decision: N/A — No authentication required**
- No user accounts, no backend, no API keys, no network calls.
- Security posture: all processing on-device, no data leaves the device, no third-party SDKs.
- Calendar permission is the only system permission (requested on first save via expo-calendar).

### API & Communication Patterns

**Decision: N/A — No network communication**
- Fully on-device architecture. No REST, no GraphQL, no WebSockets.
- The only external boundary is the OS share sheet (receiving) and the OS calendar (writing).

### Frontend Architecture

**State Management:**
- **Decision: React Context** for extraction session state
- Rationale: A single `ExtractionContext` wraps the share-sheet-triggered flow. It holds the shared content, extraction results, and user edits. Lighter than Zustand, cleaner than prop-drilling, and perfectly scoped to PostCal's linear 3-screen flow.
- No global state needed — each share session starts fresh.

**Component Architecture:**
- **Decision: RNUILib primitives with Digital Concierge theme**
- All screens built with themed `TextField`, `Button`, `Card`, `View`, `Text` — no custom component library.
- Theme configured via `ThemeManager` at app initialization.
- Single custom element: Extracted Text Preview (styled `View` + `Text`).

**Routing:**
- **Decision: Expo Router v6 (file-based routing)**
- Already configured by starter template.
- Routes: Home (`/`), Review (`/review`), Success (`/success`)
- Share sheet intent handled via `+native-intent.ts` file (expo-share-intent integration)

### Share Sheet Integration

**Decision: `expo-share-intent` v5.x**
- Rationale: Only actively maintained, Expo-compatible library for receiving shared content. Provides config plugin for automatic iOS Share Extension and Android Intent Filter setup. Integrates with Expo Router via `+native-intent.ts`.
- Replaces the abandoned `react-native-receive-sharing-intent`.
- Requires custom dev client (not Expo Go) — aligns with existing EAS Build requirement.

**Instagram Share Behavior (Critical Architectural Insight):**
- Instagram primarily shares a **URL + caption text** via the share sheet, not the raw image.
- The extraction pipeline must handle text-only shares (parse caption for event details) as the primary path.
- OCR is a secondary extraction step when an image URI is available.
- This reinforces the PRD's dual-extraction design: metadata first, OCR second, merge results.

### Extraction Pipeline Architecture

**Decision: Discrete pipeline stages in `lib/extraction/`**
- Each stage is a pure function with clear input/output contract:
  1. `parseShareIntent(sharedContent)` → raw text + image URI (if available)
  2. `extractTextFromImage(imageUri)` → OCR text (via expo-text-extractor)
  3. `mergeExtractionSources(metadata, ocrText)` → combined raw text
  4. `parseDateTime(rawText)` → date + time (via chrono-node)
  5. `parseEventName(rawText)` → event name (heuristics)
  6. `parseVenue(rawText)` → venue/location (heuristics)
  7. `buildEventFields(parsedResults)` → { name, date, time, venue }
- Each function is independently testable with mock inputs.
- Pipeline orchestrator chains stages and handles partial failures gracefully.

### Infrastructure & Deployment

**Decision: EAS Build + EAS Submit**
- Build: EAS Build (required for native modules — expo-text-extractor, expo-share-intent)
- Distribution: EAS Submit for iOS App Store and Google Play Store
- No backend hosting, no CI/CD pipeline beyond EAS
- No environment variables needed (no API keys, no secrets)
- Development builds via `eas build --profile development`

### Testing Strategy

**Decision: Jest unit tests for extraction pipeline**
- Rationale: For a solo dev, unit testing the extraction pipeline provides the highest ROI. The 7 pipeline functions contain the parsing logic where bugs will hide. UI screens are simple enough to verify manually.
- Test framework: Jest (included with Expo)
- Test targets: All functions in `lib/extraction/` with diverse input samples
- Test data: Curated set of sample Instagram captions and OCR text with known expected outputs
- No E2E testing in MVP — add Detox in Phase 2 if needed.

### Error Handling Patterns

**Decision: Graceful degradation at each pipeline stage**
- Each extraction stage returns a result or `null` — never throws.
- The pipeline orchestrator collects whatever was successfully extracted and passes it forward.
- If all stages return `null` (total extraction failure), the error screen is shown with manual entry fallback.
- No try/catch-driven error modals — the UI simply shows empty fields for failed extractions.
- Calendar write errors (permission denied) are the only blocking error — handled by expo-calendar's permission flow.

### Decision Impact Analysis

**Implementation Sequence:**
1. Project cleanup (remove default template screens, add dependencies)
2. Theme setup (RNUILib Digital Concierge configuration)
3. Share sheet integration (expo-share-intent + native-intent.ts)
4. Extraction pipeline (lib/extraction/ modules)
5. Review screen (ExtractionContext + form)
6. Calendar write (expo-calendar integration)
7. Success + Error screens
8. Home screen

**Cross-Component Dependencies:**
- expo-share-intent → ExtractionContext (shares data) → Review screen
- expo-text-extractor → extraction pipeline → ExtractionContext
- expo-calendar → Review screen save action → Success screen
- RNUILib theme → all screens

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 6 areas where AI agents could make different choices

### Naming Patterns

**File Naming:**
- Screen files: `kebab-case.tsx` (e.g., `review-event.tsx`, `home.tsx`)
- Component files: `kebab-case.tsx` (e.g., `extracted-text-preview.tsx`)
- Library/utility files: `kebab-case.ts` (e.g., `parse-date-time.ts`, `build-event-fields.ts`)
- Test files: `*.test.ts` co-located next to source (e.g., `parse-date-time.test.ts`)
- Type definition files: `types.ts` within each module folder
- Context files: `kebab-case.tsx` (e.g., `extraction-context.tsx`)

**Function Naming:**
- Extraction pipeline functions: `camelCase` verbs (e.g., `parseDateTime`, `extractTextFromImage`, `buildEventFields`)
- React hooks: `use` prefix (e.g., `useExtraction`, `useCalendarPermission`)
- Event handlers: `handle` prefix (e.g., `handleSave`, `handleCancel`, `handleFieldChange`)
- Boolean helpers: `is`/`has`/`can` prefix (e.g., `isExtractionComplete`, `hasImageUri`)

**Component Naming:**
- React components: `PascalCase` (e.g., `ReviewScreen`, `ExtractedTextPreview`, `EventForm`)
- Screen components: `*Screen` suffix (e.g., `HomeScreen`, `ReviewScreen`, `SuccessScreen`)

**Variable/Constant Naming:**
- Variables: `camelCase` (e.g., `eventName`, `extractedText`, `imageUri`)
- Constants: `SCREAMING_SNAKE_CASE` for true constants (e.g., `AUTO_DISMISS_DELAY_MS`, `MAX_OCR_TIMEOUT_MS`)
- Theme tokens: `camelCase` matching RNUILib convention (e.g., `primary`, `surfaceContainerLow`, `onSurface`)

### Structure Patterns

**Project Organization: Feature-grouped with shared lib**

```
app/                          # Expo Router screens (file-based routing)
  _layout.tsx                 # Root layout with providers
  +native-intent.ts           # Share intent handler (expo-share-intent)
  index.tsx                   # Home screen
  review.tsx                  # Review/Edit event screen
  success.tsx                 # Success confirmation screen
lib/                          # Shared business logic (no React dependencies)
  extraction/                 # Extraction pipeline modules
    parse-share-intent.ts
    extract-text-from-image.ts
    merge-extraction-sources.ts
    parse-date-time.ts
    parse-event-name.ts
    parse-venue.ts
    build-event-fields.ts
    run-pipeline.ts           # Pipeline orchestrator
    types.ts                  # Extraction types
    __tests__/                # Unit tests for extraction
      parse-date-time.test.ts
      parse-event-name.test.ts
      parse-venue.test.ts
      run-pipeline.test.ts
  calendar/                   # Calendar write module
    write-event.ts
    request-permission.ts
    types.ts
context/                      # React Context providers
  extraction-context.tsx
theme/                        # RNUILib theme configuration
  digital-concierge.ts        # Theme tokens and setup
  typography.ts               # Font configuration
components/                   # Shared UI components
  extracted-text-preview.tsx
constants/                    # App-wide constants
  extraction.ts               # Pipeline constants
assets/                       # Static assets
  fonts/                      # Manrope, Inter font files
  images/                     # App icons, splash
```

**Test Location:** Co-located `__tests__/` folders within each module. Tests sit next to the code they test.

### Data Format Patterns

**Extraction Result Types (canonical shapes):**

```typescript
// Shared content received from share sheet
interface SharedContent {
  text: string | null;       // Caption/URL text from Instagram
  imageUri: string | null;   // Image URI if available
  mimeType: string | null;   // Content MIME type
}

// Individual extraction results (nullable = extraction failed for this field)
interface ExtractionResult {
  eventName: string | null;
  date: string | null;        // ISO 8601 date string (YYYY-MM-DD)
  time: string | null;        // 24h time string (HH:MM)
  venue: string | null;
  rawText: string | null;     // Combined raw text for reference display
  confidence: {               // Which fields came from which source
    eventName: 'metadata' | 'ocr' | 'heuristic' | null;
    date: 'metadata' | 'chrono' | null;
    time: 'metadata' | 'chrono' | null;
    venue: 'metadata' | 'heuristic' | null;
  };
}

// Calendar event ready for writing
interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;              // Default: startDate + 2 hours
  location: string;
}
```

**Null handling:** All extraction fields are nullable. `null` means "not extracted" — never use empty strings to represent missing data. The UI renders empty fields for `null` values.

**Date/Time format:** ISO 8601 strings internally (`YYYY-MM-DD`, `HH:MM`). Conversion to `Date` objects happens only at the calendar write boundary.

### Communication Patterns

**State Management (ExtractionContext):**

```typescript
interface ExtractionState {
  sharedContent: SharedContent | null;  // Raw shared input
  extraction: ExtractionResult | null;  // Pipeline output
  userEdits: Partial<ExtractionResult>; // User modifications
  status: 'idle' | 'extracting' | 'ready' | 'saving' | 'saved' | 'error';
}
```

- Context is created fresh on each share intent — no stale state between sessions.
- `userEdits` overlays on `extraction` — final values = merge of extraction + edits.
- Status drives screen navigation: `extracting` → `ready` (review) → `saving` → `saved` (success).
- Only the Review screen writes to `userEdits`. Only the pipeline writes to `extraction`.

### Process Patterns

**Error Handling:**
- Extraction functions return `null` on failure — never throw.
- Pipeline orchestrator (`runPipeline`) catches any unexpected errors and returns partial results.
- Only two user-facing error states: (1) total extraction failure → error screen, (2) calendar permission denied → system permission dialog.
- No toast notifications, no inline validation errors, no retry modals.
- Console warnings for debugging only — never `console.error` for expected failures (e.g., OCR returns no text).

**Loading States:**
- No visible loading states in MVP. Extraction must complete before the review screen renders.
- If extraction takes longer than expected, the share sheet transition animation covers the delay.
- `status: 'extracting'` exists in context for internal flow control but has no UI representation.

### Enforcement Guidelines

**All AI Agents MUST:**
- Use the type definitions from `lib/extraction/types.ts` — never create ad-hoc field types
- Return `null` (not empty string, not undefined) for missing extraction fields
- Follow the file naming conventions exactly (kebab-case for files, PascalCase for components)
- Use RNUILib themed components — never raw React Native `TextInput`, `TouchableOpacity`, etc.
- Place extraction logic in `lib/extraction/` — never in screen files or components
- Use Digital Concierge theme tokens from `theme/digital-concierge.ts` — never hardcode colors or font sizes

**Anti-Patterns to Avoid:**
- ❌ Throwing errors from extraction functions (use null returns)
- ❌ Using empty strings for missing fields (use null)
- ❌ Putting business logic in screen components (belongs in lib/)
- ❌ Creating wrapper components around RNUILib primitives (use theme presets)
- ❌ Using `any` type (all extraction data must match defined interfaces)
- ❌ Importing directly from `react-native` for UI components (use RNUILib)

## Project Structure & Boundaries

### Complete Project Directory Structure

```
PostCal/
├── app.json                          # Expo config (share intent plugin, splash, icons)
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript config (strict, path aliases)
├── eas.json                          # EAS Build profiles (dev, preview, production)
├── .gitignore
├── app/                              # Expo Router screens (file-based routing)
│   ├── _layout.tsx                   # Root layout: providers (ExtractionContext, ThemeManager, fonts)
│   ├── +native-intent.ts            # Share intent handler → routes to /review
│   ├── index.tsx                     # Home screen (How it Works instructions)
│   ├── review.tsx                    # Review/Edit event screen (main interaction)
│   └── success.tsx                   # Success confirmation (auto-dismiss)
├── lib/                              # Business logic (no React dependencies)
│   ├── extraction/                   # Extraction pipeline
│   │   ├── parse-share-intent.ts     # Stage 1: Parse shared content from intent
│   │   ├── extract-text-from-image.ts # Stage 2: OCR via expo-text-extractor
│   │   ├── merge-extraction-sources.ts # Stage 3: Combine metadata + OCR text
│   │   ├── parse-date-time.ts        # Stage 4: chrono-node date/time extraction
│   │   ├── parse-event-name.ts       # Stage 5: Heuristic event name extraction
│   │   ├── parse-venue.ts            # Stage 6: Heuristic venue extraction
│   │   ├── build-event-fields.ts     # Stage 7: Assemble final event fields
│   │   ├── run-pipeline.ts           # Pipeline orchestrator (chains all stages)
│   │   ├── types.ts                  # SharedContent, ExtractionResult, CalendarEvent
│   │   └── __tests__/                # Unit tests
│   │       ├── parse-date-time.test.ts
│   │       ├── parse-event-name.test.ts
│   │       ├── parse-venue.test.ts
│   │       ├── merge-extraction-sources.test.ts
│   │       ├── build-event-fields.test.ts
│   │       └── run-pipeline.test.ts
│   └── calendar/                     # Calendar integration
│       ├── write-event.ts            # Write CalendarEvent to device calendar
│       ├── request-permission.ts     # Calendar permission request flow
│       └── types.ts                  # Calendar-specific types
├── context/                          # React Context providers
│   └── extraction-context.tsx        # ExtractionState + actions
├── theme/                            # RNUILib theme configuration
│   ├── digital-concierge.ts          # Color tokens, component presets
│   └── typography.ts                 # Manrope + Inter font loading config
├── components/                       # Shared UI components
│   └── extracted-text-preview.tsx    # Raw text reference display
├── constants/                        # App-wide constants
│   └── extraction.ts                 # AUTO_DISMISS_DELAY_MS, default end time offset
├── assets/                           # Static assets
│   ├── fonts/                        # Manrope-Bold, Manrope-ExtraBold, Inter-Regular, Inter-Medium, Inter-SemiBold
│   └── images/                       # icon.png, splash-icon.png, adaptive icons
└── scripts/                          # Utility scripts
    └── reset-project.js              # Expo default reset script
```

### Architectural Boundaries

**OS Boundary (Share Sheet → App):**
- `expo-share-intent` handles native share sheet registration and data passing
- `+native-intent.ts` receives shared content and routes to `/review`
- Data crosses from native layer to JS as `SharedContent` type
- This is the only inbound external boundary

**OS Boundary (App → Calendar):**
- `lib/calendar/write-event.ts` converts `CalendarEvent` to expo-calendar format
- `lib/calendar/request-permission.ts` handles permission flow
- Data crosses from JS to native calendar as structured event
- This is the only outbound external boundary

**Logic/UI Boundary:**
- All business logic lives in `lib/` — pure functions with no React dependencies
- All React components live in `app/`, `components/`, `context/`
- Screens import from `lib/` but `lib/` never imports from React code
- This separation enables unit testing without React test infrastructure

**State Boundary:**
- `ExtractionContext` is the single source of truth for session state
- Only `run-pipeline.ts` (via context action) writes extraction results
- Only screen components write user edits
- `lib/calendar/` reads from context to build the calendar event

### Requirements to Structure Mapping

**FR Category → Directory Mapping:**

| FR Group | Files | Directory |
|----------|-------|-----------|
| FR1-FR3 (Share Sheet) | `+native-intent.ts`, app.json plugins | `app/` |
| FR4 (Parse metadata) | `parse-share-intent.ts` | `lib/extraction/` |
| FR5 (OCR) | `extract-text-from-image.ts` | `lib/extraction/` |
| FR6 (Merge) | `merge-extraction-sources.ts` | `lib/extraction/` |
| FR7 (Date/time) | `parse-date-time.ts` | `lib/extraction/` |
| FR8 (Event name) | `parse-event-name.ts` | `lib/extraction/` |
| FR9 (Venue) | `parse-venue.ts` | `lib/extraction/` |
| FR10-FR14 (Review/Edit) | `review.tsx`, `extraction-context.tsx` | `app/`, `context/` |
| FR15-FR17 (Calendar) | `write-event.ts`, `request-permission.ts` | `lib/calendar/` |
| FR18-FR20 (Error handling) | `run-pipeline.ts`, `review.tsx` | `lib/extraction/`, `app/` |
| FR21-FR22 (Success) | `success.tsx` | `app/` |
| FR23-FR24 (Home) | `index.tsx` | `app/` |

**Cross-Cutting Concerns → Location:**

| Concern | Files | Location |
|---------|-------|----------|
| Theme/Design System | `digital-concierge.ts`, `typography.ts` | `theme/` |
| Accessibility | Props on all screen components | `app/`, `components/` |
| Font loading | `typography.ts`, `_layout.tsx` | `theme/`, `app/` |
| Type safety | `types.ts` files | `lib/extraction/`, `lib/calendar/` |

### Data Flow

```
Instagram Share Sheet
        │
        ▼
+native-intent.ts (receive SharedContent)
        │
        ▼
ExtractionContext (set sharedContent, trigger pipeline)
        │
        ▼
run-pipeline.ts (orchestrate extraction stages)
  ├─ parse-share-intent.ts → raw text
  ├─ extract-text-from-image.ts → OCR text (if image available)
  ├─ merge-extraction-sources.ts → combined text
  ├─ parse-date-time.ts → date + time
  ├─ parse-event-name.ts → event name
  ├─ parse-venue.ts → venue
  └─ build-event-fields.ts → ExtractionResult
        │
        ▼
ExtractionContext (set extraction, status → 'ready')
        │
        ▼
review.tsx (display fields, accept user edits)
        │
        ▼
write-event.ts (merge extraction + edits → CalendarEvent → device calendar)
        │
        ▼
success.tsx (confirmation → auto-dismiss)
```

### Development Workflow

**Development builds:** `eas build --profile development --platform [ios|android]`
**Local dev server:** `expo start --dev-client`
**Run tests:** `npx jest` (extraction pipeline unit tests)
**Lint:** `expo lint`
**Production build:** `eas build --profile production --platform all`
**Store submission:** `eas submit --platform [ios|android]`

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** All technology choices are compatible.
- Expo SDK 54 + React Native 0.81.5 + React 19 — verified compatible stack
- expo-share-intent v5.x — designed for Expo SDK 54, config plugin approach
- expo-text-extractor — Expo SDK 52+ compatible, uses native OCR engines
- chrono-node — pure JS, no native dependency, works in any JS runtime
- RNUILib v8.4.0 — already installed and Expo-compatible
- expo-calendar, expo-linear-gradient — standard Expo SDK modules
- All require EAS Build (not Expo Go) — consistent constraint, no conflict

**Pattern Consistency:** Patterns align with technology choices.
- kebab-case file naming matches Expo Router conventions
- React Context pattern is standard React, no library conflict
- TypeScript interfaces match chrono-node output shapes and expo-calendar input shapes
- RNUILib theming approach aligns with Digital Concierge design tokens

**Structure Alignment:** Project structure supports all decisions.
- `lib/` separation enables pure-function unit testing without React
- `app/` file-based routing maps cleanly to 3 screens + intent handler
- `context/` isolates state management from business logic
- `theme/` centralizes design system configuration

### Requirements Coverage Validation

**Functional Requirements Coverage:**

| FR Group | Architecture Support | Status |
|----------|---------------------|--------|
| FR1-FR3 (Share Sheet) | expo-share-intent + app.json config plugin | Covered |
| FR4-FR9 (Extraction) | 7-stage pipeline in lib/extraction/ | Covered |
| FR10-FR14 (Review/Edit) | ExtractionContext + review.tsx with RNUILib | Covered |
| FR15-FR17 (Calendar) | lib/calendar/ + expo-calendar | Covered |
| FR18-FR20 (Error Handling) | Pipeline null-return pattern + error screen | Covered |
| FR21-FR22 (Success) | success.tsx with auto-dismiss | Covered |
| FR23-FR24 (Home) | index.tsx with instruction cards | Covered |

**Non-Functional Requirements Coverage:**

| NFR Category | Architecture Support | Status |
|-------------|---------------------|--------|
| Performance (NFR1-4) | On-device pipeline, no network, pre-render extraction | Covered |
| Security/Privacy (NFR5-8) | No network, no data collection, permission-on-demand | Covered |
| Accessibility (NFR9-13) | RNUILib a11y props, theme contrast, dynamic type | Covered |
| Integration (NFR14-16) | expo-share-intent (iOS/Android), expo-calendar, platform versions | Covered |

### Implementation Readiness Validation

**Decision Completeness:** All critical decisions documented with specific library names and versions. No ambiguous "TBD" decisions remain.

**Structure Completeness:** Every file in the project tree maps to a specific FR or cross-cutting concern. No placeholder directories.

**Pattern Completeness:** Type interfaces defined for all data boundaries. Naming conventions, error handling, and state management patterns are concrete with examples and anti-patterns.

### Gap Analysis Results

**Critical Gaps:** None

**Important Gaps:**
1. **expo-share-intent SDK 54 compatibility** — v5.x targets SDK 54 per research, but exact version pin needs verification during `npx expo install`. Contingency: upgrade to SDK 55 if needed.
2. **Image availability from Instagram shares** — Instagram primarily shares URLs, not images. The extraction pipeline handles this gracefully (text-first extraction), but real-world testing with Instagram's actual share payload is needed early in development.

**Nice-to-Have Gaps:**
- No eas.json build profiles defined yet — will be generated by `eas build:configure`
- No Jest configuration specified — Expo's default Jest setup covers the extraction pipeline tests

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Low)
- [x] Technical constraints identified (EAS Build, native modules)
- [x] Cross-cutting concerns mapped (fonts, a11y, permissions, error boundaries)

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified (7 key packages)
- [x] Integration patterns defined (share sheet in, calendar out)
- [x] Performance considerations addressed (< 2s extraction, no loading states)

**Implementation Patterns**
- [x] Naming conventions established (files, functions, components, variables)
- [x] Structure patterns defined (lib/ vs app/ separation)
- [x] Data format patterns specified (TypeScript interfaces)
- [x] Process patterns documented (null-return errors, no loading states)

**Project Structure**
- [x] Complete directory structure defined (every file listed)
- [x] Component boundaries established (OS, logic/UI, state)
- [x] Integration points mapped (share sheet → pipeline → calendar)
- [x] Requirements to structure mapping complete (FR → file table)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Radically simple architecture — no backend, no database, no auth eliminates entire categories of complexity
- Clean separation of concerns — lib/ (testable logic) vs app/ (React screens) vs context/ (state)
- Discrete pipeline stages — each extraction function is independently testable and swappable
- Complete FR-to-file traceability — every requirement maps to a specific file

**Areas for Future Enhancement (Post-MVP):**
- Event history persistence (Phase 2 — would add AsyncStorage or SQLite)
- NLP.js integration (Phase 2 — new module in lib/extraction/)
- On-device LLM extraction (Phase 3 — would replace heuristic stages)
- Multi-source support beyond Instagram (Phase 2 — extend parse-share-intent.ts)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries (lib/ never imports from app/)
- Use type definitions from lib/extraction/types.ts for all extraction data
- Return null (not empty string) for missing extraction fields
- Use RNUILib themed components exclusively — no raw React Native imports for UI

**First Implementation Priority:**
1. Remove tesseract.js, install, npm from dependencies
2. Install expo-share-intent, expo-text-extractor, expo-calendar, expo-linear-gradient, chrono-node
3. Clean up default template screens
4. Set up RNUILib Digital Concierge theme
5. Configure expo-share-intent in app.json plugins
