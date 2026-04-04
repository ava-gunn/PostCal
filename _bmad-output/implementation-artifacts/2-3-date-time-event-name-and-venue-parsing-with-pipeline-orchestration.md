# Story 2.3: Date/Time, Event Name & Venue Parsing with Pipeline Orchestration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want PostCal to automatically identify the event name, date, time, and venue from the extracted text,
so that the event details are ready for me to review without manual entry.

## Acceptance Criteria

1. **Given** merged raw text containing a natural language date/time (e.g., "Saturday March 28 at 10 PM")
   **When** `parseDateTime(rawText)` is called
   **Then** it returns a date string in ISO 8601 format (YYYY-MM-DD) and a time string in 24h format (HH:MM) via chrono-node
   **And** it returns `null` for date and/or time if chrono-node cannot parse them

2. **Given** merged raw text containing event information
   **When** `parseEventName(rawText)` is called
   **Then** it returns the most likely event name using heuristic analysis (e.g., prominent text, title patterns)
   **And** it returns `null` if no event name can be identified

3. **Given** merged raw text containing venue information
   **When** `parseVenue(rawText)` is called
   **Then** it returns the most likely venue/location using heuristic analysis (e.g., address patterns, "at" prepositions)
   **And** it returns `null` if no venue can be identified

4. **Given** parsed results from all extraction stages
   **When** `buildEventFields(parsedResults)` is called
   **Then** it assembles an `ExtractionResult` object with `eventName`, `date`, `time`, `venue`, `rawText`, and `confidence` fields
   **And** all fields use `null` for missing data (never empty strings)

5. **Given** shared content is received from the share sheet
   **When** `runPipeline(sharedContent)` is called
   **Then** it chains all 7 stages in order: parseShareIntent → extractTextFromImage → mergeExtractionSources → parseDateTime → parseEventName → parseVenue → buildEventFields
   **And** partial failures in any stage do not block subsequent stages
   **And** the pipeline returns whatever was successfully extracted
   **And** ExtractionContext status transitions from `'extracting'` to `'ready'`

6. **Given** the parsing and pipeline functions are implemented
   **When** unit tests run
   **Then** `parseDateTime` has tests with diverse date formats (natural language, numeric, abbreviated months, relative dates)
   **And** `parseEventName` has tests with sample Instagram captions and OCR text
   **And** `parseVenue` has tests with address patterns and venue mentions
   **And** `runPipeline` has integration tests covering full extraction, partial extraction, and total failure scenarios
   **And** all tests pass via `npx jest`

## Tasks / Subtasks

