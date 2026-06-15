# 02: Operable

## 1. Purpose
To ensure user interface components and navigation are operable by all users, particularly those relying on a keyboard or assistive devices.

## 2. Scope
Keyboard accessibility, timing, seizures/physical reactions, navigability, and input modalities.

## 3. MUST Rules
- MUST make all functionality available from a keyboard.
- MUST NOT trap keyboard focus in any component (e.g., modals must allow users to `Esc` or `Tab` back out).
- MUST provide a "Skip to main content" link at the top of the page.
- MUST ensure focus is clearly visible for every interactive element.
- MUST preserve a logical tab order that follows the visual flow.
- MUST provide controls to pause, stop, or hide moving, blinking, or scrolling information.

## 4. MUST NOT Rules
- MUST NOT use `tabindex` greater than 0.
- MUST NOT include anything that flashes more than three times in any one second period.
- MUST NOT remove the default focus outline unless providing a customized, high-contrast replacement.

## 5. SHOULD Rules
- SHOULD provide multiple ways to navigate (e.g., search, sitemap, clear navigation menus).
- SHOULD ensure that the target size for pointer inputs is at least 44 by 44 CSS pixels.

## 6. SHOULD NOT Rules
- SHOULD NOT set aggressive session timeouts without warning the user and allowing them to extend the time.

## 7. Recommended Examples
```tsx
// Good: Clear focus indicator using Tailwind classes
<a 
  href="/jobs" 
  className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 rounded"
>
  View Jobs
</a>
```

## 8. Bad Examples
```tsx
// Bad: Removing focus outline entirely
<button className="outline-none focus:outline-none">
  Click Me
</button>
```

## 9. Code Snippets
```tsx
// Skip Link Component
export default function SkipLink() {
  return (
    <a 
      href="#main-content" 
      className="absolute -top-full left-0 z-50 bg-blue-600 text-white px-4 py-2 focus:top-0 transition-all"
    >
      Skip to main content
    </a>
  );
}
```

## 10. Accessibility Rationale
Users with motor disabilities often cannot use a mouse and rely entirely on keyboards, switch devices, or voice commands. Without visible focus, sighted keyboard users cannot see where they are on the page.

## 11. Testing Methods
- **Keyboard Only**: Unplug the mouse. Can you complete every core workflow (search job, apply, update profile) using only `Tab`, `Shift+Tab`, `Enter`, `Space`, and Arrow keys?
- **Focus Visibility**: Verify every tab stop has a highly visible indicator.

## 12. Developer Checklist
- [ ] Is there a "Skip to Content" link?
- [ ] Can all interactive elements be reached via `Tab`?
- [ ] Is the focus indicator highly visible on all elements?
- [ ] Are modals trapping focus correctly while open, and returning focus when closed?
