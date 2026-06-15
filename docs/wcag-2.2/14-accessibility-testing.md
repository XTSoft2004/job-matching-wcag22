# 14: Accessibility Testing

## 1. Purpose
To establish a rigorous, multi-layered testing strategy ensuring the recruitment platform consistently meets WCAG 2.2 AA standards.

## 2. Scope
Automated testing, manual testing, screen reader testing, keyboard testing, and CI/CD integration.

## 3. MUST Rules
- MUST integrate automated accessibility linters (e.g., `eslint-plugin-jsx-a11y`) in the codebase.
- MUST run automated accessibility tests (e.g., axe-core/Playwright) in the CI/CD pipeline.
- MUST perform manual keyboard-only testing for all new interactive features.
- MUST verify visual contrast and responsive zoom (200%) manually.
- MUST test critical user journeys (e.g., Job Search, Application, Profile Update) with a screen reader.

## 4. MUST NOT Rules
- MUST NOT rely solely on automated testing tools (they only catch ~30% of accessibility issues).
- MUST NOT merge PRs that introduce critical or serious accessibility violations reported by automated tools.

## 5. SHOULD Rules
- SHOULD use Lighthouse or axe DevTools during local development.
- SHOULD involve real users with disabilities in user testing sessions.

## 6. SHOULD NOT Rules
- SHOULD NOT wait until the end of the release cycle to perform accessibility testing (Shift-Left).

## 7. Recommended Examples
```json
// Good: ESLint configuration for Next.js/React
{
  "extends": [
    "next/core-web-vitals",
    "plugin:jsx-a11y/recommended"
  ]
}
```

## 8. Bad Examples
```json
// Bad: Disabling accessibility rules globally
{
  "rules": {
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/alt-text": "off"
  }
}
```

## 9. Code Snippets
```typescript
// Playwright Accessibility Test Example using axe-core
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage should not have any automatically detectable accessibility issues', async ({ page }) => {
  await page.goto('/');
  
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## 10. Accessibility Rationale
A hybrid testing approach is essential. Automated tools catch missing `alt` attributes and contrast issues quickly. Manual testing is required to verify logical focus order, focus trapping, and whether an `alt` attribute actually describes the image contextually.

## 11. Testing Methods
- **Automated**: axe DevTools browser extension, Lighthouse, Playwright tests.
- **Manual**: Keyboard only (`Tab`, `Space`, `Enter`, `Esc`), 200% Zoom, High Contrast Mode.
- **Screen Reader**: NVDA (Windows), VoiceOver (macOS).

## 12. Developer Checklist
- [ ] Has the component passed the ESLint `jsx-a11y` checks?
- [ ] Has the page been run through axe DevTools with 0 critical/serious violations?
- [ ] Has the feature been tested using only a keyboard?
- [ ] Has the feature been tested at 200% zoom?
