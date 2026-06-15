# 15: Accessibility Checklist

## 1. Purpose
A quick-reference checklist for developers and QA to verify WCAG 2.2 AA compliance before completing a feature.

## 2. Scope
All UI components, pages, and critical user flows.

## 3. Global Checklist

### Visual & Layout (Perceivable)
- [ ] Text contrast is at least 4.5:1 (3:1 for large text).
- [ ] Non-text UI components contrast is at least 3:1.
- [ ] Focus indicators are clearly visible and meet 3:1 contrast.
- [ ] No information is conveyed by color alone.
- [ ] Interface works correctly at 200% zoom without loss of content.
- [ ] Layout reflows to a single column at 320px width (400% zoom equivalent).
- [ ] Support for both Dark and Light modes maintains contrast rules.

### Keyboard & Interaction (Operable)
- [ ] All functionality is accessible using only the keyboard.
- [ ] Focus order follows the visual layout (left-to-right, top-to-bottom).
- [ ] No keyboard traps exist (users can `Esc` or `Tab` away).
- [ ] Custom interactive widgets support standard WAI-ARIA keyboard navigation (arrows, space, enter).
- [ ] A "Skip to main content" link is present and functional.

### Media & Images (Perceivable)
- [ ] All informative images have descriptive `alt` text.
- [ ] All decorative images have `alt=""` and `aria-hidden="true"`.
- [ ] SVG icons have accessible names (`aria-label` or visually hidden text) if they serve a function.
- [ ] Videos do not autoplay and possess controls (pause, stop, volume).
- [ ] Videos have accurate closed captions.

### Forms & Validation (Understandable)
- [ ] Every input has a programmatic `<label>`.
- [ ] Required fields are explicitly marked (both visually and programmatically).
- [ ] Errors are clearly identified in text, not just by red borders.
- [ ] Error messages and helper text are linked to inputs via `aria-describedby`.
- [ ] Relevant inputs use appropriate `autocomplete` attributes.

### Semantics & Screen Readers (Robust)
- [ ] HTML5 semantic landmarks (`<main>`, `<nav>`, `<header>`) are used correctly.
- [ ] Headings (`<h1>` - `<h6>`) form a logical outline without skipped levels.
- [ ] Only one `<h1>` exists per page.
- [ ] Dynamic updates (like toast notifications or form success) use `aria-live` or `role="alert"`.
- [ ] Modals and drawers trap focus and hide background content from screen readers (`aria-hidden` on main).

### Code Quality (Robust)
- [ ] The `<html>` tag has a valid `lang` attribute.
- [ ] All `id` attributes are unique per page.
- [ ] ARIA is only used when native HTML cannot solve the problem.
- [ ] `eslint-plugin-jsx-a11y` reports zero errors.
- [ ] Automated accessibility tests (e.g., axe) pass with zero critical/serious issues.
