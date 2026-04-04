---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
classification:
  projectType: mobile_app
  domain: general
  complexity: low
  projectContext: greenfield
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-PostCal-2026-03-27.md
  - _bmad-output/planning-artifacts/product-brief-ig-events-2026-03-19.md
  - _bmad-output/planning-artifacts/research/technical-tesseractjs-ocr-research-2026-03-19.md
  - _bmad-output/brainstorming/brainstorming-session-2026-03-19-1800.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
documentCounts:
  briefs: 2
  research: 1
  brainstorming: 1
  projectDocs: 0
  uxDesign: 1
workflowType: 'prd'
---

# Product Requirements Document - PostCal

**Author:** Ava
**Date:** 2026-03-27

## Executive Summary

PostCal is a mobile app that turns Instagram event posts into calendar entries through the system share sheet. Users share an event post from Instagram, PostCal extracts the event name, date, time, and venue using on-device OCR and text parsing, and presents a pre-populated form for quick confirmation. One tap saves it to the device calendar. The entire flow completes in under 10 seconds.

The app runs entirely on-device — no backend, no accounts, no API keys, no network dependency, no recurring costs. Built with React Native/Expo, it uses expo-text-extractor (ML Kit on Android, Apple Vision on iOS) for OCR and chrono-node for date/time parsing. The target user is someone who discovers events on Instagram multiple times a week but abandons manual calendar entry because the friction isn't worth the effort.

### What Makes This Special

PostCal exists because the gap between discovering an event on Instagram and committing it to a calendar is where interest dies. Manual entry is just painful enough that most people skip it — events get forgotten, screenshots pile up, and social calendars stay empty.

The core design conviction is that simplicity is the product. Every decision — fully on-device processing, no accounts, no backend, no cloud APIs — serves a single goal: make saving an event as effortless as scrolling past it. PostCal is not a feature-rich calendar tool. It is a single-purpose bridge that collapses a 60-second manual workflow into a 10-second confirmation.

### Project Classification

- **Project Type:** Mobile App (React Native/Expo, iOS + Android)
- **Domain:** Personal Utility
- **Complexity:** Low — no regulated data, no multi-user concerns, no backend infrastructure
- **Project Context:** Greenfield — new app, no existing codebase

## Success Criteria

### User Success

- **Speed:** The share-to-saved flow completes in under 10 seconds — faster than switching to a calendar app and typing one field
- **Accuracy:** >80% of Instagram event posts require zero or minimal edits (one field correction or less) after extraction
- **OCR reliability:** >90% of shared images produce usable text output (not blank or garbage)
- **Parse reliability:** >70% of OCR text yields a correct date/time via chrono-node
- **Adoption reflex:** PostCal becomes the default action when the user sees an interesting event post — share instead of screenshot

### Business Success

- **Personal utility:** Ava uses PostCal regularly as part of her own Instagram browsing routine
- **Public availability:** Published as a free app on both iOS App Store and Google Play Store
- **No monetization targets** — success is measured by personal usefulness and public availability, not revenue or growth

### Technical Success

- **Processing speed:** OCR extraction + text parsing completes fast enough that the review screen appears pre-populated with no perceptible loading state
- **On-device only:** Zero network calls required for the core flow — works fully offline
- **Zero running costs:** No backend, no API keys, no subscriptions, no usage-based pricing

### Measurable Outcomes

| Outcome | Target | How to Measure |
|---------|--------|----------------|
| End-to-end flow time | < 10 seconds | From share sheet tap to calendar save |
| Field accuracy | > 80% need zero/minimal edits | Posts where extraction is correct or needs only one field fix |
| OCR success rate | > 90% produce usable text | Images with extractable text vs. blank/garbage |
| Parse success rate | > 70% yield correct date/time | chrono-node correctly identifies event datetime |
| Processing latency | No perceptible delay | Review screen renders with fields populated, no spinner |

## User Journeys

### Journey 1: The Effortless Save (Primary — Happy Path)

**Persona:** Ava, late 20s, follows local music venues and DJ accounts on Instagram. Discovers events multiple times a week but rarely gets them into her calendar because manual entry is tedious enough to skip.

