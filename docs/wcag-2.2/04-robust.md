# 04: Robust

## 1. Purpose
To ensure content is robust enough that it can be interpreted reliably by a wide variety of user agents, including assistive technologies.

## 2. Scope
HTML parsing, name, role, value mapping, and ARIA usage.

## 3. MUST Rules
- MUST use standard, semantic HTML elements whenever possible before resorting to ARIA.
- MUST ensure all custom UI components expose their Name, Role, State, and Value to accessibility APIs.
- MUST ensure IDs are unique across the entire DOM.
- MUST ensure elements have complete start and end tags, and are nested according to their specifications.
- MUST use standard WAI-ARIA authoring practices when creating custom widgets (tabs, accordions, dialogs).

## 4. MUST NOT Rules
- MUST NOT use ARIA attributes on elements that do not support them.
- MUST NOT override native semantic roles with conflicting ARIA roles unless strictly necessary (e.g., do not put `role="button"` on a `<button>`).

## 5. SHOULD Rules
- SHOULD regularly test the application against HTML validators.
- SHOULD keep dependencies up to date, ensuring third-party libraries meet accessibility standards.

## 6. SHOULD NOT Rules
- SHOULD NOT use `aria-hidden="true"` on elements that can receive keyboard focus.

## 7. Recommended Examples
```tsx
// Good: A custom toggle switch using correct ARIA
<button
  type="button"
  role="switch"
  aria-checked={isToggled}
  onClick={() => setIsToggled(!isToggled)}
  className={`w-10 h-6 rounded-full focus:ring-2 ${isToggled ? 'bg-blue-600' : 'bg-gray-300'}`}
>
  <span className="sr-only">Enable email notifications</span>
  {/* visual indicator circle */}
</button>
```

## 8. Bad Examples
```tsx
// Bad: Custom checkbox with no semantics
<div onClick={() => setChecked(!checked)} className="checkbox">
  {checked ? 'x' : ''}
</div>
```

## 9. Code Snippets
```tsx
// Handling unique IDs in Next.js dynamically
import { useId } from 'react';

export default function InputField({ label }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" />
    </div>
  );
}
```

## 10. Accessibility Rationale
Robust code ensures that as technologies evolve, your platform continues to work. Screen readers map HTML directly to OS-level accessibility trees. Invalid HTML or missing ARIA states cause screen readers to guess, often resulting in an unusable experience.

## 11. Testing Methods
- **W3C Validator**: Run generated HTML through a markup validator.
- **Accessibility Tree**: Inspect the accessibility tree in Chrome DevTools to ensure roles and states are correctly calculated.

## 12. Developer Checklist
- [ ] Are all HTML tags correctly closed and nested?
- [ ] Are all `id` attributes unique on the page?
- [ ] Do all custom components utilize correct WAI-ARIA roles, states, and properties?
