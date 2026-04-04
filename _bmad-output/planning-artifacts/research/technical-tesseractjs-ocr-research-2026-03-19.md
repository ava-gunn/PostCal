---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
workflowType: 'research'
lastStep: 1
research_type: 'technical'
research_topic: 'OCR using Tesseract.js for extracting event details from images'
research_goals: 'Evaluate Tesseract.js for extracting structured event data (name, date, time, location) from images in a React Native/Expo mobile app (PostCal)'
user_name: 'Ava'
date: '2026-03-19'
web_research_enabled: true
source_verification: true
---

# On-Device OCR for Event Extraction: Comprehensive Technical Research for PostCal

**Date:** 2026-03-19
**Author:** Ava
**Research Type:** Technical

---

## Executive Summary

This research evaluated OCR approaches for extracting event details (name, date, time, location) from images within PostCal, a React Native/Expo mobile app. The original hypothesis — using Tesseract.js — was ruled out due to fundamental incompatibility with the React Native runtime. The research identified a fully on-device solution requiring zero external APIs.

**Key Findings:**
- Tesseract.js cannot run in React Native (relies on browser/Node.js APIs); its RN wrapper is abandoned
- **expo-text-extractor** is the recommended OCR library — uses Google ML Kit on Android and Apple Vision on iOS, both on-device and free
- **chrono-node** handles natural language date/time extraction from OCR text entirely on-device
- Heuristic patterns extract event name and location from remaining OCR text
- On-device LLMs (ExecuTorch, Apple Intelligence) are an emerging future enhancement

**Recommended Stack:**
1. `expo-image-picker` — image capture/selection
2. `expo-text-extractor` — on-device OCR (ML Kit / Apple Vision)
3. `chrono-node` — date/time parsing from OCR text
4. Custom heuristics — event name and location extraction
5. **Total running cost: $0**

## Table of Contents

1. Technical Research Scope Confirmation
2. Technology Stack Analysis
3. Integration Patterns Analysis
4. Architectural Patterns and Design
5. Implementation Approaches and Technology Adoption
6. Research Synthesis and Recommendations

## Research Overview

This research began by evaluating Tesseract.js for OCR in PostCal, a React Native/Expo mobile calendar app. Through systematic analysis of compatibility, alternatives, architecture patterns, and implementation approaches, the research pivoted to an entirely on-device solution using platform-native OCR engines (Google ML Kit on Android, Apple Vision on iOS) paired with JavaScript-based text parsing libraries. All findings are verified against current (2025-2026) web sources with citations throughout.

---

## Technical Research Scope Confirmation

**Research Topic:** OCR using Tesseract.js for extracting event details from images
**Research Goals:** Evaluate Tesseract.js for extracting structured event data (name, date, time, location) from images in a React Native/Expo mobile app (PostCal)

**Technical Research Scope:**

- Architecture Analysis - design patterns, frameworks, system architecture
- Implementation Approaches - development methodologies, coding patterns
- Technology Stack - languages, frameworks, tools, platforms
- Integration Patterns - APIs, protocols, interoperability
- Performance Considerations - scalability, optimization, patterns

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2026-03-19

## Technology Stack Analysis

### Core OCR Technology: Tesseract.js

Tesseract.js (latest: v7.0.0) is a pure JavaScript port of the Tesseract OCR engine, compiled to WebAssembly. It supports 100+ languages, automatic text orientation and script detection, and provides bounding box data at paragraph, word, and character levels.

_Key Capabilities:_
- Runs in browser (webpack, ESM, CDN) and Node.js via WebAssembly
- No native dependencies — pure JS/WASM
- Returns structured text with confidence scores and positional data
- Open-source and cost-free

_Key Limitations:_
- **Does not support PDF files**
- Accuracy suffers with complex layouts, non-standard fonts, and low-quality images
- Performance is limited by client-side processing power
- No built-in structured data extraction (event name, date, time, location) — raw text only
- v7.0 removed deprecated APIs (worker.initialize, worker.loadLanguage)

