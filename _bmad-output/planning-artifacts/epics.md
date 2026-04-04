---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
status: complete
completedAt: '2026-03-27'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# PostCal - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for PostCal, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can share an Instagram post to PostCal via the system share sheet on iOS
FR2: User can share an Instagram post to PostCal via the system share sheet on Android
FR3: The system can receive and process shared content (text, metadata, and image URI) from the share sheet
FR4: The system can parse text and metadata passed through the share sheet from Instagram
FR5: The system can extract text from a shared image using on-device OCR
FR6: The system can merge extraction results from share sheet metadata and OCR into a unified set of event fields
FR7: The system can extract a date and time from raw text using natural language date parsing
FR8: The system can extract an event name from raw text using heuristic analysis
FR9: The system can extract a venue/location from raw text using heuristic analysis
FR10: User can view pre-populated event fields (name, date, time, venue) after extraction
FR11: User can edit any pre-populated event field before saving
FR12: User can save an event with partially populated fields (no required fields)
FR13: User can view the extracted source text as reference context alongside the event form
FR14: User can cancel the event review and return to the previous app without saving
FR15: User can save an event to the device's native calendar with a single tap
FR16: The system can request calendar write permission from the user on first save
FR17: The system can write an event (name, date, time, location) to the device calendar
FR18: The system can detect when extraction produces no usable event data
FR19: User can choose to enter event details manually when extraction fails
FR20: User can retry the extraction when it fails
FR21: User can see a brief confirmation after successfully saving an event
FR22: The success confirmation auto-dismisses after a short delay
FR23: User can view instructions explaining how to use PostCal's share sheet workflow
FR24: User can access the Home screen by launching the app directly

### NonFunctional Requirements

NFR1: OCR extraction + text parsing completes in under 2 seconds on-device, so the review screen appears pre-populated with no visible loading state
NFR2: The end-to-end flow from share sheet tap to calendar save completes in under 10 seconds including user review time
NFR3: App launch from share sheet to rendered review screen takes under 1 second
NFR4: Calendar write operation completes in under 500ms
NFR5: All processing occurs on-device — no data is transmitted to external servers
NFR6: No user data is collected, stored, or tracked beyond the current extraction session
NFR7: No third-party analytics, tracking SDKs, or telemetry are included in the app
NFR8: Calendar permission is requested only when needed (first save), not at app launch
NFR9: All interactive elements meet WCAG 2.1 Level AA contrast ratios (minimum 4.5:1 for text, 3:1 for UI components)
NFR10: All interactive elements have minimum 44x44px touch targets
NFR11: All form fields and buttons have programmatic accessibility labels for screen readers (VoiceOver/TalkBack)
NFR12: The app respects system font size preferences up to 1.5x without layout breakage
NFR13: The app respects system reduced motion preferences (disabling animations when enabled)
NFR14: Share sheet registration works with Instagram's share flow on both iOS (Share Extension) and Android (Intent Filter)
NFR15: Calendar export is compatible with the device's default calendar app on both iOS and Android
NFR16: The app functions correctly on iOS 16+ and Android API 24+

### Additional Requirements

- Starter template already scaffolded via create-expo-app (Expo SDK 54, TypeScript, Expo Router v6, RNUILib v8.4.0 installed)
- Dependencies to add: expo-share-intent, expo-text-extractor, expo-calendar, expo-linear-gradient, chrono-node
- Dependencies to remove: tesseract.js, install, npm (accidental artifacts)
- Project cleanup: remove default tab layout and example screens, restructure app/ for 3-screen flow (Home, Review, Success)
- 7-stage extraction pipeline architecture in lib/extraction/ with discrete pure functions (parseShareIntent, extractTextFromImage, mergeExtractionSources, parseDateTime, parseEventName, parseVenue, buildEventFields)
- Pipeline orchestrator (runPipeline) chains stages and handles partial failures gracefully
- React Context (ExtractionContext) for session state management — created fresh per share session
- TypeScript interfaces defined for SharedContent, ExtractionResult, CalendarEvent — all extraction fields nullable (null, not empty string)
- Jest unit tests targeting all extraction pipeline functions with curated sample data
- Graceful degradation error handling: extraction functions return null on failure, never throw
- EAS Build required for native modules (expo-text-extractor, expo-share-intent) — Expo Go not supported
- expo-share-intent v5.x provides config plugin for iOS Share Extension and Android Intent Filter setup
- +native-intent.ts file handles share intent routing to /review screen
- File naming: kebab-case for all files, PascalCase for components, camelCase for functions
- lib/ contains no React dependencies; app/ and components/ contain React code
- RNUILib themed components exclusively — no raw React Native UI imports
- Digital Concierge theme tokens from theme/digital-concierge.ts — never hardcode colors or font sizes

