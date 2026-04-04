# Design System Document: The Precision Utility

## 1. Overview & Creative North Star: "The Digital Concierge"
The Creative North Star for this design system is **The Digital Concierge**. Unlike standard utility apps that feel like cold spreadsheets, this system aims for an editorial, high-end productivity experience. It is "Smart & Helpful" not through excessive signaling, but through extreme clarity, breathing room, and a sophisticated layering of surfaces.

We break the "template" look by rejecting rigid borders and standard grids. Instead, we use **Intentional Asymmetry** and **Tonal Depth**. By utilizing a high-contrast typography scale (pairing the functional *Inter* with the more architectural *Manrope*), we create a layout that feels curated. The experience should feel like a premium physical planner—expensive paper, crisp ink, and a sense of calm order.

---

## 2. Colors & Surface Philosophy
The palette is anchored by "Calendar Blue" (`primary: #005bbf`), balanced by a sophisticated range of cool grays and architectural whites.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background provides all the separation a user needs without the visual "noise" of a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine stationery.
*   **Base:** `surface` (#f8f9fa)
*   **De-emphasized regions:** `surface-container-low` (#f3f4f5)
*   **Standard Cards:** `surface-container-lowest` (#ffffff)
*   **Elevated/Active states:** `surface-container-high` (#e7e8e9)

### The "Glass & Gradient" Rule
To elevate the "Smart" vibe, use Glassmorphism for floating action elements. Apply a semi-transparent `surface-container-lowest` with a `backdrop-blur` of 20px. 

### Signature Textures
Main CTAs should move beyond flat fills. Use a subtle linear gradient from `primary` (#005bbf) to `primary_container` (#1a73e8) at a 135-degree angle. This adds a "lithographic" depth that feels professional and custom.

---

## 3. Typography
We use a dual-typeface system to balance authority with legibility. 

*   **Display & Headlines (Manrope):** Used for "Editorial Moments"—screen titles, large stats, and high-level summaries. The geometric nature of Manrope feels modern and "Smart."
*   **Body & Labels (Inter):** Used for all functional data. Inter is the "Helpful" partner, ensuring high legibility even at the `label-sm` (0.6875rem) size.

**Hierarchy Note:** Always maintain a high contrast between headings and body text. If a `headline-md` is used, ensure the surrounding `body-md` has ample tracking (0.01em) to create an airy, premium feel.

---

## 4. Elevation & Depth
Depth in this system is achieved through **Tonal Layering** rather than traditional drop shadows.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background. This creates a "soft lift" that feels integrated into the environment.
*   **Ambient Shadows:** If an element must float (e.g., a Modal), use a shadow with a blur of `24px` and an opacity of `6%`. The shadow color must be a tinted version of `on-surface` (#191c1d), never pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use the `outline_variant` (#c1c6d6) at **15% opacity**. 100% opaque borders are strictly forbidden.

---

## 5. Components

### Progress Bars (The "Pulse" Indicator)
*   **Track:** `secondary_container` (#dde0e6) with `rounded-full`.
*   **Indicator:** `primary` (#005bbf). 
*   **Detail:** For high-priority tasks, use a subtle "glow" using a `primary` shadow at 20% opacity to make the progress feel "active" and alive.

### Call-to-Action Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), `rounded-lg` (0.5rem), `title-sm` (Inter, Semibold).
*   **Secondary:** `surface-container-high` fill with `on-surface` text. No border.
*   **Tertiary:** Text-only using `primary` color, with a `0.7rem` (2) horizontal padding for a larger hit target.

### Editable Form Fields
*   **Input Area:** `surface-container-low` background. 
*   **Focus State:** Shift background to `surface-container-lowest` and add a 2px "Ghost Border" using `primary` at 40% opacity.
*   **Labels:** Use `label-md` in `on-surface-variant`. Labels should always sit *above* the field, never inside as placeholder text.

### Cards & Lists
*   **Rule:** Forbid the use of divider lines. 
*   **Separation:** Use `1rem` (3) to `1.4rem` (4) of vertical white space from the Spacing Scale. If a visual break is needed, use a subtle background shift to `surface-container-lowest`.

### Smart Utility Components
*   **Status Toasts:** Use Glassmorphism (Backdrop blur) with `on-surface` text.
*   **Contextual Insight Cards:** Use the `tertiary_container` (#c55500) with `on-tertiary_container` for "Smart" suggestions or alerts to break the blue/gray monotony without looking like an "Error."

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins. For example, a left margin of `1.4rem` (4) and a right margin of `2rem` (6) can create a modern, editorial feel for headers.
*   **Do** prioritize "Negative Space." If a screen feels crowded, increase the spacing scale rather than shrinking the text.
*   **Do** use `primary_fixed_dim` for disabled states to maintain the "Calendar Blue" brand harmony.

### Don't
*   **Don't** use 1px solid black or dark gray dividers.
*   **Don't** use "Standard" blue (#0000FF). Always stick to the `primary` "Calendar Blue" token.
*   **Don't** use sharp corners. Every container must use at least `rounded-md` (0.375rem) to maintain the "Helpful" and approachable vibe.
*   **Don't** use pure black (#000000) for text. Use `on-surface` (#191c1d) to keep the contrast high but the feel sophisticated.