_Source: [naptha/tesseract.js GitHub](https://github.com/naptha/tesseract.js/), [npm](https://www.npmjs.com/package/tesseract.js)_

### Critical Finding: React Native / Expo Compatibility

**Tesseract.js is not directly compatible with React Native or Expo managed workflows.**

Tesseract.js relies on browser APIs (DOM, Web Workers, WebAssembly in browser context) or Node.js APIs, neither of which are available in the React Native JavaScript runtime. The `react-native-tesseract-ocr` wrapper package is abandoned (last published 5+ years ago, v2.0.3).

_Viable Alternatives for Expo:_

| Library | Platform | Expo Compatible | Notes |
|---------|----------|-----------------|-------|
| **react-native-mlkit-ocr** | Android (ML Kit) + iOS (ML Kit) | Yes (dev build, not Expo Go) | Mature, on-device, no config plugin needed |
| **expo-text-extractor** | Android (ML Kit) + iOS (Apple Vision) | Yes (Expo SDK 52+) | Uses native platform OCR on each OS |
| **React Native MLKit (Infinite Red)** | Android + iOS | Yes (Expo SDK 52+, v3.0.0+) | Full MLKit wrapper, well-maintained |
| **expo-ocr** | iOS only (Apple Vision) | Yes | Uses VNRecognizeTextRequest natively |
| **rn-mlkit-ocr** | Android + iOS | Yes (dev build) | Selective model loading, multi-language |

All require **EAS Build** (development builds) — none work in Expo Go.

_Source: [agoldis/react-native-mlkit-ocr](https://github.com/agoldis/react-native-mlkit-ocr), [pchalupa/expo-text-extractor](https://github.com/pchalupa/expo-text-extractor), [Infinite Red React Native MLKit](https://docs.infinite.red/react-native-mlkit/), [barthap/expo-ocr](https://github.com/barthap/expo-ocr)_

### Cloud OCR Alternatives

| Service | Accuracy | Cost | Latency | Structured Output |
|---------|----------|------|---------|-------------------|
| **Google Cloud Vision** | Very high, even with complex fonts | Pay-per-use ($1.50/1K images) | Network-dependent | Text + bounding boxes |
| **AWS Textract** | Very high, document-focused | Pay-per-use | Network-dependent | Key-value pairs, tables |
| **Apple Vision (on-device)** | High for printed text | Free (on-device) | Fast (~ms) | Text + bounding boxes |
| **Google ML Kit (on-device)** | High for printed text | Free (on-device) | Fast (~ms) | Text blocks, lines, elements |
| **Tesseract.js** | Moderate | Free | Slow on mobile | Raw text + bounding boxes |

_Confidence: HIGH — multiple sources confirm cloud APIs outperform Tesseract on accuracy for complex layouts._

_Source: [Koncile: Tesseract in 2026](https://www.koncile.ai/en/ressources/is-tesseract-still-the-best-open-source-ocr), [Sparkco OCR Comparison](https://sparkco.ai/blog/comparing-ocr-apis-abbyy-tesseract-google-azure), [Google Cloud Vision vs Tesseract](https://stackshare.io/stackups/google-cloud-vision-api-vs-tesseract-ocr)_

### Structured Data Extraction (Post-OCR Processing)

Raw OCR output is unstructured text. Extracting event fields (name, date, time, location) requires a second processing stage:

_Approaches:_
- **Regex / Pattern Matching** — Match date formats (MM/DD, "March 19"), time patterns (7:00 PM), common location keywords. Fast but brittle.
- **Named Entity Recognition (NER)** — NLP models (spaCy, compromise.js) classify entities as DATE, TIME, LOCATION. More robust than regex.
- **LLM Post-Processing** — Send raw OCR text to an LLM (Claude, GPT) with a prompt to extract structured fields. Most accurate, handles diverse formats, but requires API call.
- **Hybrid** — Regex for dates/times + LLM fallback for ambiguous fields like event name and location.

_Stanford research confirms this two-stage pipeline (OCR → NLP extraction) is the established approach for event flyer parsing._

_Source: [Stanford Event Info Extraction](https://stacks.stanford.edu/file/druid:cg133bt2261/Zhang_Zhang_Li_Event_info_extraction_from_mobile_camera_images.pdf), [Medium: OCR + NLP](https://medium.com/@simsagues/document-information-extraction-using-ocr-and-nlp-2c3caa5a7720)_

### Technology Adoption Trends

_Modern OCR Landscape (2025-2026):_
- **Vision Language Models (VLMs)** like DeepSeek-OCR, PaddleOCR-VL, and OlmOCR-2 significantly outperform traditional Tesseract for complex layouts
- **On-device ML** (ML Kit, Apple Vision) is the dominant approach for mobile OCR — no network dependency, fast, free
- **Tesseract remains viable** for server-side batch processing and simple text extraction, but is losing ground on mobile
- **LLM-based extraction** is increasingly used as the post-OCR structuring step, replacing regex/NER pipelines

_Source: [IntuitionLabs: Modern OCR Engines](https://intuitionlabs.ai/articles/non-llm-ocr-technologies), [Modal: Open-Source OCR Comparison](https://modal.com/blog/8-top-open-source-ocr-models-compared)_

## Integration Patterns Analysis

### Image Capture → OCR Pipeline

The end-to-end integration for PostCal follows a three-stage pipeline:

```
[Image Capture] → [OCR Text Extraction] → [Structured Data Extraction]
     ↓                    ↓                         ↓
expo-image-picker    ML Kit / Vision         LLM API (Claude)
or expo-camera       (on-device)             or regex/NER
```

**Stage 1 — Image Capture:**
- `expo-image-picker` — select from gallery or take a photo via system UI. Returns a local URI.
- `expo-camera` — custom camera interface for live viewfinder experience.
- Both return a local file URI that can be passed directly to OCR libraries.

_Source: [Expo ImagePicker Docs](https://docs.expo.dev/versions/latest/sdk/imagepicker/), [Expo Camera Docs](https://docs.expo.dev/versions/latest/sdk/camera/)_

### OCR Library APIs (On-Device)

**react-native-mlkit-ocr:**
```javascript
import MlkitOcr from 'react-native-mlkit-ocr';

const result = await MlkitOcr.detectFromUri(imageUri);
// Returns: Array<{ text, bounding box, lines[] }>
```
- Simple promise-based API
- Returns text blocks with bounding boxes and line-level breakdown
- On-device — no network required
- Works on Android (ML Kit) and iOS (ML Kit)
- ⚠️ Release cadence has slowed — last version ~1 year ago

**expo-text-extractor:**
```javascript
import { extractTextFromImage } from 'expo-text-extractor';

const texts = await extractTextFromImage(imageUri, {
  languages: ['en-US'],
});
// Returns: string[]
```
- Uses Google ML Kit on Android, Apple Vision on iOS
- Supports multi-language recognition and language correction
- Has `isSupported` check for device capability
- Requires Expo SDK 52+

_Source: [react-native-mlkit-ocr GitHub](https://github.com/agoldis/react-native-mlkit-ocr), [expo-text-extractor GitHub](https://github.com/pchalupa/expo-text-extractor)_

### Structured Data Extraction via LLM

The most accurate approach for extracting event fields from raw OCR text is sending it to an LLM with structured output:

```javascript
// Pseudocode: OCR result → LLM structured extraction
const ocrText = result.map(block => block.text).join('\n');

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  messages: [{
    role: 'user',
    content: `Extract event details from this text as JSON:
      { "event_name", "date", "time", "location" }

      Text: ${ocrText}`
  }]
});
```

**Key findings on LLM extraction:**
- Claude achieves ~97% accuracy on structured text parsing, GPT ~98% — both excellent
- Claude offers the best consistency of JSON format output
- Both Anthropic and OpenAI support structured output schemas via their APIs
- Dedicated OCR engine for text recognition + LLM for interpretation is safer than LLM-only

_Confidence: HIGH — multiple benchmarks confirm this two-stage approach._

_Source: [Invofox: GPT-4o vs Claude Sonnet](https://www.invofox.com/en/post/document-parsing-using-gpt-4o-api-vs-claude-sonnet-3-5-api-vs-invofox-api-with-code-samples), [Nanonets: Best LLM APIs for Extraction](https://nanonets.com/blog/best-llm-apis-for-document-data-extraction/), [Koncile: Claude vs GPT vs Gemini](https://www.koncile.ai/en/ressources/claude-gpt-or-gemini-which-is-the-best-llm-for-invoice-extraction)_

### Alternative: Direct LLM Vision (Skip OCR)

Modern multimodal LLMs (Claude, GPT-4o) can accept images directly and extract text + structured data in one step — bypassing the OCR stage entirely:

```javascript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  messages: [{
    role: 'user',
    content: [
      { type: 'image', source: { type: 'base64', data: imageBase64 } },
      { type: 'text', text: 'Extract event details as JSON: { event_name, date, time, location }' }
    ]
  }]
});
```

_Trade-offs:_
- **Pro:** Single API call, handles complex layouts/fonts better, no on-device OCR dependency
- **Con:** Requires network, API cost per image, slower than on-device OCR
- **Hybrid option:** On-device OCR for quick preview, LLM vision for confirmation/fallback

### Data Flow and Protocol Summary

| Stage | Protocol | Data Format | Latency |
|-------|----------|-------------|---------|
| Image capture → OCR | Local file URI | Image (JPEG/PNG) | Instant |
| OCR → Text | In-process call | Array of text blocks | ~100-500ms (on-device) |
| Text → LLM extraction | HTTPS REST API | JSON request/response | ~1-3s (network) |
| Image → LLM vision | HTTPS REST API | Base64 image + JSON | ~2-5s (network) |

### Security Considerations

- **On-device OCR:** No data leaves the device — best for privacy
- **LLM API calls:** Event images/text sent to external API — consider privacy policy implications
- **API key management:** Store LLM API keys securely (not in client bundle) — use a backend proxy or Expo SecureStore for tokens
- **Image data:** Consider stripping EXIF metadata before sending to external APIs

_Source: [Simon Willison: Structured Extraction with LLMs](https://simonw.substack.com/p/structured-data-extraction-from-unstructured), [Cradl AI: LLMs for OCR](https://www.cradl.ai/posts/llm-ocr)_

## Architectural Patterns and Design

### Recommended Architecture: Edge-Cloud Hybrid

The optimal architecture for PostCal's OCR feature combines on-device processing with cloud LLM extraction — an **edge-cloud hybrid** pattern:

```
┌─────────────────────────────────────────────────┐
│  MOBILE DEVICE (Offline-Capable)                │
│                                                 │
│  ┌─────────┐    ┌──────────┐    ┌───────────┐  │
│  │ Camera / │───▶│ On-Device│───▶│ Local     │  │
│  │ Gallery  │    │ OCR      │    │ Preview   │  │
│  └─────────┘    │ (ML Kit) │    │ (raw text)│  │
│                 └──────────┘    └─────┬─────┘  │
│                                       │        │
│  ┌────────────────────────────────────▼─────┐  │
│  │ Queue (offline-safe)                     │  │
│  │ Stores: image URI + raw OCR text         │  │
│  └────────────────────────────────────┬─────┘  │
└───────────────────────────────────────┼────────┘
                                        │ HTTPS
┌───────────────────────────────────────▼────────┐
│  CLOUD / BACKEND PROXY                         │
│                                                │
│  ┌──────────────┐    ┌─────────────────────┐   │
│  │ Backend API  │───▶│ LLM API (Claude)    │   │
│  │ (proxy +     │    │ Structured output:  │   │
│  │  auth)       │    │ {name, date, time,  │   │
│  └──────────────┘    │  location}          │   │
│                      └─────────────────────┘   │
└────────────────────────────────────────────────┘
```

**Why hybrid over pure on-device or pure cloud:**
- On-device OCR provides instant feedback and works offline
- LLM extraction handles the hard part (understanding diverse flyer layouts) with high accuracy
- Backend proxy keeps API keys secure and allows rate limiting
- Queue pattern ensures no data loss if network is unavailable

_Confidence: HIGH — this pattern aligns with industry best practices for mobile ML pipelines._

_Source: [Pixno: OCR Technology 2026](https://photes.io/blog/posts/ocr-research-trend), [Designveloper: Top OCR Libraries 2025](https://www.designveloper.com/blog/mobile-ocr-libraries/), [InfoQ: AI Document Processing](https://www.infoq.com/articles/ocr-ai-document-processing/)_

### Design Principles

**Separation of Concerns:**
- **OCR layer** — isolated module, swappable between ML Kit, expo-text-extractor, or future alternatives
- **Extraction layer** — isolated LLM prompt + schema, testable independently with mock OCR output
- **UI layer** — displays results, handles user corrections, decoupled from processing logic

**Offline-First Design:**
- On-device OCR works without network — user sees raw text immediately
- Structured extraction queued when offline, processed when connectivity returns
- Local storage (SQLite/WatermelonDB) persists OCR results and extraction queue
- Sync queue ensures operations are processed in order with retry logic

_Source: [OneUptime: RN Offline Architecture](https://oneuptime.com/blog/post/2026-01-15-react-native-offline-architecture/view), [DEV: Offline-First RN](https://dev.to/medaimane/offline-first-development-in-react-native-creating-robust-apps-1jb)_

### Three Candidate Architectures Compared

| Pattern | Description | Pros | Cons | Best For |
|---------|-------------|------|------|----------|
| **A: On-device OCR + LLM API** | ML Kit extracts text, Claude API structures it | Instant OCR preview, high extraction accuracy | Requires network for structuring | PostCal primary flow |
| **B: Direct LLM Vision** | Send image directly to Claude vision API | Simplest code, best accuracy on complex layouts | Always requires network, higher cost/latency | Fallback for OCR failures |
| **C: Pure on-device** | ML Kit OCR + local regex/NER parsing | Fully offline, no API cost | Low accuracy on diverse formats, brittle parsing | Offline-only fallback |

**Recommended: Architecture A as primary, with B as fallback for low-confidence OCR results.**

### Structured Output with Claude API

Claude supports enforced structured output via tool use or the `output_format` parameter with JSON schema:

```javascript
// Using Claude's structured output
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: ocrText }],
  tools: [{
    name: 'extract_event',
    description: 'Extract event details from OCR text',
    input_schema: {
      type: 'object',
      properties: {
        event_name: { type: 'string' },
        date: { type: 'string', description: 'ISO 8601 date' },
        start_time: { type: 'string', description: 'HH:MM format' },
        end_time: { type: 'string', description: 'HH:MM format or null' },
        location: { type: 'string' },
        confidence: { type: 'number', description: '0-1 confidence score' }
      },
      required: ['event_name', 'date', 'start_time', 'location', 'confidence']
    }
  }],
  tool_choice: { type: 'tool', name: 'extract_event' }
});
```

This ensures type-safe, validated JSON output every time — no parsing failures.

_Source: [Claude API: Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs), [Agenta: Guide to Structured Outputs](https://agenta.ai/blog/the-guide-to-structured-outputs-and-function-calling-with-llms)_

### Security Architecture

- **API key isolation:** Never bundle LLM API keys in the mobile app. Route all LLM calls through a backend proxy that holds the key server-side.
- **Image privacy:** On-device OCR means images don't leave the device. Only extracted text (not images) needs to be sent to the LLM API in Architecture A.
- **Data minimization:** Strip EXIF metadata before any external transmission. Only send the OCR text string, not the full image, when possible.
- **Rate limiting:** Backend proxy enforces per-user rate limits to prevent abuse and cost overruns.

### Scalability Considerations

- **On-device OCR:** Scales infinitely — processing happens on each user's device
- **LLM API calls:** Main scaling bottleneck. Mitigate with:
  - Caching identical/similar extraction results
  - Using lighter models (Haiku) for simple/high-confidence OCR text
  - Batching multiple extractions where possible
  - Setting per-user quotas
- **Cost projection:** At ~$0.003 per Haiku extraction call, 1000 daily scans ≈ $3/day

## Implementation Approaches and Technology Adoption

### Decision: expo-text-extractor as Primary OCR Library

Based on research, **expo-text-extractor** is the recommended library for PostCal:

| Criteria | expo-text-extractor | react-native-mlkit-ocr | Infinite Red MLKit |
|----------|--------------------|-----------------------|-------------------|
| Expo SDK 52+ | Yes | Yes | Yes (v3.0.0+) |
| Uses ML Kit (Android) | Yes | Yes | Yes |
| Uses Apple Vision (iOS) | Yes | No (ML Kit on both) | Partial |
| Config plugin needed | No | No | Yes |
| Maintained | Active | Slowed (~1yr since release) | Active |
| API simplicity | `extractTextFromImage(uri)` | `detectFromUri(uri)` | More complex |

**Why expo-text-extractor:** Uses the best native OCR engine on each platform (ML Kit on Android, Apple Vision on iOS), active maintenance, simple API, and Expo SDK 52+ native support.

_Source: [expo-text-extractor GitHub](https://github.com/pchalupa/expo-text-extractor), [expo-text-extractor README](https://github.com/pchalupa/expo-text-extractor/blob/main/README.md)_

### Development Workflow

**Setup Steps:**
1. Install: `npx expo install expo-text-extractor`
2. Create development build (required — won't work in Expo Go):
   ```bash
   eas build --platform android --profile development
   eas build --platform ios --profile development
   ```
3. Use development client for testing instead of Expo Go
4. Production builds via EAS Build when ready to ship

**EAS Build Costs:**
- Free tier includes limited low-priority builds (resets monthly)
- Paid plans offer priority builds, more concurrencies, higher timeouts
- For a solo dev / small team, the free tier is sufficient for getting started

_Source: [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/), [Expo Pricing](https://expo.dev/pricing)_

### On-Device Structured Extraction (No External APIs)

All data extraction happens on-device using JavaScript libraries:

**Date/Time Extraction — chrono-node:**
```javascript
import * as chrono from 'chrono-node';

const ocrText = "Spring Fest\nMarch 25, 2026 at 7:00 PM\nCentral Park Amphitheater";
const parsed = chrono.parse(ocrText);
// → [{ start: { date: 2026-03-25T19:00:00 }, text: "March 25, 2026 at 7:00 PM" }]
```
- Handles natural language dates: "this Friday", "Sep 12-13", "7pm - 10pm"
- Extracts start and end times when present
- Pure JS — works in React Native, no native module needed
- Well-maintained, widely used (13M+ weekly npm downloads)

**Location Extraction — Heuristics:**
- Lines containing address patterns (numbers + street names, city/state/zip)
- Text following keywords: "at", "where", "location", "venue", "@"
- Lines after date/time that aren't the event name

**Event Name Extraction — Heuristics:**
- Typically the most prominent/first text block from OCR
- Exclude lines identified as date, time, or location
- Largest text block by bounding box area (if OCR returns positional data)

**NLP.js (Optional Enhancement):**
- `node-nlp-rn` — React Native compatible, on-device NER
- Can be trained with custom entity patterns for location recognition
- Adds robustness beyond pure regex/heuristics

_Source: [chrono-node GitHub](https://github.com/wanasit/chrono), [chrono-node npm](https://www.npmjs.com/package/chrono-node), [NLP.js GitHub](https://github.com/axa-group/nlp.js/), [node-nlp-rn npm](https://www.npmjs.com/package/node-nlp-rn)_

### Future: On-Device LLM (Emerging)

For future consideration when the ecosystem matures:
- **react-native-executorch** — Meta's on-device inference engine (powers IG/FB)
- **Apple Intelligence** (~3B param model) — iOS 26+, via `@react-native-ai/apple`
- **expo-llm-mediapipe** — Google MediaPipe LLM on-device
- Would enable LLM-quality structured extraction with zero API calls

_Source: [Expo: AI Models with ExecuTorch](https://expo.dev/blog/how-to-run-ai-models-with-react-native-executorch), [Callstack: Apple On-Device LLM](https://www.callstack.com/blog/on-device-apple-llm-support-comes-to-react-native), [expo-llm-mediapipe GitHub](https://github.com/tirthajyoti-ghosh/expo-llm-mediapipe)_

### Implementation Roadmap

**Phase 1: OCR + Manual Event Creation (MVP)**
1. Integrate `expo-image-picker` for image capture/selection
2. Add `expo-text-extractor` for on-device OCR
3. Display raw extracted text to user
4. User manually creates event from OCR text
5. **Fully offline, no backend**

**Phase 2: Auto-Extraction with chrono-node**
1. Add `chrono-node` for date/time parsing from OCR text
2. Add heuristic extraction for event name and location
3. Auto-populate event fields — user reviews and confirms/edits
4. **Still fully offline, no backend**

**Phase 3: Enhanced Extraction**
1. Add `node-nlp-rn` for improved location/entity recognition
2. Use OCR bounding box data for smarter field identification
3. History of scanned events
4. Batch scanning support
5. Future: on-device LLM when ecosystem stabilizes

### Testing Strategy

**Unit Tests:**
- Mock `expo-text-extractor` native module in Jest
- Test chrono-node parsing with diverse date/time formats
- Test heuristic extraction with sample OCR output strings
- Test event field parsing, validation, and edge cases

**Integration Tests:**
- Use Detox for E2E testing on real devices/emulators
- Test full flow: image → OCR → extraction → event creation
- Test with diverse flyer formats and layouts

**Test Data:**
- Curate a set of sample event flyer images with known expected outputs
- Include edge cases: multiple events per image, decorative fonts, partial information, different date formats, non-English text

### Cost Analysis

| Component | Cost | Notes |
|-----------|------|-------|
| expo-text-extractor | Free | Open source, on-device |
| Google ML Kit (Android) | Free | On-device, bundled with app |
| Apple Vision (iOS) | Free | On-device, system framework |
| chrono-node | Free | Open source, pure JS |
| node-nlp-rn (optional) | Free | Open source |
| EAS Build (free tier) | $0 | Limited builds/month, low priority |

**Total running cost: $0** — everything runs on-device with no API dependencies.

_Source: [Expo Pricing](https://expo.dev/pricing)_

### Risk Assessment and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| expo-text-extractor abandoned | Low | High | Fallback to react-native-mlkit-ocr or Infinite Red MLKit; OCR layer is isolated |
| Heuristic extraction accuracy too low | Medium | Medium | User always reviews/edits; improve heuristics with real-world data; add NLP.js in Phase 3 |
| chrono-node can't parse non-standard date formats | Low | Low | Extensible parser pipeline; add custom parsers for common flyer patterns |
| OCR accuracy low on decorated/stylized flyers | Medium | Medium | User can manually enter fields; image preprocessing (contrast, crop) can help |
| Expo Go incompatibility frustrates dev workflow | Low | Low | Dev builds are standard practice; document setup clearly |

## Research Synthesis and Recommendations

### Strategic Recommendations

1. **Use expo-text-extractor as the OCR layer** — leverages best-in-class native engines on each platform (ML Kit on Android, Apple Vision on iOS). On-device, free, and Expo SDK 52+ compatible.

2. **Use chrono-node + heuristics for structured extraction** — parses dates/times from natural language OCR text. Combined with simple heuristics for event name and location, this provides a fully offline extraction pipeline with zero API costs.

3. **Always let users review and edit** — on-device extraction won't be perfect. The UX should present auto-populated fields as suggestions that users confirm or correct.

4. **Isolate the OCR and extraction layers** — keep them as swappable modules so the OCR library or extraction strategy can be upgraded independently (e.g., to on-device LLM in the future).

5. **Plan for on-device LLM as a Phase 3 enhancement** — react-native-executorch and Apple Intelligence are maturing rapidly and will enable LLM-quality extraction without any external API.

### Architecture Decision: Fully On-Device

```
┌─────────────────────────────────────────────────────┐
│  MOBILE DEVICE (Fully Offline)                      │
│                                                     │
│  ┌──────────┐    ┌──────────────┐    ┌───────────┐  │
│  │ Camera / │───▶│ expo-text-   │───▶│ chrono-   │  │
│  │ Gallery  │    │ extractor    │    │ node +    │  │
│  │ (expo-   │    │ (ML Kit /    │    │ heuristics│  │
│  │  image-  │    │  Apple       │    │           │  │
│  │  picker) │    │  Vision)     │    └─────┬─────┘  │
│  └──────────┘    └──────────────┘          │        │
│                                            ▼        │
│                                    ┌──────────────┐ │
│                                    │ Event Form   │ │
│                                    │ (user review │ │
│                                    │  & confirm)  │ │
│                                    └──────────────┘ │
└─────────────────────────────────────────────────────┘
```

**No backend. No API keys. No network dependency. No running costs.**

### Implementation Priority

| Phase | Scope | Key Deliverables |
|-------|-------|-----------------|
| **Phase 1** | OCR + manual event creation | expo-image-picker, expo-text-extractor, display raw text |
| **Phase 2** | Auto-extraction | chrono-node for dates/times, heuristics for name/location, auto-populated form |
| **Phase 3** | Enhanced extraction | NLP.js for better entity recognition, bounding box analysis, on-device LLM when ready |

### Source Documentation

All technical claims in this document are verified against current (2025-2026) sources. Key references:

- [expo-text-extractor GitHub](https://github.com/pchalupa/expo-text-extractor)
- [naptha/tesseract.js GitHub](https://github.com/naptha/tesseract.js/)
- [chrono-node GitHub](https://github.com/wanasit/chrono)
- [NLP.js GitHub](https://github.com/axa-group/nlp.js/)
- [react-native-executorch GitHub](https://github.com/software-mansion/react-native-executorch)
- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Expo Pricing](https://expo.dev/pricing)
- [Claude API: Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) (reference only — not used in final architecture)
- [Koncile: Tesseract in 2026](https://www.koncile.ai/en/ressources/is-tesseract-still-the-best-open-source-ocr)
- [Stanford: Event Info Extraction from Flyers](https://stacks.stanford.edu/file/druid:cg133bt2261/Zhang_Zhang_Li_Event_info_extraction_from_mobile_camera_images.pdf)
- [Expo: AI Models with ExecuTorch](https://expo.dev/blog/how-to-run-ai-models-with-react-native-executorch)
- [Callstack: Apple On-Device LLM](https://www.callstack.com/blog/on-device-apple-llm-support-comes-to-react-native)
- [Atomic Robot: On-Device OCR with ML Kit](https://atomicrobot.com/blog/mlkit-on-device-ocr-android/)

---

**Technical Research Completion Date:** 2026-03-19
**Source Verification:** All technical facts cited with current sources
**Confidence Level:** High — based on multiple authoritative technical sources
