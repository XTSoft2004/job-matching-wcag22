# 05: Color and Contrast

## 1. Purpose
To ensure that all text and interactive UI elements are clearly visible to users with low vision or color blindness.

## 2. Scope
Text contrast, UI component contrast, focus indicator contrast, and reliance on color.

## 3. MUST Rules
- MUST maintain a contrast ratio of at least 4.5:1 for standard text against its background.
- MUST maintain a contrast ratio of at least 3:1 for large text (18pt/24px normal or 14pt/18.5px bold) against its background.
- MUST maintain a contrast ratio of at least 3:1 for graphical objects and user interface components (e.g., input borders, buttons).
- MUST ensure focus indicators have at least a 3:1 contrast ratio against the adjacent background.
- MUST support dark mode with accessible contrast palettes.

## 4. MUST NOT Rules
- MUST NOT use color as the sole method to convey information (e.g., do not use a red border alone to indicate a form error; add an error icon or text message).
- MUST NOT use light gray text on a white background that falls below 4.5:1.

## 5. SHOULD Rules
- SHOULD use TailwindCSS color palettes tailored for accessibility.
- SHOULD test designs in grayscale to ensure information hierarchy is preserved without color.

## 6. SHOULD NOT Rules
- SHOULD NOT place text over complex or busy background images without a solid overlay or text shadow to guarantee contrast.

## 7. Recommended Examples
```tsx
// Good: Error state uses both color and icon/text
<div className="border border-red-600 bg-red-50 p-4 rounded-md">
  <div className="flex items-center text-red-800">
    <AlertCircleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
    <span>Status: Application Rejected</span>
  </div>
</div>
```

## 8. Bad Examples
```tsx
// Bad: Success state relying entirely on a green color
<span className="text-green-500">Application Approved</span>
```

## 9. Code Snippets
```css
/* Tailwind custom focus ring enforcing contrast */
.focus-ring-accessible {
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-slate-100;
}
```

## 10. Accessibility Rationale
High contrast is essential for users with visual impairments. Not relying on color alone is critical for the 8% of men and 0.5% of women who experience color vision deficiency (color blindness).

## 11. Testing Methods
- **WebAIM Contrast Checker**: Manually verify hex codes.
- **Figma Plugins**: Use Stark or Able in the design phase.
- **Chrome DevTools**: Use the CSS Overview or Color Picker tool to check contrast ratios directly in the browser.

## 12. Developer Checklist
- [ ] Does normal text meet the 4.5:1 ratio?
- [ ] Do borders on inputs and buttons meet the 3:1 ratio?
- [ ] Are errors and success states identifiable without color?
- [ ] Has dark mode contrast been verified independently?
