# 12: Screen Reader Support

## 1. Purpose
To ensure the recruitment platform is fully operable and understandable by users utilizing screen readers (NVDA, JAWS, VoiceOver, TalkBack).

## 2. Scope
Accessible names, accessible descriptions, ARIA Live regions, and structural announcements.

## 3. MUST Rules
- MUST ensure every interactive element has an accessible name (either via text content, `aria-label`, or `aria-labelledby`).
- MUST provide accessible descriptions (`aria-describedby`) for complex inputs, helper text, and error messages.
- MUST use `aria-live` or `role="alert"` regions to announce dynamic content changes (e.g., "Job application submitted successfully").
- MUST hide decorative elements and icon-only visual noise from screen readers using `aria-hidden="true"`.

## 4. MUST NOT Rules
- MUST NOT use `aria-hidden="true"` on elements that can receive keyboard focus.
- MUST NOT use visual text (`display: none`) for screen reader-only content; use standard visually hidden CSS classes (`sr-only`).

## 5. SHOULD Rules
- SHOULD write clear, concise accessible names (e.g., "Close Modal" instead of "Click here to close the modal window").
- SHOULD group related information so screen readers read it as a single block.

## 6. SHOULD NOT Rules
- SHOULD NOT prepend roles to accessible names (e.g., `aria-label="Button Search"`). Screen readers announce the role automatically ("Search, button").

## 7. Recommended Examples
```tsx
// Good: Screen reader only text using Tailwind 'sr-only'
<button className="flex items-center">
  <span className="sr-only">Edit Profile</span>
  <EditIcon aria-hidden="true" />
</button>

// Good: Aria-live region for dynamic updates
<div aria-live="polite" className="sr-only">
  {searchResultsCount} jobs found.
</div>
```

## 8. Bad Examples
```tsx
// Bad: Redundant role in aria-label
<button aria-label="Submit Button">Submit</button>

// Bad: Hidden element that receives focus
<button style={{ display: 'none' }}>Hidden Action</button>
```

## 9. Code Snippets
```css
/* Tailwind's built-in sr-only class equivalent */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## 10. Accessibility Rationale
Screen readers are the primary interface for blind users. If a button lacks an accessible name, the screen reader will simply say "Button", leaving the user guessing what action it performs. Dynamic changes (like form submission success) must be announced, otherwise the user doesn't know the action completed.

## 11. Testing Methods
- **NVDA (Windows)**: Test critical flows using NVDA and the keyboard.
- **VoiceOver (macOS/iOS)**: Test critical flows using VoiceOver.

## 12. Developer Checklist
- [ ] Do all icon buttons have an `aria-label` or `sr-only` text?
- [ ] Are dynamic notifications wrapped in `aria-live` regions?
- [ ] Does the screen reader announce error messages correctly?