### UX Design Requirements

UX-DR1: Digital Concierge theme configuration — RNUILib ThemeManager with full color token set (primary #005bbf, primaryContainer #1a73e8, surface #f8f9fa, surfaceContainerLow #f3f4f5, surfaceContainerLowest #ffffff, surfaceContainerHigh #e7e8e9, onSurface #191c1d, onSurfaceVariant #414754, outlineVariant #c1c6d6), Manrope + Inter typography system, 4px grid spacing scale, and component rules (no 1px borders, gradient CTAs, tonal surface shifts for spatial separation)
UX-DR2: Review Screen layout — extracted text preview at top, 4 editable TextFields (Event Name, Date, Time, Location) with pre-populated values, gradient "Save to Calendar" primary CTA, "Cancel" secondary CTA below, all content visible without scrolling on standard screen sizes
UX-DR3: Success Screen — understated checkmark icon, event name + "Saved to Calendar" headline, auto-dismiss after 2 seconds, "Done" primary CTA as fallback if auto-dismiss doesn't trigger
UX-DR4: Error Screen — "Couldn't extract event details" title (Manrope Bold 18px), "Enter Manually" primary CTA, "Try Again" secondary CTA, neutral non-apologetic tone
UX-DR5: Home Screen — "PostCal" display title (Manrope ExtraBold 36px), "How it Works" section with three instruction cards (Share from Instagram → Review extracted details → Save to calendar), referencing Instagram specifically
UX-DR6: Button hierarchy — two tiers only: primary (gradient fill #005bbf → #1a73e8 at 135°, white text, Manrope Bold) and secondary (surfaceContainerHigh fill, onSurface text, Manrope Bold), full-width, 48px minimum height, rounded-lg corners, one primary button per screen
UX-DR7: Form field patterns — surfaceContainerLow fill, no borders, rounded-xl corners, labels always above fields (Inter Semibold 12px onSurfaceVariant), no placeholder text inside fields, no required field indicators, no character limits or format validation
UX-DR8: TextField focus state — background shifts to surfaceContainerLowest (#ffffff), 2px ghost border in primary (#005bbf) at 40% opacity
UX-DR9: Navigation flow — no persistent navigation (no tab bar, no menu), share sheet → Review (push transition), Review → Success (replace, no back), Success → auto-dismiss (fade after 2s), Cancel on Review = dismiss/pop to previous app, system back gesture acts as Cancel
UX-DR10: Accessibility implementation — accessibilityLabel on all interactive elements, accessibilityRole on buttons and headers, VoiceOver/TalkBack reading order matching visual order (preview → name → date → time → location → save → cancel), reduced motion support (instant dismiss instead of fade), dynamic type up to 1.5x without layout breakage, ghost borders become visible in high contrast mode
UX-DR11: Responsive layout — small phones (320-374pt) reduce spacing scale by one tier, standard phones (375-413pt) default layout, large phones (414pt+) maintain standard with extra breathing room, flexible layouts with percentage-based widths, no fixed breakpoints
UX-DR12: Extracted Text Preview component — View with surfaceContainerLow background containing Text in onSurfaceVariant at label size (Inter Regular 11px), static and non-interactive, placed at top of Review screen above form fields, hidden entirely if no text was extracted
UX-DR13: Screen headers — Review: "Confirm Event Details" in headline (Manrope Bold 24px), Success: "Saved to Calendar" in headline, Home: "PostCal" in display (Manrope ExtraBold 36px), Error: "Couldn't extract event details" in title (Manrope Bold 18px)
UX-DR14: Keyboard behavior — tapping field opens appropriate keyboard, "Next" key advances to next field, "Done" key dismisses keyboard, tapping outside any field dismisses keyboard, KeyboardAvoidingView wrapping Review screen form

### FR Coverage Map

FR1: Epic 2 - Share sheet registration on iOS
FR2: Epic 2 - Share sheet registration on Android
FR3: Epic 2 - Receive/process shared content
FR4: Epic 2 - Parse share sheet text/metadata
FR5: Epic 2 - On-device OCR extraction
FR6: Epic 2 - Merge metadata + OCR results
FR7: Epic 2 - Date/time parsing via chrono-node
FR8: Epic 2 - Event name heuristic extraction
FR9: Epic 2 - Venue/location heuristic extraction
FR10: Epic 3 - View pre-populated event fields
FR11: Epic 3 - Edit any event field
FR12: Epic 3 - Save with partial fields
FR13: Epic 3 - View extracted source text
FR14: Epic 3 - Cancel and return to previous app
FR15: Epic 3 - One-tap save to calendar
FR16: Epic 3 - Request calendar permission
FR17: Epic 3 - Write event to device calendar
FR18: Epic 4 - Detect extraction failure
FR19: Epic 4 - Manual entry fallback
FR20: Epic 4 - Retry extraction
FR21: Epic 3 - Success confirmation display
FR22: Epic 3 - Auto-dismiss success
FR23: Epic 1 - Home screen instructions
FR24: Epic 1 - Direct app launch to Home

## Epic List

### Epic 1: App Foundation & Home Screen
Users can launch PostCal and understand how to use the share sheet workflow through a polished, branded experience.
**FRs covered:** FR23, FR24

### Epic 2: Share Sheet & Event Extraction
Users can share an Instagram post to PostCal and the app extracts event details (name, date, time, venue) automatically using on-device processing.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9

### Epic 3: Event Review, Calendar Save & Confirmation
Users can review pre-populated event details, edit any field, save to their device calendar with one tap, and see a brief success confirmation.
**FRs covered:** FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR21, FR22

### Epic 4: Error Handling & Graceful Degradation
Users can still save events even when extraction fails — through manual entry fallback or retry — so PostCal is always useful regardless of OCR quality.
**FRs covered:** FR18, FR19, FR20

## Epic 1: App Foundation & Home Screen

Users can launch PostCal and understand how to use the share sheet workflow through a polished, branded experience.

### Story 1.1: Project Cleanup & Digital Concierge Theme Setup

As a user,
I want PostCal to launch with a polished, branded appearance using the Digital Concierge design system,
So that the app feels like a premium, trustworthy utility from the first interaction.

**Acceptance Criteria:**

**Given** the project has the default Expo template with tab navigation and example screens
**When** the developer completes this story
**Then** default tab layout, example screens, and example components are removed
**And** the app/ directory contains only `_layout.tsx` and `index.tsx` (placeholder Home)
**And** project structure directories exist: `lib/extraction/`, `lib/calendar/`, `context/`, `theme/`, `components/`, `constants/`

**Given** the project has incorrect dependencies (tesseract.js, install, npm)
**When** the developer completes this story
**Then** tesseract.js, install, and npm are removed from package.json
**And** expo-share-intent, expo-text-extractor, expo-calendar, expo-linear-gradient, and chrono-node are installed
**And** the project builds successfully with the updated dependency set

**Given** the app launches
**When** the root layout renders
**Then** RNUILib ThemeManager is configured with Digital Concierge color tokens (primary #005bbf, surface #f8f9fa, surfaceContainerLow #f3f4f5, surfaceContainerLowest #ffffff, surfaceContainerHigh #e7e8e9, onSurface #191c1d, onSurfaceVariant #414754, outlineVariant #c1c6d6)
**And** Manrope (Bold, ExtraBold) and Inter (Regular, Medium, SemiBold) fonts are loaded via expo-font
**And** fallback to system fonts (SF Pro on iOS, Roboto on Android) if font loading fails
**And** Expo Router navigation is configured with routes for `/` (Home), `/review`, and `/success`

### Story 1.2: Home Screen with Usage Instructions

As a user,
I want to see clear instructions when I open PostCal directly,
So that I understand how to use the share sheet workflow to save Instagram events to my calendar.

**Acceptance Criteria:**

**Given** the user taps the PostCal app icon
**When** the Home screen loads
**Then** the screen displays "PostCal" as the display title in Manrope ExtraBold at 36px
**And** a "How it Works" section is visible with three instruction cards
**And** the three steps are: (1) Share an event post from Instagram, (2) Review the extracted details, (3) Save to your calendar
**And** instruction cards reference Instagram specifically

**Given** the Home screen is rendered
**When** the user views the layout
**Then** the screen uses `surface` (#f8f9fa) as the background color
**And** instruction cards use `surfaceContainerLowest` (#ffffff) with tonal lift on `surface` background
**And** all spacing follows the 4px grid scale with 24px horizontal padding
**And** the layout adapts to screen sizes: small phones (320-374pt) reduce spacing by one tier, standard (375-413pt) use default, large (414pt+) maintain standard with breathing room

**Given** a screen reader (VoiceOver/TalkBack) is active
**When** the user navigates the Home screen
**Then** the "PostCal" title has `accessibilityRole="header"`
**And** each instruction card has a descriptive `accessibilityLabel`
**And** reading order follows the visual top-to-bottom layout

## Epic 2: Share Sheet & Event Extraction

Users can share an Instagram post to PostCal and the app extracts event details (name, date, time, venue) automatically using on-device processing.

### Story 2.1: Share Sheet Registration & Intent Handling

As a user,
I want to see PostCal in my share sheet when I tap Share on an Instagram post,
So that I can send event posts directly to PostCal without leaving Instagram.

**Acceptance Criteria:**

**Given** PostCal is installed on an iOS device
**When** the user taps Share on an Instagram post
**Then** PostCal appears as an option in the iOS share sheet
**And** this is configured via expo-share-intent's config plugin for iOS Share Extension in app.json

**Given** PostCal is installed on an Android device
**When** the user taps Share on an Instagram post
**Then** PostCal appears as an option in the Android share sheet
**And** this is configured via expo-share-intent's config plugin for Android Intent Filter in app.json

**Given** the user selects PostCal from the share sheet
**When** shared content is received
**Then** `+native-intent.ts` receives the shared content (text, metadata, and image URI if available)
**And** the app navigates to the `/review` route
**And** the shared content is passed to ExtractionContext as a `SharedContent` object with `text: string | null`, `imageUri: string | null`, `mimeType: string | null`

**Given** the ExtractionContext provider does not yet exist
**When** the developer completes this story
**Then** `context/extraction-context.tsx` is created with the `ExtractionState` interface (`sharedContent`, `extraction`, `userEdits`, `status`)
**And** the context is provided in `app/_layout.tsx`
**And** a new context is created fresh for each share session (no stale state)

### Story 2.2: Text Parsing & OCR Extraction

As a user,
I want PostCal to read both the caption text and the image from my shared Instagram post,
So that the app has the best possible source material for extracting event details.

**Acceptance Criteria:**

**Given** shared content contains text/metadata from Instagram
**When** `parseShareIntent(sharedContent)` is called
**Then** it returns the raw text and image URI (if available) extracted from the shared content
**And** the function returns `null` for any field it cannot extract (never throws)

**Given** shared content includes an image URI
**When** `extractTextFromImage(imageUri)` is called
**Then** it performs on-device OCR via expo-text-extractor (ML Kit on Android, Apple Vision on iOS)
**And** it returns the extracted text as a string
**And** it returns `null` if OCR produces no usable text (never throws)

**Given** both metadata text and OCR text are available
**When** `mergeExtractionSources(metadataText, ocrText)` is called
**Then** it returns a combined raw text string with both sources merged
**And** if only one source has text, it returns that source alone
**And** it returns `null` if both sources are null

**Given** the extraction functions are implemented
**When** unit tests run
**Then** `parseShareIntent` has tests with mock shared content (text-only, image-only, both, empty)
**And** `mergeExtractionSources` has tests covering all combination scenarios
**And** all tests pass via `npx jest`

### Story 2.3: Date/Time, Event Name & Venue Parsing with Pipeline Orchestration

As a user,
I want PostCal to automatically identify the event name, date, time, and venue from the extracted text,
So that the event details are ready for me to review without manual entry.

**Acceptance Criteria:**

**Given** merged raw text containing a natural language date/time (e.g., "Saturday March 28 at 10 PM")
**When** `parseDateTime(rawText)` is called
**Then** it returns a date string in ISO 8601 format (YYYY-MM-DD) and a time string in 24h format (HH:MM) via chrono-node
**And** it returns `null` for date and/or time if chrono-node cannot parse them

**Given** merged raw text containing event information
**When** `parseEventName(rawText)` is called
**Then** it returns the most likely event name using heuristic analysis (e.g., prominent text, title patterns)
**And** it returns `null` if no event name can be identified

**Given** merged raw text containing venue information
**When** `parseVenue(rawText)` is called
**Then** it returns the most likely venue/location using heuristic analysis (e.g., address patterns, "at" prepositions)
**And** it returns `null` if no venue can be identified

**Given** parsed results from all extraction stages
**When** `buildEventFields(parsedResults)` is called
**Then** it assembles an `ExtractionResult` object with `eventName`, `date`, `time`, `venue`, `rawText`, and `confidence` fields
**And** all fields use `null` for missing data (never empty strings)

**Given** shared content is received from the share sheet
**When** `runPipeline(sharedContent)` is called
**Then** it chains all 7 stages in order: parseShareIntent → extractTextFromImage → mergeExtractionSources → parseDateTime → parseEventName → parseVenue → buildEventFields
**And** partial failures in any stage do not block subsequent stages
**And** the pipeline returns whatever was successfully extracted
**And** ExtractionContext status transitions from `'extracting'` to `'ready'`

**Given** the parsing and pipeline functions are implemented
**When** unit tests run
**Then** `parseDateTime` has tests with diverse date formats (natural language, numeric, abbreviated months, relative dates)
**And** `parseEventName` has tests with sample Instagram captions and OCR text
**And** `parseVenue` has tests with address patterns and venue mentions
**And** `runPipeline` has integration tests covering full extraction, partial extraction, and total failure scenarios
**And** all tests pass via `npx jest`

## Epic 3: Event Review, Calendar Save & Confirmation

Users can review pre-populated event details, edit any field, save to their device calendar with one tap, and see a brief success confirmation.

### Story 3.1: Review Screen with Pre-Populated Event Form

As a user,
I want to see the extracted event details pre-populated in an editable form,
So that I can quickly verify the information and make corrections before saving.

**Acceptance Criteria:**

**Given** the extraction pipeline has completed with results in ExtractionContext
**When** the Review screen renders
**Then** the screen displays "Confirm Event Details" as the headline (Manrope Bold 24px)
**And** four editable TextFields are displayed in order: Event Name, Date, Time, Location
**And** each field is pre-populated with the corresponding value from ExtractionResult
**And** fields with `null` extraction values are displayed as empty (no placeholder text)

**Given** the extraction produced raw text
**When** the Review screen renders
**Then** an Extracted Text Preview component is displayed at the top of the form showing the raw source text
**And** the preview uses `surfaceContainerLow` background with `onSurfaceVariant` text at label size (Inter Regular 11px)
**And** the preview is static and non-interactive

**Given** no raw text was extracted (image-only share with no OCR result)
**When** the Review screen renders
**Then** the Extracted Text Preview component is hidden entirely

**Given** the Review screen is displayed
**When** the user taps any TextField
**Then** the field background shifts to `surfaceContainerLowest` (#ffffff) with a 2px ghost border in `primary` (#005bbf) at 40% opacity
**And** the appropriate keyboard opens
**And** the "Next" key advances to the next field in order (Name → Date → Time → Location)
**And** the "Done" key on the last field dismisses the keyboard
**And** tapping outside any field dismisses the keyboard
**And** a `KeyboardAvoidingView` wraps the form so no fields are obscured by the keyboard

**Given** all TextFields use Digital Concierge styling
**When** the fields are in their default (unfocused) state
**Then** each field has `surfaceContainerLow` (#f3f4f5) fill, no borders, `rounded-xl` corners
**And** labels appear above each field in Inter Semibold 12px `onSurfaceVariant`

**Given** a screen reader (VoiceOver/TalkBack) is active
**When** the user navigates the Review screen
**Then** reading order follows: extracted text preview → Event Name → Date → Time → Location → Save to Calendar → Cancel
**And** each TextField has an `accessibilityLabel` matching its visible label
**And** the screen title has `accessibilityRole="header"`

### Story 3.2: Calendar Permission & Event Save

As a user,
I want to save the event to my device calendar with a single tap,
So that the event appears in my calendar app without any extra steps.

**Acceptance Criteria:**

**Given** the Review screen is displayed with event fields
**When** the user views the bottom of the screen
**Then** a "Save to Calendar" primary CTA is displayed with gradient fill (`primary` #005bbf → `primaryContainer` #1a73e8 at 135° via expo-linear-gradient), white text, Manrope Bold, full-width, 48px minimum height
**And** a "Cancel" secondary CTA is displayed below it with `surfaceContainerHigh` fill, `onSurface` text, Manrope Bold, full-width, 48px minimum height
**And** both buttons and all form content are visible without scrolling on standard screen sizes (375pt+ width)

**Given** the user has never saved an event before (no calendar permission granted)
**When** the user taps "Save to Calendar"
**Then** the system calendar permission dialog is presented via expo-calendar
**And** if permission is granted, the event is saved immediately
**And** if permission is denied, the system permission dialog handles the denial (no custom error screen)

**Given** the user has previously granted calendar permission
**When** the user taps "Save to Calendar"
**Then** `lib/calendar/write-event.ts` converts the form data (extraction + user edits merged) into a `CalendarEvent` with `title`, `startDate`, `endDate` (default: startDate + 2 hours), and `location`
**And** the event is written to the device's default calendar via expo-calendar
**And** the calendar write completes in under 500ms (NFR4)
**And** ExtractionContext status transitions to `'saved'`
**And** the app navigates to the Success screen (replace transition — no back to Review)

**Given** the user has edited some fields on the Review screen
**When** the user taps "Save to Calendar"
**Then** the saved event uses `userEdits` merged over `extraction` values — user edits take precedence

**Given** some event fields are empty (null extraction, no user edit)
**When** the user taps "Save to Calendar"
**Then** the event is saved with whatever fields are populated — no required field validation, no blocking dialogs (FR12)

**Given** the user taps "Cancel"
**When** the Cancel action triggers
**Then** the Review screen is dismissed and the user returns to the previous app (Instagram) without saving (FR14)
**And** the system back gesture (swipe from edge on iOS, back button on Android) also acts as Cancel

### Story 3.3: Success Confirmation with Auto-Dismiss

As a user,
I want to see a brief confirmation that my event was saved,
So that I have confidence it's in my calendar and can return to what I was doing.

**Acceptance Criteria:**

**Given** an event has been successfully saved to the device calendar
**When** the Success screen renders
**Then** the screen displays "Saved to Calendar" as the headline (Manrope Bold 24px)
**And** an understated checkmark icon is displayed (not celebratory — proportional to the micro-task)
**And** the saved event name is displayed as confirmation text

**Given** the Success screen is displayed
**When** 2 seconds have elapsed
**Then** the screen auto-dismisses with a fade transition
**And** the user returns to the previous app context

**Given** the system reduced motion preference is enabled
**When** the Success screen auto-dismisses
**Then** the screen dismisses instantly without the fade animation (NFR13)

**Given** the auto-dismiss timer is active
**When** the user taps the "Done" primary CTA or taps the screen
**Then** the screen dismisses immediately without waiting for the timer

**Given** the "Done" button is displayed
**When** the user views it
**Then** it uses gradient fill styling (primary → primaryContainer at 135°), white text, Manrope Bold, full-width, 48px minimum height — consistent with all primary CTAs

**Given** a screen reader is active
**When** the Success screen renders
**Then** the confirmation text is announced via `accessibilityLiveRegion="polite"`
**And** the "Done" button has `accessibilityLabel="Done"` and `accessibilityRole="button"`

## Epic 4: Error Handling & Graceful Degradation

Users can still save events even when extraction fails — through manual entry fallback or retry — so PostCal is always useful regardless of OCR quality.

### Story 4.1: Extraction Failure Detection & Error Recovery

As a user,
I want to be able to save an event even when PostCal can't extract details from the shared post,
So that I'm never stuck — I can always enter the event manually or try again.

**Acceptance Criteria:**

**Given** the extraction pipeline (`runPipeline`) completes
**When** all extraction stages return `null` (no event name, no date, no time, no venue, no raw text)
**Then** ExtractionContext status transitions to `'error'`
**And** the app displays the error screen instead of the Review screen

**Given** the error screen is displayed
**When** the user views it
**Then** the screen displays "Couldn't extract event details" as the title (Manrope Bold 18px)
**And** the message uses a neutral, non-apologetic tone — no exclamation marks, no "sorry"
**And** an "Enter Manually" primary CTA is displayed with gradient fill (primary → primaryContainer at 135°), white text, full-width, 48px minimum height
**And** a "Try Again" secondary CTA is displayed below with `surfaceContainerHigh` fill, `onSurface` text, full-width, 48px minimum height

**Given** the user taps "Enter Manually"
**When** the Review screen loads
**Then** all four event fields (Name, Date, Time, Location) are empty
**And** the Extracted Text Preview is hidden (no raw text to show)
**And** the user can type into any field and save to calendar as normal (FR19)

**Given** the user taps "Try Again"
**When** the retry triggers
**Then** the extraction pipeline runs again on the same shared content
**And** if extraction succeeds this time, the Review screen displays with populated fields
**And** if extraction fails again, the error screen is redisplayed (FR20)

**Given** the user performs the system back gesture (swipe on iOS, back button on Android)
**When** the error screen is displayed
**Then** the screen is dismissed and the user returns to the previous app without saving

**Given** a screen reader is active
**When** the error screen renders
**Then** the title has `accessibilityRole="header"`
**And** the message text is announced to the screen reader
**And** "Enter Manually" and "Try Again" buttons have appropriate `accessibilityLabel` and `accessibilityRole="button"`
