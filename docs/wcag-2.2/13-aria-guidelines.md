# 13: ARIA Guidelines

## 1. Purpose
To define the correct and safe usage of WAI-ARIA (Web Accessibility Initiative - Accessible Rich Internet Applications) attributes to bridge semantic gaps when native HTML is insufficient.

## 2. Scope
Roles, states, properties, and the first rule of ARIA.

## 3. MUST Rules
- MUST follow the First Rule of ARIA: If you can use a native HTML element or attribute with the semantics and behavior you require already built-in, instead of re-purposing an element and adding an ARIA role, state or property to make it accessible, then do so.
- MUST use ARIA to provide missing semantics (e.g., `role="tablist"` for custom tabs).
- MUST keep ARIA states updated dynamically via JavaScript (e.g., toggling `aria-expanded` from `false` to `true`).
- MUST use `aria-labelledby` when a visible text label exists but cannot be associated via native `<label for="...">`.
- MUST use `aria-describedby` to associate helper text or error messages with inputs.

## 4. MUST NOT Rules
- MUST NOT use ARIA to fix broken HTML structure.
- MUST NOT use redundant ARIA roles (e.g., `<button role="button">`, `<nav role="navigation">`).
- MUST NOT use `role="presentation"` or `aria-hidden="true"` on an element that can receive focus.

## 5. SHOULD Rules
- SHOULD consult the WAI-ARIA Authoring Practices Guide (APG) before building any complex custom widget (e.g., Combobox, Tree View, Modal).

## 6. SHOULD NOT Rules
- SHOULD NOT use `aria-live` extensively for non-critical information, as it interrupts the user's current reading flow.

## 7. Recommended Examples
```tsx
// Good: Using ARIA to link a description to an input
<input type="password" id="pwd" aria-describedby="pwd-help" />
<span id="pwd-help">Password must be at least 8 characters.</span>

// Good: Toggle button state
<button aria-pressed={isPressed} onClick={() => setIsPressed(!isPressed)}>
  Toggle Feature
</button>
```

## 8. Bad Examples
```tsx
// Bad: Redundant role
<main role="main">...</main>

// Bad: Using ARIA when native HTML exists
<div role="button" tabIndex="0" onClick={submit}>Submit</div>
// Better: <button onClick={submit}>Submit</button>
```

## 9. Code Snippets
```tsx
// Custom Accordion implementation using correct ARIA
<div className="accordion-item">
  <h3>
    <button 
      aria-expanded={isOpen} 
      aria-controls={`sect-${id}`} 
      id={`accordion-${id}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      Section Title
    </button>
  </h3>
  <div 
    id={`sect-${id}`} 
    role="region" 
    aria-labelledby={`accordion-${id}`}
    hidden={!isOpen}
  >
    Content goes here...
  </div>
</div>
```

## 10. Accessibility Rationale
ARIA does not change the appearance or behavior of an element; it only changes what is exposed to the accessibility API. Incorrect ARIA is often worse than no ARIA at all, as it actively lies to screen readers.

## 11. Testing Methods
- **Screen Reader Testing**: Ensure the roles, states (expanded, checked, selected), and properties are announced accurately.
- **Accessibility Tree**: Inspect the accessibility tree in Chrome DevTools.

## 12. Developer Checklist
- [ ] Have I exhausted native HTML options before using ARIA?
- [ ] Are ARIA states (`aria-expanded`, `aria-checked`) updated dynamically by state variables?
- [ ] Are all IDs referenced by `aria-controls`, `aria-labelledby`, or `aria-describedby` actually present in the DOM?
