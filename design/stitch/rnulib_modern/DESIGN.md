# Design System Specification: Editorial Precision

## 1. Overview & Creative North Star: "The Kinetic Curator"
This design system rejects the "cookie-cutter" mobile template in favor of a **Kinetic Curator** aesthetic. It is a high-end, editorial approach to mobile utility that treats every screen as a balanced composition rather than a data grid. 

The system moves beyond standard React Native patterns by prioritizing **intentional asymmetry**, **tonal depth**, and **typographic breathing room**. By leveraging the vibrant blue of the RNULib DNA and pairing it with a sophisticated scale of tinted neutrals, we create an experience that feels premium, bespoke, and authoritative. We do not use borders to define space; we use light and layering.

---

## 2. Colors: Tonal Architecture
Color is used here as a structural tool. We rely on the Material Design 3 naming convention to define a systematic hierarchy of surfaces.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders for sectioning or container definition are strictly prohibited. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background provides all the separation the eye needs without the "visual noise" of a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical layers—fine paper or frosted glass.
- **Base Layer:** `surface` (#fdf8fb)
- **Secondary Tier:** `surface_container_low` (#f7f2f5) for subtle grouping.
- **Action Tier:** `surface_container_highest` (#e6e1e4) for high-priority interactive cards.

### The Glass & Gradient Rule
To achieve a "signature" look, main CTAs and hero elements should utilize a subtle linear gradient:
*   **From:** `primary` (#3e24e7) 
*   **To:** `primary_container` (#5848ff) at a 135-degree angle.
Floating navigation or overlays should use **Glassmorphism**: applying `surface_container_lowest` at 80% opacity with a `20px` backdrop blur to allow content to bleed through softly.

---

## 3. Typography: The Editorial Voice
We utilize **Inter** (as the modern evolution of the system-ui request) to provide a neutral but high-performance foundation.

*   **Display (lg/md/sm):** Used for "Hero" moments. Use `display-md` (2.75rem) with tight letter-spacing (-0.02em) to create a bold, editorial impact.
*   **Headline & Title:** Use `headline-sm` (1.5rem) for primary screen headings. Ensure `on_surface` (#1c1b1d) is used to maintain high contrast.
*   **Body (lg/md/sm):** All functional text uses `body-md` (0.875rem). It provides maximum legibility on mobile devices without crowding the layout.
*   **Labels:** Use `label-md` (0.75rem) in `secondary` (#5f5e5f) for metadata and auxiliary information.

**Hierarchy Note:** Always pair a `headline-lg` with a `body-md` that has at least 1.5x the headline's leading to create "The Curator's Breath"—significant vertical whitespace that signals luxury.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are "cheap." This system conveys depth through **Tonal Layering**.

*   **The Layering Principle:** Place a `surface_container_lowest` (#ffffff) card on a `surface_container_low` (#f7f2f5) background. The change in hex value creates a soft, natural "lift."
*   **Ambient Shadows:** If a shadow is required for a floating Action Button (FAB), use a multi-layered shadow:
    *   *Blur:* 32px, *Y-Offset:* 8px.
    *   *Color:* `on_surface` (#1c1b1d) at 6% opacity. This mimics natural light rather than digital "glow."
*   **The Ghost Border:** If accessibility requires a stroke (e.g., in high-contrast modes), use `outline_variant` (#c7c4d9) at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components: Refined Primitives

### Buttons
*   **Primary:** Gradient (`primary` to `primary_container`), `rounded-md` (0.75rem/12px). No shadow.
*   **Secondary:** `surface_container_high` background with `primary` text.
*   **Tertiary:** Pure text using `primary` color, `title-sm` weight.

### Cards & Lists
*   **The Divider Forbid:** Never use a horizontal line to separate list items. Use **Spacing Scale 4** (1rem) or a subtle shift from `surface` to `surface_container_low` for every second item (zebra striping at 2% opacity).
*   **Corner Radius:** Standardize on `rounded-md` (12px) for cards to maintain the "modern-clean" aesthetic.

### Input Fields
*   **Field Style:** Use `surface_container_low` as the fill. 
*   **Active State:** Change fill to `surface_container_lowest` and add a `2px` "Ghost Border" of `primary` at 40% opacity. 
*   **Labels:** Always floating, using `label-md` in `on_surface_variant`.

### Signature Component: The "Contextual Sheet"
A bottom-aligned surface using **Glassmorphism** and a `surface_container_highest` handle. This should be used for all secondary actions to keep the primary view focused and uncluttered.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins. For example, a `24` (6rem) top margin paired with a `10` (2.5rem) bottom margin to create a dynamic, editorial flow.
*   **Do** use `primary_fixed_dim` (#c4c0ff) for disabled states; it keeps the brand color visible but clearly inactive.
*   **Do** ensure all touch targets are at least 44x44px, even if the visual element (like a text link) is smaller.

### Don’t
*   **Don't** use pure black (#000000). Use `on_surface` (#1c1b1d) for text to prevent "visual vibration" on OLED screens.
*   **Don't** use the `full` (9999px) rounding on anything other than Chips or Tags. Buttons must remain `md` (12px) to feel "structured."
*   **Don't** use standard "drop shadows" on cards. Rely on the surface color tiers to define the hierarchy.