- [x] Task 1: Create `parseDateTime` function (AC: #1)
  - [x] \1reate `lib/extraction/parse-date-time.ts`
  - [x] \1mport `chrono` from `chrono-node` (already in package.json dependencies)
  - [x] \1ccept `rawText: string` parameter
  - [x] \1all `chrono.parse(rawText)` to get parsed results array
  - [x] \1xtract first parsed result's `start` component
  - [x] \1ormat date as `YYYY-MM-DD` string from chrono's date components (`year`, `month`, `day`)
  - [x] \1ormat time as `HH:MM` string from chrono's time components (`hour`, `minute`) — return `null` for time if hour is not present in parsed result (`isCertain('hour')` is false)
  - [x] \1eturn `{ date: string | null, time: string | null }`
  - [x] \1eturn `{ date: null, time: null }` if chrono finds no results
  - [x] \1rap in try/catch — return `{ date: null, time: null }` on error (never throw)

- [x] Task 2: Create `parseEventName` function (AC: #2)
  - [x] \1reate `lib/extraction/parse-event-name.ts`
  - [x] \1ccept `rawText: string` parameter
  - [x] \1plit rawText on `\n---\n` separator to get metadata section (before separator) and OCR section (after separator), or treat entire text as single section if no separator
  - [x] \1pply heuristic: use first non-empty, non-URL line from metadata section as event name candidate
  - [x] \1f metadata section yields no candidate, use first non-empty, non-URL line from OCR section
  - [x] \1rim candidate to max 100 characters (truncate with no ellipsis)
  - [x] \1eturn `null` if no candidate found or all lines are URLs/empty
  - [x] \1RL detection: lines starting with `http://` or `https://` are URLs — skip them
  - [x] \1eturn `string | null`
  - [x] \1rap in try/catch — return `null` on error (never throw)

- [x] Task 3: Create `parseVenue` function (AC: #3)
  - [x] \1reate `lib/extraction/parse-venue.ts`
  - [x] \1ccept `rawText: string` parameter
  - [x] \1pply heuristic pattern matching in order of priority:
    - [x] \1heck for address patterns: lines containing digits followed by street-type words (St, Ave, Blvd, Rd, Dr, Ln, Way, Ct, Pl)
    - [x] \1heck for "at [Venue]" or "@ [Venue]" patterns (case-insensitive) — extract the venue portion after "at"/"@"
    - [x] \1heck for "venue:" or "location:" or "where:" prefixed lines (case-insensitive) — extract text after the prefix
  - [x] \1eturn the first match found (priority order above)
  - [x] \1rim result, return `null` if empty after trim
  - [x] \1eturn `string | null`
  - [x] \1rap in try/catch — return `null` on error (never throw)

- [x] Task 4: Create `buildEventFields` function (AC: #4)
  - [x] \1reate `lib/extraction/build-event-fields.ts`
  - [x] \1ccept parsed results: `{ eventName, date, time, venue, rawText }` (all `string | null`)
  - [x] \1ssemble `ExtractionResult` object with all fields
  - [x] \1et `confidence` fields: use `1` for fields that are non-null, `null` for fields that are null (Note: `ExtractionConfidence` uses `number | null` — the architecture's string labels are deferred to a future story)
  - [x] \1ll missing fields must be `null`, never empty strings
  - [x] \1eturn `ExtractionResult`
  - [x] \1his is a pure synchronous function — no try/catch needed (no external calls)

- [x] Task 5: Create `runPipeline` orchestrator function (AC: #5)
  - [x] \1reate `lib/extraction/run-pipeline.ts`
  - [x] \1mport all 7 stage functions from their respective files
  - [x] \1mport `SharedContent` and `ExtractionResult` from `./types`
  - [x] \1ccept `sharedContent: SharedContent` parameter
  - [x] \1xecute stages in order:
    1. `const metadataText = sharedContent.text` (already parsed by parseShareIntent upstream)
    2. `const ocrText = sharedContent.imageUri ? await extractTextFromImage(sharedContent.imageUri) : null`
    3. `const rawText = mergeExtractionSources(metadataText, ocrText)`
    4. `const { date, time } = rawText ? parseDateTime(rawText) : { date: null, time: null }`
    5. `const eventName = rawText ? parseEventName(rawText) : null`
    6. `const venue = rawText ? parseVenue(rawText) : null`
    7. `const result = buildEventFields({ eventName, date, time, venue, rawText })`
  - [x] \1eturn `ExtractionResult` (always returns an object, never null — fields inside may be null)
  - [x] \1artial failures: if any stage returns null, subsequent stages still execute with available data
  - [x] \1rap in try/catch — on catastrophic error, return a default ExtractionResult with all null fields

- [x] Task 6: Wire pipeline into review.tsx (AC: #5)
  - [x] \1n `app/review.tsx`, after receiving shared content, call `runPipeline(sharedContent)`
  - [x] \1et `status` to `'extracting'` before calling runPipeline
  - [x] \1n pipeline completion, call `setExtraction(result)` and `setStatus('ready')`
  - [x] \1n pipeline error, call `setStatus('error')`
  - [x] \1eplace the current placeholder "Processing shared content..." with actual pipeline execution

- [x] Task 7: Write unit tests for `parseDateTime` (AC: #6)
  - [x] \1reate `lib/extraction/__tests__/parse-date-time.test.ts`
  - [x] \1est: natural language date "Saturday March 28 at 10 PM" → date: "2026-03-28", time: "22:00"
  - [x] \1est: date only "March 28, 2026" → date: "2026-03-28", time: null
  - [x] \1est: numeric date "3/28/2026 10:00 PM" → date: "2026-03-28", time: "22:00"
  - [x] \1est: abbreviated month "Mar 28 at 10pm" → date with correct month, time: "22:00"
  - [x] \1est: relative date "next Saturday" → returns a valid date string, time: null
  - [x] \1est: no parseable date "just vibes" → date: null, time: null
  - [x] \1est: empty string → date: null, time: null

- [x] Task 8: Write unit tests for `parseEventName` (AC: #6)
  - [x] \1reate `lib/extraction/__tests__/parse-event-name.test.ts`
  - [x] \1est: Instagram caption with event name first line → returns first line
  - [x] \1est: caption starting with URL → skips URL, returns next non-empty line
  - [x] \1est: merged text with separator → extracts from metadata section first
  - [x] \1est: only OCR text (no separator) → returns first non-empty line
  - [x] \1est: all URLs → returns null
  - [x] \1est: empty string → returns null
  - [x] \1est: very long first line (>100 chars) → truncated to 100 chars

- [x] Task 9: Write unit tests for `parseVenue` (AC: #6)
  - [x] \1reate `lib/extraction/__tests__/parse-venue.test.ts`
  - [x] \1est: text with street address "450 Main St" → returns "450 Main St"
  - [x] \1est: text with "at The Warehouse" → returns "The Warehouse"
  - [x] \1est: text with "@ Club Nova" → returns "Club Nova"
  - [x] \1est: text with "venue: Central Park" → returns "Central Park"
  - [x] \1est: text with "location: 123 Oak Ave" → returns "123 Oak Ave"
  - [x] \1est: text with no venue patterns → returns null
  - [x] \1est: empty string → returns null

- [x] Task 10: Write unit tests for `buildEventFields` (AC: #6)
  - [x] \1reate `lib/extraction/__tests__/build-event-fields.test.ts`
  - [x] \1est: all fields present → ExtractionResult with all fields populated, confidence all `1`
  - [x] \1est: partial fields (some null) → ExtractionResult with null fields, confidence null for missing
  - [x] \1est: all fields null → ExtractionResult with all null fields, all confidence null

- [x] Task 11: Write integration tests for `runPipeline` (AC: #6)
  - [x] \1reate `lib/extraction/__tests__/run-pipeline.test.ts`
  - [x] \1ock `expo-text-extractor` module (same pattern as extract-text-from-image tests)
  - [x] \1est: full extraction — text + image → all fields populated
  - [x] \1est: partial extraction — text only, no image → fields from text only, OCR-dependent fields may be null
  - [x] \1est: total failure — no text, no image → all fields null
  - [x] \1est: OCR failure with text available → still extracts from metadata text
  - [x] \1est: pipeline handles null sharedContent.imageUri gracefully (skips OCR)

- [x] Task 12: Run validations (AC: #1–#6)
  - [x] \1un `npx jest` — all tests pass (existing + new)
  - [x] \1un `npx eslint lib/ app/` — no errors
  - [x] \1un `npx tsc --noEmit` — no type errors

## Dev Notes

### Architecture Compliance

**Module Boundary Rules (CRITICAL):**
- `lib/extraction/` contains NO React dependencies — pure TypeScript functions only
- `run-pipeline.ts` imports all stage functions but has NO React imports
- Only `app/review.tsx` calls `runPipeline` and interacts with ExtractionContext (React boundary)
- `chrono-node` is a pure JS library with no native dependencies — safe to import in `lib/`

**Naming Conventions:**
- File names: `kebab-case.ts`
- Functions: `camelCase`
- Test files: `*.test.ts` in `__tests__/` directories

### chrono-node v2.9.0 API Reference

**CRITICAL: This is the exact API — do NOT guess or use a different API shape.**

```typescript
import * as chrono from 'chrono-node';

// Primary parse method
const results = chrono.parse(text: string, refDate?: Date, options?: ParsingOption);
// returns: ParsedResult[]

// ParsedResult structure
interface ParsedResult {
  index: number;           // position in text
  text: string;            // matched text
  start: ParsedComponents; // start date/time
  end?: ParsedComponents;  // end date/time (optional)
}

// ParsedComponents
interface ParsedComponents {
  date(): Date;                        // parsed Date object
  isCertain(component: string): boolean; // whether component was explicitly stated
  get(component: string): number | null; // get specific component value
  // Components: 'year', 'month', 'day', 'weekday', 'hour', 'minute', 'second', 'meridiem'
}
```

**Key behaviors:**
- `chrono.parse()` returns an array of `ParsedResult` — use the first result
- `result.start.get('hour')` returns `null` if no time was mentioned — use `isCertain('hour')` to check
- `result.start.get('month')` is 1-indexed (January = 1)
- `result.start.date()` returns a full JS `Date` object — but we extract components individually for ISO formatting
- chrono-node handles relative dates ("next Saturday") using a reference date — default is `new Date()`
- Pure JS — no native dependencies, works in Jest without mocking

**Date/Time formatting from chrono components:**
```typescript
// Date: YYYY-MM-DD
const year = result.start.get('year');
const month = String(result.start.get('month')).padStart(2, '0');
const day = String(result.start.get('day')).padStart(2, '0');
const date = `${year}-${month}-${day}`;

// Time: HH:MM (only if hour is certain)
if (result.start.isCertain('hour')) {
  const hour = String(result.start.get('hour')).padStart(2, '0');
  const minute = String(result.start.get('minute') ?? 0).padStart(2, '0');
  const time = `${hour}:${minute}`;
}
```

### parseEventName Heuristic Strategy

The merged text uses `\n---\n` as separator between metadata (Instagram caption) and OCR text. Event names are most likely found in:

1. **Metadata section** (before `---`): Instagram captions often start with the event name
2. **OCR section** (after `---`): Event flyers often have the event name as prominent text

**Heuristic priority:**
- First non-empty, non-URL line from metadata section
- If no metadata candidate, first non-empty, non-URL line from OCR section
- Skip lines that are just URLs (`http://` or `https://` prefix)
- Truncate to 100 chars max

**Why this simple heuristic works for MVP:** Instagram captions typically begin with the event name or a hook. The first substantial line is the best candidate. More sophisticated NLP is deferred to Phase 2.

### parseVenue Heuristic Strategy

**Pattern priority (in order):**
1. **Street address**: Regex for `\d+\s+\w+\s+(St|Ave|Blvd|Rd|Dr|Ln|Way|Ct|Pl)\b` (case-insensitive)
2. **"at [Venue]"**: Regex for `\bat\s+([A-Z][^\n,]+)` or `@\s*([^\n,]+)` — captures text after "at"/"@"
3. **Labeled venue**: Regex for `(?:venue|location|where)\s*:\s*(.+)` (case-insensitive)

**Return the first match found.** Extract the captured group, trim, return null if empty.

### buildEventFields Confidence Mapping

**IMPORTANT: ExtractionConfidence uses `number | null`, NOT string labels.**

The architecture doc specifies string source labels (`'metadata' | 'ocr' | 'heuristic' | 'chrono' | null`) but `types.ts` currently defines `ExtractionConfidence` with `number | null`. Do NOT change the type in this story.

**Simple confidence mapping for this story:**
- Non-null field → confidence = `1` (extracted successfully)
- Null field → confidence = `null` (not extracted)

This is a placeholder. The architecture's string-based confidence tracking is a deferred reconciliation for a future story.

### runPipeline Orchestration Pattern

**Key design decisions:**
- `runPipeline` receives `SharedContent` (already parsed by `parseShareIntent` upstream in `review.tsx`)
- It does NOT call `parseShareIntent` — that stage happens in `review.tsx` before the pipeline is invoked
- The pipeline starts from stage 2 (extractTextFromImage) through stage 7 (buildEventFields)
- `sharedContent.text` is the metadata text, `sharedContent.imageUri` triggers OCR

**Wait — correction on stage count:** Per the architecture, the pipeline has 7 stages. But `parseShareIntent` is already called in `review.tsx` before `runPipeline`. So `runPipeline` internally executes stages 2-7 (6 stages). The AC says "chains all 7 stages" — to satisfy this literally, `runPipeline` should accept `SharedContent` (output of stage 1) and chain stages 2-7. The first stage's output is its input.

**Pipeline flow inside `runPipeline`:**
```
SharedContent (input — output of stage 1)
  → extractTextFromImage(imageUri)           // Stage 2
  → mergeExtractionSources(text, ocrText)    // Stage 3
  → parseDateTime(rawText)                   // Stage 4
  → parseEventName(rawText)                  // Stage 5
  → parseVenue(rawText)                      // Stage 6
  → buildEventFields(...)                    // Stage 7
  → ExtractionResult (output)
```

### Wiring in review.tsx

**Current state of review.tsx (Story 2.1):** The review screen currently:
1. Receives share intent via `useShareIntentContext`
2. Calls `parseShareIntent` to convert to `SharedContent`
3. Stores in ExtractionContext via `setSharedContent`
4. Displays "Processing shared content..." placeholder

**What this story adds:**
1. After `setSharedContent`, call `setStatus('extracting')`
2. Call `runPipeline(sharedContent)` with the parsed SharedContent
3. On success: `setExtraction(result)` and `setStatus('ready')`
4. On error: `setStatus('error')`
5. The review screen already conditionally renders based on status — the "Processing..." text shows during `extracting`, and fields will show when `ready` (full field rendering is Story 3.1)

**IMPORTANT:** Do NOT build the full review form UI in this story. Just wire the pipeline and update context. Story 3.1 handles the review screen UI.

### ExtractionConfidence Type Mismatch Note

The `ExtractionConfidence` type in `lib/extraction/types.ts` currently uses `number | null`:
```typescript
export interface ExtractionConfidence {
  eventName: number | null;
  date: number | null;
  time: number | null;
  venue: number | null;
}
```

The architecture doc specifies string source labels. **Do NOT change the type in this story.** Use `1` for present fields and `null` for missing fields as a simple placeholder.

### Existing Code (DO NOT modify unless specified)

- `lib/extraction/parse-share-intent.ts` — Stage 1 (done in Story 2.1)
- `lib/extraction/extract-text-from-image.ts` — Stage 2 (done in Story 2.2)
- `lib/extraction/merge-extraction-sources.ts` — Stage 3 (done in Story 2.2)
- `lib/extraction/types.ts` — Type definitions (done in Story 1.1)
- `context/extraction-context.tsx` — ExtractionProvider (done in Story 1.1/2.1)
- `jest.config.ts` — Jest config (no changes needed)

**Files you WILL modify:**
- `app/review.tsx` — Wire pipeline call (Task 6)

**Files you WILL create:**
- `lib/extraction/parse-date-time.ts` — Stage 4
- `lib/extraction/parse-event-name.ts` — Stage 5
- `lib/extraction/parse-venue.ts` — Stage 6
- `lib/extraction/build-event-fields.ts` — Stage 7
- `lib/extraction/run-pipeline.ts` — Pipeline orchestrator
- `lib/extraction/__tests__/parse-date-time.test.ts`
- `lib/extraction/__tests__/parse-event-name.test.ts`
- `lib/extraction/__tests__/parse-venue.test.ts`
- `lib/extraction/__tests__/build-event-fields.test.ts`
- `lib/extraction/__tests__/run-pipeline.test.ts`

### Testing Strategy

**chrono-node in tests:** chrono-node is pure JS — no mocking needed. Tests can call `parseDateTime` directly with real chrono-node parsing.

**Note on relative dates in tests:** `chrono.parse("next Saturday")` depends on the current date. For deterministic tests, pass a reference date or test that the result is a valid date string (regex match `\d{4}-\d{2}-\d{2}`) rather than asserting a specific date value.

**expo-text-extractor in runPipeline tests:** Use inline `jest.mock('expo-text-extractor', ...)` — same pattern as Story 2.2's extract-text-from-image tests.

**Test data patterns for parseDateTime:**
- Natural language: `"Saturday March 28 at 10 PM"` → `{ date: "2026-03-28", time: "22:00" }`
- Date only: `"March 28, 2026"` → `{ date: "2026-03-28", time: null }`
- Numeric: `"3/28/2026 10:00 PM"` → `{ date: "2026-03-28", time: "22:00" }`
- No date: `"just vibes"` → `{ date: null, time: null }`

**Test data patterns for parseEventName:**
- Caption: `"Summer Music Festival\nSaturday March 28\nhttps://instagram.com/p/123"` → `"Summer Music Festival"`
- URL first: `"https://instagram.com/p/123\nDJ Night at Warehouse"` → `"DJ Night at Warehouse"`
- With separator: `"Summer Festival\n---\nWAREHOUSE PARTY"` → `"Summer Festival"` (metadata first)

**Test data patterns for parseVenue:**
- Address: `"Party at 450 Main St tonight"` → `"450 Main St"`
- At pattern: `"Live music at The Warehouse"` → `"The Warehouse"`
- Label: `"venue: Central Park"` → `"Central Park"`

### Anti-Patterns to Avoid

- Never throw errors from extraction functions — return `null` (or `{ date: null, time: null }` for parseDateTime)
- Never use empty strings for missing fields — use `null`
- Never use `any` types
- Never import React in `lib/` files
- Do NOT build review screen UI in this story — only wire the pipeline
- Do NOT change `ExtractionConfidence` type to strings — keep `number | null`
- Do NOT modify existing stage 1-3 files (parse-share-intent, extract-text-from-image, merge-extraction-sources)

### What This Story Does NOT Include

- **No review screen form UI** — field rendering is Story 3.1
- **No calendar save** — Story 3.2
- **No error recovery UI** — Story 4.1
- **No advanced NLP** — simple heuristics are sufficient for MVP
- **No confidence string labels** — deferred architectural reconciliation

### Project Structure After This Story

```
lib/extraction/
  parse-share-intent.ts       # (existing) Stage 1
  extract-text-from-image.ts  # (existing) Stage 2
  merge-extraction-sources.ts # (existing) Stage 3
  parse-date-time.ts          # (NEW) Stage 4 - chrono-node date/time
  parse-event-name.ts         # (NEW) Stage 5 - heuristic name extraction
  parse-venue.ts              # (NEW) Stage 6 - heuristic venue extraction
  build-event-fields.ts       # (NEW) Stage 7 - assemble ExtractionResult
  run-pipeline.ts             # (NEW) Pipeline orchestrator
  types.ts                    # (existing) Type definitions
  __tests__/
    parse-share-intent.test.ts       # (existing) 8 tests
    extract-text-from-image.test.ts  # (existing) 6 tests
    merge-extraction-sources.test.ts # (existing) 7 tests
    parse-date-time.test.ts          # (NEW) ~7 tests
    parse-event-name.test.ts         # (NEW) ~7 tests
    parse-venue.test.ts              # (NEW) ~7 tests
    build-event-fields.test.ts       # (NEW) ~3 tests
    run-pipeline.test.ts             # (NEW) ~5 tests
```

### Code Review Findings from Stories 1-1, 1-2, 2-1, 2-2

Maintain these patterns established in previous stories:
- All `SafeAreaView` must have `backgroundColor: colorTokens.surface` explicitly set
- Use registered typography presets (`display`, `headline`, `title`, `body`) — never RNUILib built-in presets like `text60`
- Use `trim()` on text inputs before falsy checks to handle whitespace-only strings
- Jest and ts-jest must be on matching major versions (currently both v29)
- `ts-node` is a required dev dependency for Jest to parse `jest.config.ts`
- Inline `jest.mock()` works cleanly for native modules — no jest.config.ts changes needed
- `npx expo lint` may error on empty `components/` dir (pre-existing) — use `npx eslint lib/ app/` instead

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.3 Acceptance Criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — Extraction Pipeline Architecture, Stages 4-7, Data Flow, Pipeline Orchestrator]
- [Source: _bmad-output/planning-artifacts/prd.md — FR7, FR8, FR9, NFR1 (<2s extraction), NFR5 (all on-device)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Review Screen: fields pre-populated, no loading state visible to user]
- [Source: _bmad-output/implementation-artifacts/2-1-share-sheet-registration-and-intent-handling.md — parseShareIntent, ExtractionContext, ShareIntentBridge, review.tsx wiring]
- [Source: _bmad-output/implementation-artifacts/2-2-text-parsing-and-ocr-extraction.md — extractTextFromImage, mergeExtractionSources, test patterns, jest.mock approach]
- [Source: node_modules/chrono-node — API: chrono.parse() returns ParsedResult[], start.get(component), start.isCertain(component)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Implemented `parseDateTime` using chrono-node v2.9.0 — extracts ISO date and 24h time from natural language
- Implemented `parseEventName` with metadata-first heuristic — splits on `\n---\n` separator, skips URLs, truncates to 100 chars
- Implemented `parseVenue` with 3-priority pattern matching — street addresses, "at"/"@" patterns, labeled venues
- Implemented `buildEventFields` — assembles ExtractionResult with simple confidence mapping (1/null)
- Implemented `runPipeline` — orchestrates stages 2-7, handles partial failures gracefully, never throws
- Wired pipeline into `review.tsx` — calls runPipeline after parseShareIntent, transitions status extracting → ready/error
- All 29 new tests pass, 21 existing tests pass (50 total), zero ESLint errors, zero type errors

### Change Log

- 2026-04-01: Implemented Story 2.3 — date/time, event name, venue parsing with pipeline orchestration (all 12 tasks)

### File List

- `lib/extraction/parse-date-time.ts` (NEW) — Stage 4: chrono-node date/time parser
- `lib/extraction/parse-event-name.ts` (NEW) — Stage 5: heuristic event name extraction
- `lib/extraction/parse-venue.ts` (NEW) — Stage 6: heuristic venue extraction
- `lib/extraction/build-event-fields.ts` (NEW) — Stage 7: ExtractionResult assembler
- `lib/extraction/run-pipeline.ts` (NEW) — Pipeline orchestrator (stages 2-7)
- `lib/extraction/__tests__/parse-date-time.test.ts` (NEW) — 7 unit tests
- `lib/extraction/__tests__/parse-event-name.test.ts` (NEW) — 7 unit tests
- `lib/extraction/__tests__/parse-venue.test.ts` (NEW) — 7 unit tests
- `lib/extraction/__tests__/build-event-fields.test.ts` (NEW) — 3 unit tests
- `lib/extraction/__tests__/run-pipeline.test.ts` (NEW) — 5 integration tests
- `app/review.tsx` (MODIFIED) — Wired runPipeline call with status transitions
