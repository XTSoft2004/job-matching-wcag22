# 00: General Principles

## 1. Purpose
This document outlines the foundational principles of accessibility for the Vietnamese recruitment platform: Inclusive Design, Universal Design, and Mobile Accessibility.

## 2. Scope
Applies to the entire software development lifecycle, from UX design to frontend implementation and QA validation.

## 3. MUST Rules
- MUST design for users with disabilities from the initial planning phase (Shift-Left Accessibility).
- MUST ensure mobile touch targets are at least 44x44 CSS pixels.
- MUST provide alternative interactions for complex gestures (e.g., swipe).
- MUST support both portrait and landscape device orientations.

## 4. MUST NOT Rules
- MUST NOT treat accessibility as a post-release bug-fixing phase.
- MUST NOT restrict the view to a single orientation unless strictly essential.
- MUST NOT require fine motor control to complete critical workflows (e.g., applying for a job).

## 5. SHOULD Rules
- SHOULD follow the "One Web" approach: same content and functionality across all devices.
- SHOULD use plain language and clear typography to aid cognitive accessibility.
- SHOULD provide clear feedback for all user actions.

## 6. SHOULD NOT Rules
- SHOULD NOT use overly complex jargon in UI text without explanations.
- SHOULD NOT depend on hover states to reveal essential information on mobile devices.

## 7. Recommended Examples
```tsx
// Good: Touch target meets 44x44 minimum, clear visual feedback
<button 
  className="min-h-[44px] min-w-[44px] p-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
>
  Save Job
</button>
```

## 8. Bad Examples
```tsx
// Bad: Touch target too small, hard for mobile/motor-impaired users to tap
<button className="h-4 w-4 text-xs bg-gray-200">
  x
</button>
```

## 9. Code Snippets
```css
/* Ensuring responsive typography for readability */
html {
  font-size: 16px; /* Base size */
}
@media (min-width: 768px) {
  html {
    font-size: 18px; /* Slightly larger for desktop */
  }
}
```

## 10. Accessibility Rationale
Designing inclusively means recognizing human diversity. By starting with a Universal Design approach, we build a platform that is naturally more usable for everyone, including the elderly, users with temporary disabilities (like a broken arm), and users in restrictive environments (like bright sunlight).

## 11. Testing Methods
- **Mobile Device Testing**: Real device testing on iOS and Android.
- **Orientation Testing**: Rotate device to ensure UI adapts.
- **Touch Target Validation**: Use browser tools to measure pixel dimensions of interactive elements.

## 12. Developer Checklist
- [ ] Are touch targets at least 44x44px?
- [ ] Does the UI function correctly in both portrait and landscape modes?
- [ ] Are hover states also accessible via focus or click on touch devices?
- [ ] Is the language simple and clear?
