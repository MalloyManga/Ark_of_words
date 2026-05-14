# Stage 1 UI Prototype

## Goal

Build the first UI-only homepage prototype for Ark_of_words so the project can review visual direction before data/API work begins.

## Requirements

- Use a bright emerald/green eye-comfort theme with an education-adjacent learning-tool feeling, not a generic education website.
- Revise the visual direction toward a cute playful claymorphism educational-platform style while keeping content specific to Ark_of_words.
- Do not use gradients in the UI.
- Homepage hero layout:
  - Left side: large project name, short supporting copy, two buttons: "直接开始" and "浏览干员".
  - "直接开始" should be visually wider than "浏览干员".
  - Right side: use `app/assets/imgs/Wiš'adel.png` as a floating character visual without a surrounding frame.
  - Position the typewriter effect on the right side and loop type/delete using the project name for now.
- Include homepage preview sections inspired by an educational platform:
  - catalog preview
  - progress tracking demo
  - learner testimonial
  - practice/enrollment CTA
- Make images and visual media non-selectable and non-draggable.
- Use `Fredoka, sans-serif` as the UI font family.
- Load Fredoka from local assets and apply it only to English/numeric/decorative UI text through Tailwind font utilities, not globally to Chinese/Japanese text.
- Button hover should feel half-pressed, while active/click state should feel fully pressed.
- Replace the three small 01-03 learning cards with one longer practice stats card containing best combo and today's progress.
- Add a blue "自由配置" information card using the educational reference palette, including a placeholder operator count.
- UI only for this pass:
  - No real PRTS fetching.
  - No real mock data rendering required yet.
  - Practice stats can be static placeholders for now; future persistence should use `localStorage` for single-device progress before considering account/token-based sync.
- Mascot animation is backlog-only for this pass and must not be implemented in the homepage prototype yet.
- Future mascot animation state plan:
  - `move`: 0.9333333373069763s, 28 frames at 30 FPS, looped while chasing the cursor horizontally.
  - `interact`: 2.2666666507720947s, 68 frames at 30 FPS, one-shot after clicking the mascot, then return to idle.
  - `special`: 12.166666984558105s, 365 frames at 30 FPS, one-shot after long mouse inactivity, then return to idle.
  - `overload`: 1.399999976158142s, 42 frames at 30 FPS, one-shot after too many rapid clicks, then return to idle.
  - Use a state-machine data structure with animation id, frame count, fps, loop, interrupt rules, and return state.
  - Preferred implementation direction is Canvas or CSS-rendered spritesheets/frame sheets with horizontal flip for left movement, not raw WebM as the primary interactive format.
  - GIF can be used as a preview/reference asset, but is not preferred for final interactive control because frame timing, direction flipping, pausing, and state transitions are less precise.
  - First implementation should start with GIF assets for short animations to verify visual feel quickly, then switch only if stutter, timing control, or transition quality becomes a real problem.
  - Long animations such as `special` should not be forced into one extremely long spritesheet in the first pass; split resources or video-like formats can be reconsidered when implementation starts.
- Split the homepage into small Vue components instead of keeping all UI inside `app.vue`:
  - reusable app button
  - practice stats card
  - free config card
  - Buttons can be visual placeholders.
- Keep responsive layout usable on mobile and desktop.
- Preserve the current Nuxt/Tailwind setup.

## Acceptance Criteria

- [ ] The Nuxt welcome screen is replaced by a custom homepage.
- [ ] The page visually communicates Ark_of_words as a Japanese listening/typing practice app.
- [ ] The right-side Wiš'adel image renders from `app/assets/imgs`.
- [ ] The typewriter text appears on the right side and loops type/delete.
- [ ] The design uses emerald/green as the primary visual language and remains readable.
- [ ] The UI uses no gradients.
- [ ] The operator image and typewriter are not wrapped in one large right-side frame.
- [ ] Images and visual media are not selectable or draggable.
- [ ] Buttons use pressed-state hover/active motion.
- [ ] The left-side stats area shows best combo and today's progress in one long card.
- [ ] A blue "自由配置" card appears with placeholder operator count.
- [ ] `app.vue` delegates button and stats/config cards to components.
- [ ] The layout is responsive and does not overflow horizontally on small screens.

## Definition of Done

- Implementation completed in app UI files.
- Lint/build or an equivalent Nuxt verification command passes.
- Dev server URL provided if started.

## Technical Approach

- Implement the homepage in `app/app.vue` unless existing routing patterns require a page file.
- Use Tailwind CSS utilities and small scoped CSS only where animation requires it.
- Use the existing image asset directly via an import from `app/assets/imgs/Wiš'adel.png`.

## Mock Data Placement

- Text/operator JSON for UI prototyping should go under `app/data/` so it can be imported by Vue/Nuxt code and later replaced by API results.
- Static files that must be served directly by URL belong under `public/`.
- Downloaded audio files should temporarily go under `public/mock/audio/<operator-id>/` if the browser needs to play them by URL.
- Source/reference files that should not be bundled can go under `docs/mock-sources/`.

## Out of Scope

- Real API integration.
- Real operator browsing page.
- Audio playback implementation.
- Typing judge implementation.
- Persistent design-system docs.

## Technical Notes

- uipro design system search suggested a bright, playful learning-app direction; adapt this into a calmer emerald learning-tool UI rather than a childlike education site.
- Existing project has Tailwind CSS v4 configured through `@tailwindcss/vite`.
