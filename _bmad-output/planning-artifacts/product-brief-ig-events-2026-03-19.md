---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ['brainstorming-session-2026-03-19-1800.md']
date: 2026-03-19
author: Ava
---

# Product Brief: PostCal

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

PostCal is a mobile app that eliminates the friction of manually saving Instagram event posts to your calendar. When users see an event post on Instagram, they tap share, select PostCal, and the app uses OCR to extract event details — date, time, venue, event name — from the post image and creates a calendar entry with notifications. No manual entry, no forgotten events.

---

## Core Vision

### Problem Statement

Instagram is one of the primary ways people discover local events — concerts, meetups, food pop-ups, art shows, fitness classes. But there's no seamless path from discovering an event in your feed to having it on your calendar with a reminder. The only options today are manual entry (tedious, error-prone) or saving the post (passive, easily forgotten).

### Problem Impact

The friction of manual calendar entry means users simply don't bother. Events they'd genuinely enjoy are discovered and then lost. Instagram's save feature creates a graveyard of forgotten posts — it lacks the active reminder system that a calendar provides. The real cost isn't inconvenience; it's missed experiences.

### Why Existing Solutions Fall Short

Instagram's native save/bookmark feature is passive — no notifications, no calendar integration, no structured event data. Manual calendar entry requires switching apps, squinting at stylized flyer graphics, and typing out details — enough friction that most users abandon the process entirely. There is no tool that bridges the gap from Instagram event post to calendar entry seamlessly.

### Proposed Solution

PostCal integrates with the system share sheet so users can share any Instagram event post directly to the app. OCR and AI extraction parse the post image — even stylized flyer graphics — to pull out event name, date, time, and venue. Users review the extracted details, confirm, and the event is exported to their preferred calendar app complete with notifications.

### Key Differentiators

- **Share sheet integration** — works within the natural Instagram browsing flow, no app-switching
- **OCR/AI extraction** — handles stylized event graphics and flyers, not just plain text
- **Calendar-native output** — events land in your actual calendar with notifications, not in another silo
- **Zero manual entry** — the entire path from discovery to calendar is frictionless

## Target Users

### Primary Users

**Persona: Urban Nightlife Discoverer**

- **Demographics:** 20s-30s, urban, active social life
- **Behavior:** Follows venues, DJs, promoters, and local scene accounts on Instagram. Discovers events through feed posts and stories — flyers, event graphics, lineup announcements
- **Problem experience:** Sees events they want to attend but the friction of manual calendar entry means they don't bother. Events are forgotten. Instagram saves pile up without reminders
- **Motivation:** Wants to actually show up to the things they discover. Needs calendar notifications to make it real
- **Success looks like:** See a flyer, tap share, done. Phone reminds them when it's time

### Secondary Users

N/A — PostCal is focused on a single user type with a single job to be done.

### User Journey

1. **Discovery:** User is scrolling Instagram, sees an event flyer posted by a venue or promoter
2. **Action:** Taps share on the post, selects PostCal from the share sheet
3. **Processing:** OCR/AI extracts event name, date, time, and venue from the flyer image
4. **High confidence path:** Event is saved directly to calendar with notifications — no confirmation needed
5. **Low confidence path:** Review screen surfaces extracted details for the user to verify and correct
6. **Success moment:** Phone notification fires the day of the event — they actually go
7. **Long-term:** PostCal becomes a reflex. See event, share, forget about it until the reminder hits

## Success Metrics

- **Personal utility:** PostCal saves meaningful time compared to manual calendar entry
- **OCR accuracy:** Extraction is reliable enough to trust on the high-confidence auto-save path
- **Event attendance:** Using PostCal leads to actually attending more discovered events
- **Adoption reflex:** Sharing to PostCal becomes the automatic response when seeing an event post

### Business Objectives

- Free app published on iOS and Android app stores
- No monetization goals — this is a personal utility tool
- Success is measured by personal usefulness, not growth or revenue

### Key Performance Indicators

N/A — this is a personal project. The KPI is: "Do I use it?"

## MVP Scope

### Core Features

- **Share sheet extension** — receive Instagram event posts via system share sheet on iOS and Android (React Native)
- **OCR/AI extraction** — parse event name, date, time, and venue from post images including stylized flyers
- **Confidence-based routing** — high confidence extractions skip review and go straight to calendar; low confidence surfaces a review/edit screen
- **Standard calendar export** — generate .ics (iCalendar) format for universal calendar compatibility
- **Home page** — instructions on how to use the app (share flow walkthrough)
- **History page** — list of previously saved events when opening the app directly

### Out of Scope for MVP

- Multi-image post support
- Instagram Stories/Reels extraction
- Social features (sharing events with friends)
- Location/map integration
- Multiple calendar account management

### MVP Success Criteria

- PostCal reliably extracts event details from typical nightlife flyers
- The share-to-calendar flow is faster and easier than manual entry
- .ics export works across major calendar apps (Apple Calendar, Google Calendar, Outlook)
- The app is published on both iOS and Android app stores

### Future Vision

- Expand source support: Stories, Reels, multi-image posts
- Location/map deep links for venues
- Social layer: share events with friends, group coordination
- Multi-calendar account management
- Broader platform support beyond Instagram (Facebook events, Twitter/X, etc.)