**Opening Scene:** It's Thursday evening. Ava is scrolling Instagram and sees a flyer from her favorite venue — a DJ set this Saturday at 10 PM. She's interested, but she knows from experience that if she doesn't capture it now, she'll forget by tomorrow. Her camera roll already has dozens of event screenshots she never followed up on.

**Rising Action:** She taps the share button on the Instagram post, selects PostCal from the share sheet. The app opens instantly — no splash screen, no loading spinner. By the time the screen appears, the fields are already populated: "DJ Night at Warehouse" / Saturday, March 28 / 10:00 PM / The Warehouse, 450 Main St.

**Climax:** Ava glances at the fields — everything looks right. She taps "Save to Calendar." Done. The whole interaction took about 5 seconds.

**Resolution:** She's back in Instagram, still in the flow of scrolling. On Saturday afternoon, her phone shows a calendar notification: "DJ Night at Warehouse — tonight at 10 PM." She goes. PostCal has become the reflex — every interesting event gets a quick share, and her social calendar fills itself.

**Capabilities Revealed:** Share sheet integration, metadata + OCR extraction pipeline, chrono-node date/time parsing, heuristic name/venue extraction, pre-populated editable form, native calendar write, success confirmation with auto-dismiss.

---

### Journey 2: The Messy Flyer (Primary — Edge Case / Error Recovery)

**Persona:** Same Ava, different post.

**Opening Scene:** Ava sees a post for a warehouse party. The flyer is heavily stylized — overlapping text, decorative fonts, date written as "SAT III.28" with the time buried in small print at the bottom. This is the kind of image that makes OCR sweat.

**Rising Action:** She shares to PostCal. The app opens, but this time the fields are sparse — Event Name shows "WAREHOUSE PARTY" (correct), Date is empty (chrono-node couldn't parse "III.28"), Time shows "10 PM" (caught the small print), Location is empty.

**Climax:** Ava sees the gaps. She taps the Date field, types "March 28", taps Location, types "TBD Warehouse" from memory. Two quick edits — still faster than manual entry from scratch.

**Resolution:** She taps "Save to Calendar." The event is saved with the details she provided. The flow took about 15 seconds — longer than the happy path, but still a fraction of full manual entry. PostCal degraded gracefully from "instant confirmation" to "quick assisted entry."

**Capabilities Revealed:** Graceful degradation when OCR/parsing is incomplete, empty fields with no blocking validation, editable form that accepts any input, partial extraction is still useful, no required fields — save with whatever you have.

---

### Journey 3: First Launch — Learning the Workflow (Secondary — Onboarding)

**Persona:** Ava has just installed PostCal from the App Store. She's never used it before.

**Opening Scene:** Ava taps the PostCal icon on her home screen. She's curious but doesn't know how the app works — she expected a camera or a feed, not instructions.

**Rising Action:** The Home screen loads with a clean header ("PostCal") and a "How it Works" section with three simple steps: 1) Share an event post from Instagram, 2) Review the extracted details, 3) Save to your calendar. Each step has a brief description and a visual cue. There's no sign-up, no tutorial wizard, no permissions dialog yet.

**Climax:** Ava reads the three steps and thinks "oh, it's a share sheet thing." She switches to Instagram, finds an event post she's interested in, and taps Share → PostCal for the first time. Journey 1 begins.

**Resolution:** The Home screen did its only job — answer "how do I use this?" in under 10 seconds. Ava never opens the app directly again; every future interaction starts from the Instagram share sheet.

**Capabilities Revealed:** Home screen with clear instructional content, no onboarding wizard or account creation, no permissions requested until first share (calendar permission prompted on first save), self-explanatory UI that requires zero learning curve.

---

### Journey Requirements Summary

| Capability | Journey 1 | Journey 2 | Journey 3 |
|------------|-----------|-----------|-----------|
| Share sheet registration (iOS + Android) | Required | Required | — |
| Metadata + OCR extraction pipeline | Required | Required | — |
| chrono-node date/time parsing | Required | Required (partial) | — |
| Heuristic name/venue extraction | Required | Required (partial) | — |
| Pre-populated editable form | Required | Required | — |
| Empty field handling (no validation) | — | Required | — |
| Native calendar write | Required | Required | — |
| Success confirmation + auto-dismiss | Required | Required | — |
| Home screen with instructions | — | — | Required |
| Calendar permission prompt (on first save) | Required | Required | — |
| Error state with manual entry fallback | — | Required | — |

