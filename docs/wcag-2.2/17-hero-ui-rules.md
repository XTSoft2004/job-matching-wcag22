# 17: Hero UI Rules

## 1. Purpose
To ensure all components utilized from the HeroUI library are wrapped and configured to meet WCAG 2.2 AA accessibility requirements.

## 2. Scope
Buttons, Inputs, Textareas, Selects, Dropdowns, Popovers, Tooltips, Modals, Drawers, Tabs, Tables, Pagination, Accordions, DatePickers, and Autocompletes.

## 3. MUST Rules
- **General**: MUST ensure HeroUI components receive a custom, high-contrast focus ring if the default does not meet the 3:1 contrast ratio.
- **Modals/Drawers**: MUST configure HeroUI overlays to trap focus, close on `Esc`, and return focus to the trigger.
- **Inputs/Selects**: MUST wrap HeroUI form controls with `<label>` or utilize their built-in label props correctly. MUST map validation errors to the component's error state and use `aria-describedby`.
- **Tabs/Accordions**: MUST verify arrow key navigation works according to WAI-ARIA standards.
- **Tooltips/Popovers**: MUST ensure tooltips are triggered by focus as well as hover, and can be dismissed via `Esc`.
- **Tables**: MUST ensure headers (`<th>`) and scopes are correctly defined in HeroUI tables.
- **DatePicker/Autocomplete**: MUST ensure these complex widgets announce their status to screen readers and allow full keyboard operation.

## 4. MUST NOT Rules
- MUST NOT use HeroUI components in a way that overrides their built-in accessibility features (e.g., do not disable default keyboard event handlers).

## 5. SHOULD Rules
- SHOULD create standardized wrapper components around HeroUI primitives to enforce accessibility defaults specific to the recruitment platform.

## 6. SHOULD NOT Rules
- SHOULD NOT rely on HeroUI's default colors if they fail the 4.5:1 text contrast check; override them with accessible Tailwind classes.

## 7. Recommended Examples
```tsx
// Good: Wrapping HeroUI Input with explicit accessible associations
import { Input } from "@heroui/react";

export const AccessibleInput = ({ label, error, helperText, id, ...props }) => {
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  
  return (
    <Input
      id={id}
      label={label}
      isInvalid={!!error}
      errorMessage={error}
      description={helperText}
      // HeroUI handles aria-describedby internally when errorMessage/description are provided,
      // but ensure it works with screen readers during testing.
      {...props}
    />
  );
};
```

## 8. Bad Examples
```tsx
// Bad: Using HeroUI button with an icon but no accessible name
import { Button } from "@heroui/react";

<Button isIconOnly><SearchIcon /></Button>
// Better: <Button isIconOnly aria-label="Search"><SearchIcon /></Button>
```

## 9. Code Snippets
```tsx
// Accessible HeroUI Modal Configuration
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";

export const JobApplicationModal = ({ isOpen, onOpenChange }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      isDismissable={true} // Allows clicking outside or pressing Esc to close
      keyboard={true}      // Enables keyboard interactions
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Apply for Senior Developer</ModalHeader>
            <ModalBody>
               {/* Form Content */}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
```

## 10. Accessibility Rationale
UI libraries often provide accessibility features out of the box, but they must be configured correctly. Wrapping them ensures that required attributes (like `aria-label` for icon buttons or `id`s for inputs) are never forgotten by developers.

## 11. Testing Methods
- **HeroUI Documentation**: Cross-reference component usage with the accessibility notes in the HeroUI documentation.
- **Keyboard Test**: Verify complex components like DatePickers and Autocompletes can be operated entirely with the keyboard.

## 12. Developer Checklist
- [ ] Are HeroUI inputs properly labeled?
- [ ] Do HeroUI icon buttons have `aria-label`s?
- [ ] Do HeroUI modals trap focus and dismiss on `Esc`?
- [ ] Are HeroUI colors overridden if they fail contrast checks?
