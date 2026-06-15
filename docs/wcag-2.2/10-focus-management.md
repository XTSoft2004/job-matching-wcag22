# 10: Focus Management

## 1. Purpose
To ensure smooth, predictable navigation for keyboard and screen reader users by programmatically controlling focus when the DOM changes.

## 2. Scope
Modals, dialogs, drawers, single-page application (SPA) routing, and dynamic DOM updates.

## 3. MUST Rules
- MUST trap focus within an open Modal, Dialog, or Drawer.
- MUST restore focus to the triggering element when a Modal, Dialog, or Drawer is closed.
- MUST move focus to a newly revealed component if it requires immediate user interaction.
- MUST send focus to a relevant heading or an established "skip link" target upon route changes in Next.js.
- MUST ensure focus indicators are highly visible for all focusable elements.

## 4. MUST NOT Rules
- MUST NOT drop focus (where focus goes to the `<body>` element) after a component is unmounted.
- MUST NOT arbitrarily move focus around the page, causing disorientation.

## 5. SHOULD Rules
- SHOULD use robust libraries (like HeroUI, Radix, or React Aria) that handle focus trapping internally.
- SHOULD announce route changes to screen readers using an aria-live region if focus is not shifted to the main `<h1>`.

## 6. SHOULD NOT Rules
- SHOULD NOT outline the entire `<body>` or `<main>` wrapper when a route changes, as it is visually distracting.

## 7. Recommended Examples
```tsx
// Good: Ref based focus restoration when modal closes
const buttonRef = useRef<HTMLButtonElement>(null);
const [isOpen, setIsOpen] = useState(false);

const openModal = () => setIsOpen(true);
const closeModal = () => {
  setIsOpen(false);
  // Restore focus
  setTimeout(() => buttonRef.current?.focus(), 0); 
};

return (
  <>
    <button ref={buttonRef} onClick={openModal}>Open Details</button>
    {isOpen && <Modal onClose={closeModal} />}
  </>
);
```

## 8. Bad Examples
```tsx
// Bad: Dropping focus when an item is deleted
function deleteItem() {
  removeItemFromState();
  // Focus is now lost in the DOM because the button that held focus was removed
}
```

## 9. Code Snippets
```tsx
// Next.js Route Change Focus Management
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Focus the main element on route change, but don't show an outline
    if (mainRef.current) {
      mainRef.current.focus({ preventScroll: true });
    }
  }, [pathname]);

  return (
    <main ref={mainRef} tabIndex={-1} className="outline-none">
      {children}
    </main>
  );
}
```

## 10. Accessibility Rationale
When an element disappears (like a closed modal), if focus isn't managed, the browser resets focus to the top of the document. A keyboard user then has to tab through the entire page again to get back to where they were.

## 11. Testing Methods
- **Tab Key**: Open a modal, try to tab outside of it. Close the modal, where is focus?
- **Route Change**: Click a link to another page. Where is the focus on the new page?

## 12. Developer Checklist
- [ ] Is focus trapped inside modals/drawers?
- [ ] Is focus restored to the trigger when overlays close?
- [ ] Does focus move to the `<main>` area or `<h1>` upon route changes?