## Mobile App Specific Requirements

### Project-Type Overview

PostCal is a cross-platform mobile app built with React Native/Expo, targeting iOS and Android. The app is fully on-device with no backend dependency. The primary entry point is the system share sheet (not the app icon), which makes share sheet integration the most critical platform requirement.

### Platform Requirements

- **Framework:** React Native with Expo (SDK 52+)
- **iOS:** iOS 16+ (minimum for Apple Vision OCR support)
- **Android:** Android API 24+ (minimum for ML Kit OCR support)
- **Build system:** EAS Build (development builds required — Expo Go not supported due to native OCR module)
- **No web target** — mobile only

### Device Permissions

| Permission | Purpose | When Requested |
|------------|---------|----------------|
| Calendar write | Save extracted events to device calendar | On first "Save to Calendar" tap |
| Share sheet registration | Receive shared content from Instagram | Automatic at install (no user prompt) |

No camera, photo library, location, notification, or network permissions required. PostCal requests the minimum possible permissions.

### Offline Mode

The entire app operates offline by default. There are no network calls, no sync operations, no cloud features. Offline is not a fallback — it is the only mode.

### Push Strategy

Not applicable. PostCal does not send push notifications. Calendar reminders are handled by the native calendar app after event export.

### Store Compliance

- **iOS App Store:** Standard submission. No in-app purchases, no subscriptions, no account creation, no third-party analytics, no tracking. App Privacy label: "Data Not Collected."
- **Google Play Store:** Standard submission. No special permissions beyond calendar write. Data Safety section: no data collected, no data shared.
- **Both platforms:** Free app, no ads, no monetization. Minimal review friction expected due to simple scope.

### Implementation Considerations

- **EAS Build required:** expo-text-extractor uses native modules (ML Kit / Apple Vision) that don't work in Expo Go. Development builds must be created via EAS Build for testing.
- **Share sheet platform differences:** iOS uses a Share Extension; Android uses an Intent Filter. Both need platform-specific configuration in app.json/app.config.js.
- **Calendar API differences:** iOS uses EventKit; Android uses the Calendar Content Provider. Expo's calendar module abstracts this, but permission flows differ per platform.
- **Font loading:** Manrope and Inter loaded via expo-font. Fallback to system fonts (SF Pro on iOS, Roboto on Android) if loading fails.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-solving MVP — deliver the core value proposition (share → extract → save) end-to-end with minimum surface area. Three screens, one workflow, no extras. The MVP proves that on-device extraction is useful enough to replace manual calendar entry.

**Resource Requirements:** Solo developer (Ava). React Native/Expo expertise, no backend team needed. EAS Build free tier sufficient for development and initial release.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Journey 1 (Happy Path): Full share → extract → confirm → save flow
- Journey 2 (Edge Case): Graceful degradation with manual entry fallback
- Journey 3 (First Launch): Home screen with usage instructions

**Must-Have Capabilities:**
1. Share sheet registration on iOS and Android
2. Share sheet text/metadata parsing (first extraction pass)
3. On-device OCR via expo-text-extractor (second extraction pass)
4. chrono-node date/time parsing + heuristic name/venue extraction
5. Pre-populated editable event form (name, date, time, venue)
6. Native calendar write via Expo Calendar API
7. Home screen with "How it Works" instructions
8. Success confirmation with auto-dismiss
9. Error state with "Enter Manually" fallback

### Phase 2: Growth

- NLP.js for improved location/entity recognition
- Bounding box analysis for smarter field identification from OCR positional data
- Event history and dashboard screen
- Batch scanning / multiple events from a single post
- Support for other image sources beyond Instagram

### Phase 3: Expansion

- On-device LLM extraction (ExecuTorch / Apple Intelligence) for high-accuracy structured extraction with zero API calls
- Multi-language support
- Stories/Reels extraction
- Location/map deep links for venues

### Risk Mitigation Strategy

