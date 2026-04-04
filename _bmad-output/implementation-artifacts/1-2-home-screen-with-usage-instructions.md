# Story 1.2: Home Screen with Usage Instructions

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see clear instructions when I open PostCal directly,
so that I understand how to use the share sheet workflow to save Instagram events to my calendar.

## Acceptance Criteria

1. **Given** the user taps the PostCal app icon
   **When** the Home screen loads
   **Then** the screen displays "PostCal" as the display title in Manrope ExtraBold at 36px
   **And** a "How it Works" section is visible with three instruction cards
   **And** the three steps are: (1) Share an event post from Instagram, (2) Review the extracted details, (3) Save to your calendar
   **And** instruction cards reference Instagram specifically

2. **Given** the Home screen is rendered
   **When** the user views the layout
   **Then** the screen uses `surface` (#f8f9fa) as the background color
   **And** instruction cards use `surfaceContainerLowest` (#ffffff) with tonal lift on `surface` background
   **And** all spacing follows the 4px grid scale with 24px horizontal padding
   **And** the layout adapts to screen sizes: small phones (320-374pt) reduce spacing by one tier, standard (375-413pt) use default, large (414pt+) maintain standard with breathing room

3. **Given** a screen reader (VoiceOver/TalkBack) is active
   **When** the user navigates the Home screen
   **Then** the "PostCal" title has `accessibilityRole="header"`
   **And** each instruction card has a descriptive `accessibilityLabel`
   **And** reading order follows the visual top-to-bottom layout

## Tasks / Subtasks

- [x] Task 1: Build Home screen layout with display title (AC: #1, #2)
  - [x] Replace placeholder `app/index.tsx` with full Home screen implementation
  - [x] Add "PostCal" display title using `Text` with `display` typography preset (Manrope ExtraBold 36px)
  - [x] Add asymmetric top margin (2xl/48px top, lg/24px bottom) per Digital Concierge editorial spacing
  - [x] Set screen horizontal padding to lg (24px)
  - [x] Use `SafeAreaView` wrapping with `surface` background

- [x] Task 2: Create "How it Works" instruction cards section (AC: #1, #2)
  - [x] Add "How it Works" section header using `Text` with `title` typography preset (Manrope Bold 18px)
  - [x] Create three instruction cards using RNUILib `Card` component
  - [x] Card 1: step number "1", title "Share from Instagram", description "Tap share on any event post, then select PostCal"
  - [x] Card 2: step number "2", title "Review Details", description "Check the extracted event name, date, time, and venue"
  - [x] Card 3: step number "3", title "Save to Calendar", description "One tap saves the event to your device calendar"
  - [x] Style cards with `surfaceContainerLowest` (#ffffff) background on `surface` (#f8f9fa) screen background for tonal lift
  - [x] Card corner radius: `rounded-xl` (12px) per Digital Concierge spec
  - [x] Card spacing: `md` (16px) between cards
  - [x] Step number displayed in `primary` (#005bbf) color using `headline` preset
  - [x] Card title in `title` preset (Manrope Bold 18px), `onSurface` color
  - [x] Card description in `body` preset (Inter Medium 14px), `onSurfaceVariant` color

- [x] Task 3: Implement responsive spacing (AC: #2)
  - [x] Use `useWindowDimensions` to detect screen width
  - [x] Small phones (width < 375): reduce spacing by one tier (lg→md for horizontal padding, xl→lg for section spacing)
  - [x] Standard phones (375-413): default spacing values
  - [x] Large phones (414+): maintain standard with no expansion beyond max content width
  - [x] Ensure all content fits without scrolling on standard screen sizes

- [x] Task 4: Add accessibility props (AC: #3)
  - [x] Add `accessibilityRole="header"` to "PostCal" title
  - [x] Add descriptive `accessibilityLabel` to each instruction card (e.g., "Step 1: Share from Instagram. Tap share on any event post, then select PostCal.")
  - [x] Verify reading order matches visual top-to-bottom layout (title → section header → card 1 → card 2 → card 3)

- [x] Task 5: Verify build and visual correctness (AC: #1, #2, #3)
  - [x] Run `npx expo lint` — no errors
  - [x] Run `npx expo export` — app builds without errors
  - [x] Verify Home screen renders with correct typography, colors, and spacing
  - [x] Verify instruction cards display with tonal lift against surface background

## Dev Notes

### Architecture Compliance

**Module Boundary Rules (CRITICAL):**
- `app/index.tsx` is a screen file — may import from `theme/` for token values
- Use RNUILib components exclusively (`View`, `Text`, `Card`)
- All colors from theme tokens via `colorTokens` export from `theme/digital-concierge.ts`
- All spacing from `spacing` export from `theme/digital-concierge.ts`
- All typography via RNUILib typography presets registered by `configureTheme()` (use `display`, `title`, `headline`, `body` props on `Text`)

**UI Component Rules:**
- Use `View`, `Text`, `Card` from `react-native-ui-lib`
- Use `SafeAreaView` from `react-native-safe-area-context` (this is NOT a raw RN import — it's the standard safe area library)
- NEVER import from `react-native` for UI components
- No 1px borders — use tonal surface shifts for card separation
- No shadows with pure black — if any card elevation is used, use `onSurface` at 6% opacity

### Existing Code to Build On

**Theme system (from Story 1.1):**
- `theme/digital-concierge.ts` exports: `colorTokens`, `spacing`, `radii`, `configureTheme()`
- `theme/typography.ts` exports: `fonts`, `typeScale`
- Typography presets registered with RNUILib: `display`, `headline`, `title`, `body`, `label`, `caption`
- ThemeManager configures default `Text` color to `onSurface` and default `View` backgroundColor to `surface`

**Root layout (from Story 1.1):**
- `app/_layout.tsx` handles font loading, splash screen, theme initialization, ExtractionProvider
- Fonts: Manrope-Bold, Manrope-ExtraBold, Inter-Regular, Inter-Medium, Inter-SemiBold (via @expo-google-fonts)
- Stack navigator with `headerShown: false` — each screen manages its own header/title

**Current placeholder to replace:**
```typescript
// app/index.tsx — REPLACE THIS ENTIRELY
import { View, Text } from 'react-native-ui-lib';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View flex center>
        <Text text40>PostCal</Text>
      </View>
    </SafeAreaView>
  );
}
```

### Digital Concierge Visual Rules for This Screen

**Layout (from UX spec + mockup):**
- Screen background: `surface` (#f8f9fa) — inherited from View theme default
- Title: "PostCal" in `display` preset (Manrope ExtraBold 36px, letterSpacing -0.72)
- Asymmetric title margins: 48px top, 24px bottom (editorial rhythm)
- "How it Works" section header in `title` preset
- Three instruction cards vertically stacked with 16px gaps
- Cards: `surfaceContainerLowest` (#ffffff) background, `rounded-xl` (12px) corners
- Screen horizontal padding: 24px (lg)

**Card internal layout:**
- Each card shows: step number (large, in primary blue), title, description
- Step number: use `headline` preset in `primary` color
- Title: `title` preset in `onSurface` color
- Description: `body` preset in `onSurfaceVariant` color
- Internal card padding: `md` (16px)

**What to OMIT (removed for MVP, visible in mockup but NOT to implement):**
- "Recently Imported" event list
- "Sync New Post" FAB button
- Bottom navigation bar
- Notifications bell icon
- "Pro Tips" link
- "View All" link
- Any event cards or history

### Typography Reference (Quick Access)

| Preset | Font | Size | Letter Spacing | Usage on Home |
|--------|------|------|----------------|---------------|
| `display` | Manrope ExtraBold | 36px | -0.72 | "PostCal" title |
| `title` | Manrope Bold | 18px | -0.36 | "How it Works" header, card titles |
| `body` | Inter Medium | 14px | 0.14 | Card descriptions |

### Spacing Reference (Quick Access)

| Token | Value | Usage on Home |
|-------|-------|---------------|
| `md` | 16px | Between cards, card internal padding |
| `lg` | 24px | Screen horizontal padding, title bottom margin |
| `xl` | 32px | Between "How it Works" header and first card |
| `2xl` | 48px | Title top margin |

### Responsive Behavior

- Use `useWindowDimensions()` from `react-native` (this is a hook, not a UI component — allowed import)
- Create a simple `getResponsiveSpacing(width)` helper inline or at top of file
- Small (< 375pt): `horizontalPadding = spacing.md (16)`, section gaps reduced by one tier
- Standard (375-413pt): default values from spacing scale
- Large (414pt+): same as standard, no expansion

### Anti-Patterns to Avoid

- Do NOT hardcode any hex colors — use `colorTokens.xxx`
- Do NOT hardcode font sizes — use typography presets on `Text` component (e.g., `<Text display>`)
- Do NOT use `StyleSheet.create` with hardcoded pixel values for spacing — use `spacing.xxx`
- Do NOT add any interactive elements (no buttons, no navigation actions)
- Do NOT add any placeholder content for future features (no "Coming Soon", no empty lists)
- Do NOT use `ScrollView` unless content genuinely overflows — this screen should fit without scrolling

### Project Structure Notes

- Only file modified: `app/index.tsx`
- No new files created in this story
- No new dependencies needed

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1, Story 1.2 Acceptance Criteria]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Home Screen, Design System, Component Strategy, Responsive Design]
- [Source: _bmad-output/planning-artifacts/architecture.md — Project Structure, Naming Patterns, Component Rules]
- [Source: design/stitch/home_dashboard/screen.png — Visual reference (adapt for MVP)]
- [Source: _bmad-output/implementation-artifacts/1-1-project-cleanup-and-digital-concierge-theme-setup.md — Previous story context, theme system established]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created
- Replaced placeholder Home screen with full Digital Concierge branded layout
- "PostCal" display title with Manrope ExtraBold 36px and asymmetric editorial margins
- Three "How it Works" instruction cards using RNUILib Card component with tonal lift (surfaceContainerLowest on surface)
- Cards reference Instagram specifically in step 1 description
- Responsive spacing via useWindowDimensions: small phones reduce spacing by one tier
- Full accessibility: header role on title, descriptive labels on each card
- All typography via registered RNUILib presets (display, title, headline, body)
- All colors from colorTokens, all spacing from spacing exports — zero hardcoded values
- ESLint clean, TypeScript clean, expo export succeeds with 3 routes

### Change Log

- 2026-03-31: Story 1.2 complete — Home screen with usage instructions

### File List

Modified: app/index.tsx
