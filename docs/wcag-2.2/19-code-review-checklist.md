# 19: Code Review Checklist

## 1. Purpose
To provide pull request (PR) reviewers with a standardized framework for evaluating accessibility during code review.

## 2. Scope
All Pull Requests modifying UI, frontend logic, or HTML structure.

## 3. Reviewer Checklist

### Structural Review
- [ ] **Semantic HTML**: Does the PR use `div` or `span` where `<button>`, `<a>`, or `<nav>` should be used?
- [ ] **Headings**: Does the PR introduce new headings? Are they sequentially logical (`H2` -> `H3`)?
- [ ] **Landmarks**: Are sections properly contained within `<main>`, `<section>`, or `<article>` where appropriate?

### Visual & Interactive Review
- [ ] **Color/Contrast**: Are the colors used compliant with the 4.5:1 ratio? Are states (error/success) reliant solely on color?
- [ ] **Focus Management**: If a modal, dialog, or drawer is introduced, is focus trapped and restored correctly?
- [ ] **Keyboard Support**: Can you spot any `onClick` handlers on non-interactive elements without `onKeyDown` and `tabIndex`?
- [ ] **Focus Outlines**: Does the PR use `outline: none` without providing a custom `focus:ring`?

### Forms & Components Review
- [ ] **Labels**: Do all new form inputs have associated `<label>` elements?
- [ ] **Error Handling**: Are error states linked to inputs via `aria-describedby`?
- [ ] **HeroUI Usage**: Are HeroUI components implemented correctly with necessary accessible props (like `aria-label` for icons)?

### Media Review
- [ ] **Alt Text**: Do all new `<Image>` or `<img>` tags possess an `alt` attribute? Is it descriptive, or empty for decorative images?
- [ ] **SVGs**: Do meaningful SVGs have an accessible name?

### ARIA Review
- [ ] **First Rule of ARIA**: Is ARIA being used to fix something that native HTML could solve?
- [ ] **Dynamic States**: Are ARIA states (`aria-expanded`, `aria-checked`) dynamically tied to the React state?

## 4. MUST Rules for Reviewers
- MUST reject PRs that fail automated CI accessibility checks.
- MUST request changes if `div` elements are used as interactive buttons.
- MUST verify that new complex UI patterns (e.g., custom dropdowns) follow WAI-ARIA authoring practices.

## 5. MUST NOT Rules for Reviewers
- MUST NOT approve PRs that disable ESLint `jsx-a11y` rules without a documented, valid, and reviewed exception.

## 6. Recommended Action
If unsure about an accessibility implementation, pull the branch locally and test it with a keyboard and NVDA/VoiceOver before approving.