**Technical Risks:**
- **OCR accuracy on stylized flyers** (medium likelihood, medium impact) — Mitigated by graceful degradation: partial extraction is still useful, and manual entry fallback ensures the user can always save the event. Real-world flyer testing during development will calibrate accuracy expectations.
- **expo-text-extractor abandonment** (low likelihood, high impact) — OCR layer is isolated and swappable. Fallback alternatives: react-native-mlkit-ocr, Infinite Red React Native MLKit.
- **chrono-node date format limitations** (low likelihood, low impact) — Extensible parser pipeline allows custom parsers for common flyer date patterns.

**Market Risks:**
- Minimal — this is a personal utility tool published for free. No revenue targets, no growth metrics to hit. The validation is "does Ava use it?"

**Resource Risks:**
- Solo developer means sequential execution. Mitigated by tight MVP scope (3 screens, 1 workflow) and Expo's rapid development cycle. No backend reduces operational burden to zero.

## Functional Requirements

### Share Sheet Integration

- **FR1:** User can share an Instagram post to PostCal via the system share sheet on iOS
- **FR2:** User can share an Instagram post to PostCal via the system share sheet on Android
- **FR3:** The system can receive and process shared content (text, metadata, and image URI) from the share sheet

### Content Extraction

- **FR4:** The system can parse text and metadata passed through the share sheet from Instagram
- **FR5:** The system can extract text from a shared image using on-device OCR
- **FR6:** The system can merge extraction results from share sheet metadata and OCR into a unified set of event fields
- **FR7:** The system can extract a date and time from raw text using natural language date parsing
- **FR8:** The system can extract an event name from raw text using heuristic analysis
- **FR9:** The system can extract a venue/location from raw text using heuristic analysis

### Event Review & Editing

- **FR10:** User can view pre-populated event fields (name, date, time, venue) after extraction
- **FR11:** User can edit any pre-populated event field before saving
- **FR12:** User can save an event with partially populated fields (no required fields)
- **FR13:** User can view the extracted source text as reference context alongside the event form
- **FR14:** User can cancel the event review and return to the previous app without saving

### Calendar Export

- **FR15:** User can save an event to the device's native calendar with a single tap
- **FR16:** The system can request calendar write permission from the user on first save
- **FR17:** The system can write an event (name, date, time, location) to the device calendar

### Error Handling & Recovery

- **FR18:** The system can detect when extraction produces no usable event data
- **FR19:** User can choose to enter event details manually when extraction fails
- **FR20:** User can retry the extraction when it fails

### Success Confirmation

- **FR21:** User can see a brief confirmation after successfully saving an event
- **FR22:** The success confirmation auto-dismisses after a short delay

### Home Screen

- **FR23:** User can view instructions explaining how to use PostCal's share sheet workflow
- **FR24:** User can access the Home screen by launching the app directly

## Non-Functional Requirements

### Performance

- **NFR1:** OCR extraction + text parsing completes in under 2 seconds on-device, so the review screen appears pre-populated with no visible loading state
- **NFR2:** The end-to-end flow from share sheet tap to calendar save completes in under 10 seconds including user review time
- **NFR3:** App launch from share sheet to rendered review screen takes under 1 second
- **NFR4:** Calendar write operation completes in under 500ms

### Security & Privacy

- **NFR5:** All processing occurs on-device — no data is transmitted to external servers
- **NFR6:** No user data is collected, stored, or tracked beyond the current extraction session
- **NFR7:** No third-party analytics, tracking SDKs, or telemetry are included in the app
- **NFR8:** Calendar permission is requested only when needed (first save), not at app launch

### Accessibility

- **NFR9:** All interactive elements meet WCAG 2.1 Level AA contrast ratios (minimum 4.5:1 for text, 3:1 for UI components)
- **NFR10:** All interactive elements have minimum 44x44px touch targets
- **NFR11:** All form fields and buttons have programmatic accessibility labels for screen readers (VoiceOver/TalkBack)
- **NFR12:** The app respects system font size preferences up to 1.5x without layout breakage
- **NFR13:** The app respects system reduced motion preferences (disabling animations when enabled)

### Integration

- **NFR14:** Share sheet registration works with Instagram's share flow on both iOS (Share Extension) and Android (Intent Filter)
- **NFR15:** Calendar export is compatible with the device's default calendar app on both iOS and Android
- **NFR16:** The app functions correctly on iOS 16+ and Android API 24+
