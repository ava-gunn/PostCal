---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - _bmad-output/brainstorming/brainstorming-session-2026-03-19-1800.md
  - _bmad-output/planning-artifacts/research/technical-tesseractjs-ocr-research-2026-03-19.md
  - design/stitch/rnulib_modern/DESIGN.md
  - design/stitch/kinetic_utility/DESIGN.md
date: 2026-03-27
author: Ava
---

# Product Brief: PostCal

## Executive Summary

PostCal is a mobile app that eliminates the manual effort of saving Instagram events to your calendar. When users see an event post on Instagram, they share it to PostCal, which instantly extracts the event details — name, date, time, and location — using on-device OCR and text parsing. Users review the pre-populated fields, confirm, and the event is saved to their calendar in seconds.

PostCal is fully on-device, requires no account, no backend, and no API costs. It does one thing and does it well: turning Instagram event posts into calendar entries with minimal friction.

---

## Core Vision

### Problem Statement

When people discover events on Instagram — concerts, pop-ups, meetups, shows — there's no quick way to get those details into their calendar. The only option is to manually read the post, switch to a calendar app, and type in the event name, date, time, and venue by hand. This process is tedious, error-prone, and frequently abandoned altogether.

### Problem Impact

Events get forgotten. Details get entered wrong — wrong date, wrong time, wrong venue. Users resort to screenshots that pile up in their camera roll with no follow-through. The gap between discovering an event on Instagram and actually committing it to a calendar is where interest goes to die.

### Why Existing Solutions Fall Short

There is no direct solution for this specific workflow. Calendar apps don't integrate with Instagram. Instagram doesn't export event data to calendars. General-purpose OCR apps require multiple steps and manual field mapping. The problem persists because no one has built a purpose-built bridge between Instagram event discovery and calendar commitment.

### Proposed Solution

PostCal integrates into the iOS/Android share sheet. Users share an Instagram post image to PostCal, which uses on-device OCR (Google ML Kit on Android, Apple Vision on iOS) to extract text from the image. A local text parser (chrono-node + heuristics) identifies the event name, date, time, and location, and pre-populates an event form. The user reviews, edits if needed, and exports directly to their calendar.

The entire pipeline runs on-device. No network calls, no backend, no API keys, no account creation, no subscription.

### Key Differentiators

- **Single-purpose, zero-friction:** Built for exactly one workflow — Instagram event to calendar. No feature bloat.
- **Fully on-device:** All processing happens locally. No data leaves the phone. No privacy concerns, no API costs, no network dependency.
- **Free to run:** Zero ongoing infrastructure costs. No backend, no subscriptions, no usage-based pricing.
- **Share sheet integration:** Meets users exactly where they are — inside Instagram — with a single tap to initiate.

## Target Users

### Primary Users

**Primary Persona: The Solo Builder (Ava)**

Ava is a socially active person who follows local music venues and club event accounts on Instagram. Multiple times a week, she sees event posts — DJ sets, live shows, club nights — that she wants to attend. Today, she screenshots these posts or tries to remember the details, but the manual process of typing event names, dates, times, and venues into a calendar app means many events never make it there. Details get lost in a growing pile of screenshots.

**Motivations:**
- Never miss an event she's interested in
- Eliminate the friction of manual calendar entry
- Keep her social calendar organized without effort

**Current Pain:**
- Screenshots pile up with no follow-through
- Manual data entry is tedious enough to skip entirely
- Occasionally gets dates or times wrong when she does enter them

**Success Looks Like:**
- See an event on IG → share → confirm → done in under 10 seconds
- Calendar stays accurate and up to date with upcoming events

### Secondary Users

N/A — PostCal is a personal tool built for a single-user workflow. No admin, collaboration, or multi-user considerations.

### User Journey

1. **Discovery:** Scrolling Instagram, sees an event post from a venue or promoter
2. **Activation:** Taps share → selects PostCal from the share sheet
3. **Processing:** PostCal extracts event details from the image via on-device OCR
4. **Review:** Pre-populated event form appears — name, date, time, venue. Quick scan and edit if needed.
5. **Commitment:** Taps confirm → event saved to calendar
6. **Aha Moment:** Opens calendar later and sees all her upcoming events already there — no manual entry required
7. **Routine:** Becomes second nature — every interesting IG event post gets a quick share to PostCal

## Success Metrics

### User Success

- **Speed:** Share-to-saved flow completes in under 10 seconds — faster than manually typing event details into a calendar app
- **Accuracy:** OCR + parsing correctly extracts event name, date, time, and venue on the majority of Instagram event posts without manual correction
- **Adoption:** PostCal becomes the default reflex when seeing an interesting event on Instagram — share instead of screenshot

### Business Objectives

N/A — PostCal is a personal tool with no revenue model, user growth targets, or business KPIs.

### Key Performance Indicators

| KPI | Target | Measurement |
|-----|--------|-------------|
| End-to-end flow time | < 10 seconds | From share sheet tap to calendar save |
| Field accuracy rate | > 80% of posts need zero or minimal edits | Correct extraction of date, time, name, venue |
| OCR success rate | > 90% of images produce usable text | Text extracted vs. blank/garbage output |
| Parse success rate | > 70% of OCR text yields correct date/time | chrono-node correctly identifies event datetime |

## MVP Scope

### Core Features

1. **Share Sheet Integration:** Register as a share target on iOS/Android so users can share Instagram posts directly to PostCal
2. **Text & Metadata Extraction:** Analyze any text, captions, OG tags, and metadata Instagram passes through the share sheet before resorting to OCR
3. **On-Device OCR:** Extract text from the shared image using expo-text-extractor (ML Kit on Android, Apple Vision on iOS) to capture event details not available in metadata
4. **Smart Parsing:** Use chrono-node for date/time extraction and heuristics for event name and venue identification, merging results from both metadata and OCR sources
5. **Editable Event Form:** Present pre-populated event fields (name, date, time, venue) for user review and correction
6. **Calendar Export:** Save the confirmed event directly to the device's native calendar

**Extraction Priority:**
1. Share sheet text/metadata (structured, higher confidence)
2. OCR from image (fallback for visual-only details)
3. Merge both sources into a single event form

### Out of Scope for MVP

- Event history or dashboard screen
- Batch scanning / multiple events
- NLP.js or advanced entity recognition
- On-device LLM extraction
- Multi-language support
- Notifications or reminders
- Social or multi-user features
- Backend or cloud services of any kind
- Account creation or onboarding flow

### MVP Success Criteria

- The full share → extract → save flow works end-to-end
- Flow completes in under 10 seconds
- Metadata + OCR combined parsing correctly identifies event details on the majority of IG event posts
- The app feels like a natural extension of the Instagram share flow — minimal friction

### Future Vision

- **Phase 2:** NLP.js for improved location/entity recognition, bounding box analysis for smarter field identification
- **Phase 3:** On-device LLM (ExecuTorch / Apple Intelligence) for high-accuracy structured extraction with zero API calls
- Event history and dashboard
- Batch scanning support
- Support for other image sources beyond Instagram
