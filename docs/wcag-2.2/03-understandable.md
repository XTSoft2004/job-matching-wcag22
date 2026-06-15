# 03: Understandable

## 1. Purpose
To ensure that information and the operation of user interface are understandable.

## 2. Scope
Readable text, predictable page operations, and comprehensive input assistance (form validations and error handling).

## 3. MUST Rules
- MUST provide clear and descriptive labels for all form inputs.
- MUST explicitly identify input errors in text and describe how to fix them.
- MUST ensure navigation mechanisms are repeated in the same relative order across multiple pages.
- MUST clearly describe the purpose of a link or button in its text (or accessible name).
- MUST set the language of the page (`<html lang="vi">` or `<html lang="en">`).

## 4. MUST NOT Rules
- MUST NOT cause unpredictable changes in context when a component receives focus or input (e.g., do not auto-submit a form just by tabbing out of an input).
- MUST NOT use placeholder text as a replacement for `<label>`.

## 5. SHOULD Rules
- SHOULD provide helper text for complex password rules or specific formatting requirements.
- SHOULD use inline validation to provide immediate feedback to users.

## 6. SHOULD NOT Rules
- SHOULD NOT use generic link text like "Click here" or "Read more".

## 7. Recommended Examples
```tsx
// Good: Clear labels and error messaging connected via aria-describedby
<div className="flex flex-col gap-1">
  <label htmlFor="email" className="font-semibold text-gray-900">Email Address</label>
  <input 
    id="email" 
    type="email" 
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
    className={`border ${hasError ? 'border-red-600' : 'border-gray-300'}`}
  />
  {hasError && (
    <span id="email-error" className="text-sm text-red-600">
      Please enter a valid email address containing '@'.
    </span>
  )}
</div>
```

## 8. Bad Examples
```tsx
// Bad: Placeholder as label, unclear error state
<input type="text" placeholder="Email" className="border-red-500" />
```

## 9. Code Snippets
```tsx
// Proper document language in Next.js (app/layout.tsx)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
```

## 10. Accessibility Rationale
Users with cognitive or learning disabilities benefit from clear, predictable interfaces and helpful error messages. Setting the correct HTML language attribute ensures screen readers use the correct pronunciation engine.

## 11. Testing Methods
- **Screen Reader Test**: Intentionally cause a form error. Does the screen reader announce the error when focus returns to the input?
- **Manual Review**: Read all link text out of context. Does "Apply Now for Senior Dev" make sense compared to just "Apply Now"?

## 12. Developer Checklist
- [ ] Is the `lang` attribute set correctly on the `<html>` tag?
- [ ] Do all forms have `<label>` tags programmatically linked to inputs?
- [ ] Are error messages descriptive and connected via `aria-describedby`?
- [ ] Is link text meaningful out of context?
