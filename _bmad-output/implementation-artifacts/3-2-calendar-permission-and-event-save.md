# Story 3.2: Calendar Permission & Event Save

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to save the event to my device calendar with a single tap,
so that the event appears in my calendar app without any extra steps.

## Acceptance Criteria

1. **Given** the Review screen is displayed with event fields
   **When** the user views the bottom of the screen
   **Then** a "Save to Calendar" primary CTA is displayed with gradient fill (`primary` #005bbf → `primaryContainer` #1a73e8 at 135° via expo-linear-gradient), white text, Manrope Bold, full-width, 48px minimum height
   **And** a "Cancel" secondary CTA is displayed below it with `surfaceContainerHigh` fill, `onSurface` text, Manrope Bold, full-width, 48px minimum height
   **And** both buttons and all form content are visible without scrolling on standard screen sizes (375pt+ width)

2. **Given** the user has never saved an event before (no calendar permission granted)
   **When** the user taps "Save to Calendar"
   **Then** the system calendar permission dialog is presented via expo-calendar
   **And** if permission is granted, the event is saved immediately
   **And** if permission is denied, the system permission dialog handles the denial (no custom error screen)

3. **Given** the user has previously granted calendar permission
   **When** the user taps "Save to Calendar"
   **Then** `lib/calendar/write-event.ts` converts the form data (extraction + user edits merged) into a `CalendarEvent` with `title`, `startDate`, `endDate` (default: startDate + 2 hours), and `location`
   **And** the event is written to the device's default calendar via expo-calendar
   **And** the calendar write completes in under 500ms (NFR4)
   **And** ExtractionContext status transitions to `'saved'`
   **And** the app navigates to the Success screen (replace transition — no back to Review)

4. **Given** the user has edited some fields on the Review screen
   **When** the user taps "Save to Calendar"
   **Then** the saved event uses `userEdits` merged over `extraction` values — user edits take precedence

5. **Given** some event fields are empty (null extraction, no user edit)
   **When** the user taps "Save to Calendar"
   **Then** the event is saved with whatever fields are populated — no required field validation, no blocking dialogs (FR12)

6. **Given** the user taps "Cancel"
   **When** the Cancel action triggers
   **Then** the Review screen is dismissed and the user returns to the previous app (Instagram) without saving (FR14)
   **And** the system back gesture (swipe from edge on iOS, back button on Android) also acts as Cancel

## Tasks / Subtasks

- [x] Task 1: Create `lib/calendar/write-event.ts` (AC: #3, #4, #5)
  - [x] Create `lib/calendar/write-event.ts`
  - [x] Import `CalendarEvent` from `@/lib/extraction/types`
  - [x] Import `* as Calendar` from `expo-calendar`
  - [x] Create `buildCalendarEvent(extraction, userEdits)` function that merges userEdits over extraction:
    - `title`: `userEdits.eventName ?? extraction?.eventName ?? 'Untitled Event'`
    - `startDate`: parse `userEdits.date ?? extraction?.date` and `userEdits.time ?? extraction?.time` into a `Date` object. If date is null, use today's date. If time is null, use 19:00 as default.
    - `endDate`: `startDate + 2 hours`
    - `location`: `userEdits.venue ?? extraction?.venue ?? ''`
  - [x] Create `async function writeEvent(event: CalendarEvent): Promise<string>` that:
    - Gets the default calendar via `Calendar.getDefaultCalendarAsync()`
    - If no default calendar found, fall back to `Calendar.getCalendarsAsync()` and pick the first writable calendar
    - Calls `Calendar.createEventAsync(calendarId, { title, startDate, endDate, location })`
    - Returns the created event ID
  - [x] Export both `buildCalendarEvent` and `writeEvent`

- [x] Task 2: Create `lib/calendar/request-permission.ts` (AC: #2)
  - [x] Create `lib/calendar/request-permission.ts`
  - [x] Import `* as Calendar` from `expo-calendar`
  - [x] Create `async function requestCalendarPermission(): Promise<boolean>` that:
    - Calls `Calendar.requestCalendarPermissionsAsync()`
    - Returns `true` if `status === 'granted'`
    - Returns `false` otherwise (denied or undetermined)
    - Never throws — wrap in try/catch, return `false` on error
  - [x] Export the function

- [x] Task 3: Wire Save button in `app/review.tsx` (AC: #2, #3, #4, #5)
  - [x] Import `requestCalendarPermission` from `@/lib/calendar/request-permission`
  - [x] Import `buildCalendarEvent`, `writeEvent` from `@/lib/calendar/write-event`
  - [x] Replace the no-op `handleSave` with async implementation:
    1. Check/request calendar permission via `requestCalendarPermission()`
    2. If permission denied, return early (system dialog handles messaging)
    3. Call `buildCalendarEvent(extraction, userEdits)` to create the CalendarEvent
    4. Call `setStatus('saving')` on ExtractionContext
    5. Call `writeEvent(calendarEvent)` to write to device calendar
    6. Call `setStatus('saved')` on ExtractionContext
    7. Navigate to `/success` using `router.replace('/success')` (replace, no back)
  - [x] Add error handling: if writeEvent fails, log the error, do NOT crash — stay on Review screen
  - [x] Prevent double-tap: disable Save button while status is `'saving'` (use `isNavigating.current` ref pattern from Cancel)

- [x] Task 4: Write unit tests for calendar module (AC: #3, #5)
  - [x] Create `lib/calendar/__tests__/write-event.test.ts`
  - [x] Mock `expo-calendar` module
  - [x] Test `buildCalendarEvent`:
    - Full extraction + no edits → uses extraction values
    - Partial extraction + user edits → edits take precedence
    - Null date → defaults to today
    - Null time → defaults to 19:00
    - Null name → falls back to 'Untitled Event'
    - Null venue → falls back to empty string
    - endDate is always startDate + 2 hours
  - [x] Test `writeEvent`:
    - Success: returns event ID from `createEventAsync`
    - Uses default calendar when available
  - [x] Create `lib/calendar/__tests__/request-permission.test.ts`
  - [x] Test `requestCalendarPermission`:
    - Granted → returns true
    - Denied → returns false
    - Error thrown → returns false

- [x] Task 5: Run validations (AC: #1–#6)
  - [x] Run `npx jest` — all tests pass (existing + new)
  - [x] Run `npx eslint lib/ app/ components/ context/` — no errors
  - [x] Run `npx tsc --noEmit` — no type errors

## Dev Notes

### Architecture Compliance

**Module Boundary Rules (CRITICAL):**
- `lib/calendar/write-event.ts` is pure business logic — NO React imports
- `lib/calendar/request-permission.ts` is pure business logic — NO React imports
- `app/review.tsx` orchestrates: calls calendar functions from `lib/calendar/`, updates ExtractionContext, navigates
- Only `app/review.tsx` calls `setStatus()` — calendar functions do NOT touch context

**Naming Conventions:**
- File names: `kebab-case.ts` (e.g., `write-event.ts`, `request-permission.ts`)
- Functions: `camelCase` (e.g., `writeEvent`, `requestCalendarPermission`, `buildCalendarEvent`)
- Test files: co-located in `__tests__/` folder within `lib/calendar/`

### expo-calendar API Reference

**CRITICAL: Use expo-calendar v15.x API (Expo SDK 54). Key functions:**

```typescript
import * as Calendar from 'expo-calendar';

// Permission
const { status } = await Calendar.requestCalendarPermissionsAsync();
// status: 'granted' | 'denied' | 'undetermined'

// Get default calendar
const defaultCalendar = await Calendar.getDefaultCalendarAsync();
// Returns Calendar object with .id

// Fallback: get all calendars and find writable one
const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
// Filter for allowsModifications === true

// Create event
const eventId = await Calendar.createEventAsync(calendarId, {
  title: string,
  startDate: Date,
  endDate: Date,
  location: string,
  timeZone: string,  // Use device timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
});
```

**Platform differences:**
- iOS: `getDefaultCalendarAsync()` returns the user's default calendar
- Android: `getDefaultCalendarAsync()` may throw — use fallback to `getCalendarsAsync()` and find the first writable calendar
- Both platforms: `requestCalendarPermissionsAsync()` works identically

### Date/Time Parsing Logic

**CRITICAL: Extraction stores date as ISO 8601 string (`YYYY-MM-DD`) and time as 24h string (`HH:MM`). These must be converted to `Date` objects for expo-calendar.**

```typescript
function parseToDate(dateStr: string | null, timeStr: string | null): Date {
  const now = new Date();

  // Parse date or default to today
  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();

  if (dateStr) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
      day = parseInt(parts[2], 10);
    }
  }

  // Parse time or default to 19:00
  let hours = 19;
  let minutes = 0;

  if (timeStr) {
    const timeParts = timeStr.split(':');
    if (timeParts.length >= 2) {
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1], 10);
    }
  }

  return new Date(year, month, day, hours, minutes);
}
```

**IMPORTANT:** The user may edit the date/time fields to non-ISO formats (e.g., "March 28" or "10 PM"). For MVP, only parse strict `YYYY-MM-DD` and `HH:MM` formats — if parsing fails, fall back to today at 19:00. Advanced date parsing from free-text user input is a Phase 2 concern.

### CalendarEvent Type (from `lib/extraction/types.ts`)

```typescript
export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;     // Default: startDate + 2 hours
  location: string;
}
```

This type already exists in `lib/extraction/types.ts` — use it directly. Do NOT create a separate types.ts in `lib/calendar/`.

### ExtractionContext Status Flow

Current story adds these status transitions:
```
'ready' → 'saving' (user taps Save) → 'saved' (write successful → navigate to /success)
```

If write fails:
```
'ready' → 'saving' → 'ready' (revert — stay on Review screen, user can retry)
```

The `ExtractionContext` already supports `'saving'` and `'saved'` statuses. No context changes needed.

### Previous Story (3.1) Intelligence

Story 3.1 established these patterns in `app/review.tsx` that MUST be preserved:

- **`isNavigating.current` ref pattern:** Used to prevent double-tap on Cancel. Reuse this pattern for Save to prevent double-tap during calendar write.
- **`handleCancel` already works:** Calls `reset()` and `router.replace('/')` — DO NOT modify unless needed.
- **Save button already exists visually:** The gradient LinearGradient button is already rendered in review.tsx at line 221-245. Only the `handleSave` function needs replacement (currently a console.log no-op).
- **Cancel button already works:** Already calls `handleCancel` — no changes needed.
- **Field values already computed:** `eventName`, `date`, `time`, `venue` variables already merge userEdits over extraction — use these directly.
- **`useShareIntentContext` and pipeline effect:** The extraction pipeline setup in useEffect is already complete. Do not modify.
- **TypeScript strict mode:** All parameters must be typed. No `any`.
- **`colorTokens`, `spacing`, `radii`, `typeScale`** are already imported — reuse existing imports.

### Existing Code (DO NOT modify unless specified)

- `lib/extraction/` — All extraction pipeline files — DO NOT modify
- `context/extraction-context.tsx` — ExtractionContext provider — DO NOT modify
- `theme/digital-concierge.ts` — Theme tokens — DO NOT modify
- `theme/typography.ts` — Font configuration — DO NOT modify
- `app/_layout.tsx` — Root layout with providers — DO NOT modify
- `app/index.tsx` — Home screen — DO NOT modify
- `components/extracted-text-preview.tsx` — Text preview component — DO NOT modify

**Files you WILL modify:**
- `app/review.tsx` — Replace `handleSave` no-op with calendar write logic, add imports

**Files you WILL create:**
- `lib/calendar/write-event.ts` — Calendar event building and writing
- `lib/calendar/request-permission.ts` — Calendar permission request
- `lib/calendar/__tests__/write-event.test.ts` — Unit tests for write-event
- `lib/calendar/__tests__/request-permission.test.ts` — Unit tests for request-permission

**Files to delete:**
- `lib/calendar/.gitkeep` — Remove placeholder once real files are created

### Testing Strategy

**Mock expo-calendar for unit tests:**
```typescript
jest.mock('expo-calendar', () => ({
  requestCalendarPermissionsAsync: jest.fn(),
  getDefaultCalendarAsync: jest.fn(),
  getCalendarsAsync: jest.fn(),
  createEventAsync: jest.fn(),
  EntityTypes: { EVENT: 'event' },
}));
```

**Jest config:** `roots` in `jest.config.ts` already includes `<rootDir>/lib` which covers `lib/calendar/__tests__/`. No jest config changes needed.

**Test data samples:**
```typescript
const mockExtraction: ExtractionResult = {
  eventName: 'DJ Night at Warehouse',
  date: '2026-03-28',
  time: '22:00',
  venue: 'The Warehouse, 450 Main St',
  rawText: 'DJ Night this Saturday...',
  confidence: { eventName: 0.9, date: 0.95, time: 0.9, venue: 0.8 },
};
```

### Anti-Patterns to Avoid

- Never throw errors from `writeEvent` or `requestCalendarPermission` — return gracefully or let caller handle
- Never show a custom permission dialog — expo-calendar's system dialog is the only permission UI
- Never block save on empty fields — FR12 explicitly says no required fields
- Never hardcode calendar IDs — always query for default/writable calendar at runtime
- Never modify ExtractionContext from within `lib/calendar/` functions — only `app/review.tsx` touches context
- Never use `router.push('/success')` — must be `router.replace('/success')` (no back to Review, per UX-DR9)
- Never add loading spinners or save progress indicators — the save should be near-instant (<500ms per NFR4)
- Do NOT implement the full Success screen (auto-dismiss, event name display) — that is Story 3.3. Just navigate to `/success` which already has a placeholder.

### What This Story Does NOT Include

- **No Success screen enhancements** — Story 3.3 handles auto-dismiss, checkmark icon, event name display
- **No error screen** — Story 4.1 handles extraction failure UI
- **No offline calendar sync** — expo-calendar writes directly to the native calendar, which handles its own sync
- **No date picker or time picker** — plain text fields for MVP
- **No free-text date parsing on user edits** — strict ISO format only; Phase 2 concern

### Project Structure After This Story

```
lib/calendar/
  write-event.ts                     # (NEW) Build CalendarEvent + write to device calendar
  request-permission.ts              # (NEW) Request calendar write permission
  __tests__/
    write-event.test.ts              # (NEW) Unit tests for write-event
    request-permission.test.ts       # (NEW) Unit tests for request-permission
app/
  review.tsx                         # (MODIFIED) handleSave wired to calendar write + navigation
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.2 Acceptance Criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — Calendar Integration, State Management, Data Format Patterns (CalendarEvent interface), Error Handling Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md — FR12, FR14, FR15, FR16, FR17, NFR4, NFR8]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Button Hierarchy (UX-DR6), Navigation Flow (UX-DR9)]
- [Source: _bmad-output/implementation-artifacts/3-1-review-screen-with-pre-populated-event-form.md — Review screen patterns, isNavigating ref, handleCancel, field value computation]
- [Source: lib/extraction/types.ts — CalendarEvent interface, ExtractionResult interface]
- [Source: context/extraction-context.tsx — ExtractionStatus types including 'saving' and 'saved']
- [Source: app/review.tsx — Current handleSave no-op at line 103-106, button UI at lines 221-245]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- No issues encountered during implementation — clean first pass

### Completion Notes List

- Task 1: Created `lib/calendar/write-event.ts` with `buildCalendarEvent()` (merges extraction + user edits, defaults for missing fields) and `writeEvent()` (writes to default calendar via expo-calendar, falls back to first writable calendar on Android)
- Task 2: Created `lib/calendar/request-permission.ts` with `requestCalendarPermission()` — wraps expo-calendar permission, returns boolean, never throws
- Task 3: Wired `handleSave` in `app/review.tsx` — requests permission, builds CalendarEvent, writes to calendar, transitions status to 'saved', navigates to /success via router.replace(). Error handling reverts status to 'ready'. Double-tap prevention via `isNavigating.current` ref.
- Task 4: Created 15 unit tests across 2 test files — 11 for write-event (8 buildCalendarEvent + 3 writeEvent) and 4 for request-permission (granted, denied, undetermined, error)
- Task 5: All 72 tests pass (57 existing + 15 new), zero lint errors, zero type errors

### Change Log

- 2026-04-01: Implemented Story 3.2 — Calendar permission request, event building with merge logic, device calendar write via expo-calendar, Save button wired in review screen, navigation to success screen, 15 unit tests

### File List

- `lib/calendar/write-event.ts` — NEW: Build CalendarEvent from extraction+edits, write to device calendar
- `lib/calendar/request-permission.ts` — NEW: Request calendar write permission
- `lib/calendar/__tests__/write-event.test.ts` — NEW: 11 unit tests for write-event
- `lib/calendar/__tests__/request-permission.test.ts` — NEW: 4 unit tests for request-permission
- `app/review.tsx` — MODIFIED: Replaced handleSave no-op with calendar write + navigation logic
- `lib/calendar/.gitkeep` — DELETED: Removed placeholder
