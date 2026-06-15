# WCAG 2.2 Accessibility Rule System

## 1. Purpose
This directory contains the comprehensive accessibility rule system for the enterprise-scale Vietnamese recruitment platform. The system is designed to ensure compliance with WCAG 2.2 Level AA (minimum target) and guarantees the platform serves everyone, including people with various disabilities. Accessibility is a mandatory engineering requirement, not an optional feature.

## 2. Scope
These rules apply to all frontend applications, components, and pages within the recruitment platform, specifically targeting the Next.js App Router, TypeScript, HeroUI, and TailwindCSS stack. It covers guidelines for developers, designers, and QA engineers.

## 3. MUST Rules
- All generated UI components MUST be keyboard accessible.
- The platform MUST support screen readers (NVDA, JAWS, VoiceOver, TalkBack).
- The platform MUST support browser zoom up to 200% without loss of content or functionality.
- Layouts MUST be responsive and adapt to different screen sizes.
- Focus indicators MUST be clearly visible for all interactive elements.
- The platform MUST support dark mode with sufficient contrast.
- Developers MUST use semantic HTML.
- All interactive elements MUST provide accessible names and descriptions.
- Text and UI components MUST have sufficient contrast ratios (Text >= 4.5:1, Large Text/UI >= 3:1).
- The platform MUST work without a mouse.
- The DOM MUST preserve a logical reading and tab order.

## 4. MUST NOT Rules
- MUST NOT use `div` or `span` elements as buttons or links.
- MUST NOT remove focus outlines (`outline: none` without a visual replacement).
- MUST NOT rely on color alone to convey information or state.
- MUST NOT create keyboard traps.
- MUST NOT autoplay audio or video.
- MUST NOT hide focus indicators.
- MUST NOT create inaccessible complex components (forms, modals, dropdowns, tables).
- MUST NOT use images without appropriate alternative text (`alt`).
- MUST NOT use placeholders as the sole label for form inputs.
- MUST NOT use click-only interactions without keyboard equivalents.
- MUST NOT implement inaccessible drag-and-drop interactions.

## 5. SHOULD Rules
- SHOULD provide progressive enhancement for advanced features.
- SHOULD support transcripts and audio descriptions for multimedia.
- SHOULD use Server Components when possible for better performance and reliability.
- SHOULD implement automated accessibility testing in the CI/CD pipeline.

## 6. SHOULD NOT Rules
- SHOULD NOT use Client Components unless state or browser APIs are strictly necessary.
- SHOULD NOT clutter the screen reader experience with redundant ARIA attributes when native HTML suffices.

## 7. Recommended Examples
```tsx
// Good: Native button with clear accessible name
<button type="button" onClick={handleSubmit} className="btn-primary">
  Submit Application
</button>

// Good: Image with descriptive alt text
<Image src="/hero.jpg" alt="Two colleagues discussing a project in an office" width={800} height={400} />
```

## 8. Bad Examples
```tsx
// Bad: Div used as a button, not keyboard accessible, no role
<div onClick={handleSubmit} className="btn-primary">
  Submit Application
</div>

// Bad: Missing alt text on an informative image
<img src="/hero.jpg" />
```

## 9. Code Snippets
See specific rule files for detailed component-level code snippets.

## 10. Accessibility Rationale
An accessible recruitment platform ensures equal opportunity for all candidates. By adhering to WCAG 2.2 AA, we eliminate barriers for users with visual, auditory, motor, and cognitive disabilities, fulfilling legal and ethical obligations while expanding our talent pool reach.

## 11. Testing Methods
- **Automated**: axe DevTools, Lighthouse, CI/CD linting (`eslint-plugin-jsx-a11y`).
- **Manual**: Keyboard-only navigation testing, 200% zoom testing.
- **Screen Reader**: Testing with NVDA (Windows) and VoiceOver (macOS/iOS).

## 12. Developer Checklist
- [ ] Read and understand the global accessibility principles.
- [ ] Ensure local development environment is equipped with axe DevTools.
- [ ] Review the PR template and Definition of Done before starting a task.
- [ ] Integrate screen reader testing into the daily workflow.
