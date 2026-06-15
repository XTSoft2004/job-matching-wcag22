# 06: Keyboard Navigation

## 1. Purpose
To guarantee that all interactive elements and workflows can be accessed and operated entirely via a keyboard.

## 2. Scope
Focus order, key event handling, interactive components (buttons, links, form fields, modals, menus).

## 3. MUST Rules
- MUST ensure all interactive elements receive focus in a logical reading order (left-to-right, top-to-bottom).
- MUST support `Tab` to navigate forward, and `Shift+Tab` to navigate backward.
- MUST support `Enter` and `Space` to activate buttons.
- MUST support `Enter` to activate links.
- MUST support `Escape` to close modals, tooltips, popovers, and dropdowns.
- MUST support `Arrow Up/Down/Left/Right` to navigate within complex widgets like Tabs, Radios, and Dropdowns (following WAI-ARIA authoring practices).
- MUST support `Home` and `End` keys to jump to the start/end of lists or widgets.

## 4. MUST NOT Rules
- MUST NOT create keyboard traps where a user cannot tab away from an element.
- MUST NOT attach `onClick` handlers to non-interactive elements (`div`, `span`) without providing full keyboard event handlers (`onKeyDown`) and a valid `tabIndex`.

## 5. SHOULD Rules
- SHOULD provide shortcut keys for advanced or power-user features.
- SHOULD use native HTML elements (`<button>`, `<a>`, `<input>`) as they provide built-in keyboard support.

## 6. SHOULD NOT Rules
- SHOULD NOT require complex chorded keystrokes (e.g., `Ctrl+Alt+Shift+S`) for essential functionality.

## 7. Recommended Examples
```tsx
// Good: Using native button gives Enter/Space support automatically
<button onClick={handleSave} className="bg-blue-600 text-white p-2 rounded">
  Save Profile
</button>
```

## 8. Bad Examples
```tsx
// Bad: Span lacks focusability and keyboard event handlers
<span onClick={handleSave} className="cursor-pointer bg-blue-600 text-white p-2 rounded">
  Save Profile
</span>
```

## 9. Code Snippets
```tsx
// Fixing a custom element (only if native cannot be used)
<div
  role="button"
  tabIndex={0}
  onClick={handleSave}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSave();
    }
  }}
>
  Save Profile
</div>
```

## 10. Accessibility Rationale
For users with motor impairments, using a mouse is physically impossible. They rely exclusively on keyboards or keyboard-emulating devices (like sip-and-puff systems).

## 11. Testing Methods
- **Keyboard Traversal**: Use only the `Tab` key to traverse the entire UI.
- **Activation**: Ensure `Enter` and `Space` activate buttons.
- **Escape Hatch**: Ensure `Esc` closes any active overlays.

## 12. Developer Checklist
- [ ] Can all interactive items be reached via Tab?
- [ ] Do custom widgets support arrow key navigation?
- [ ] Does `Esc` close all open dialogs or popovers?
