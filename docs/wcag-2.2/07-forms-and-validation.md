# 07: Forms and Validation

## 1. Purpose
To ensure that forms are usable, predictable, and forgiving, especially when users make errors.

## 2. Scope
Labels, inputs, validation messages, error states, and required field indications.

## 3. MUST Rules
- MUST provide a `<label>` for every form input.
- MUST use `aria-describedby` to programmatically associate error messages and helper text with inputs.
- MUST explicitly expose required states (using the `required` attribute or `aria-required="true"`).
- MUST expose validation errors immediately or upon form submission.
- MUST group related form controls using `<fieldset>` and `<legend>` (e.g., a group of radio buttons).
- MUST support the `autocomplete` attribute to help users fill out forms faster (e.g., `autocomplete="email"`).

## 4. MUST NOT Rules
- MUST NOT use placeholders as a replacement for visible labels.
- MUST NOT rely solely on red borders to indicate an error state.
- MUST NOT disable the submit button without explaining why it is disabled.

## 5. SHOULD Rules
- SHOULD clearly mark optional fields (or explicitly mark required fields with an asterisk and text).
- SHOULD provide inline validation feedback when focus leaves an input (`onBlur`).

## 6. SHOULD NOT Rules
- SHOULD NOT clear valid user input when other parts of the form fail validation.

## 7. Recommended Examples
```tsx
// Good: Fully accessible input with error handling
<div>
  <label htmlFor="phone" className="block text-sm font-medium">Phone Number</label>
  <input
    id="phone"
    type="tel"
    autoComplete="tel"
    required
    aria-invalid={!!errors.phone}
    aria-describedby={errors.phone ? "phone-error" : "phone-help"}
    className="mt-1 block w-full rounded-md border-gray-300"
  />
  <p id="phone-help" className="text-sm text-gray-500">Format: 0912 345 678</p>
  {errors.phone && (
    <p id="phone-error" className="text-sm text-red-600 mt-1" role="alert">
      {errors.phone.message}
    </p>
  )}
</div>
```

## 8. Bad Examples
```tsx
// Bad: No label, placeholder used as label, error not linked
<input type="text" placeholder="Phone Number" className={errors.phone ? 'border-red-500' : ''} />
{errors.phone && <span className="text-red-500">Error</span>}
```

## 9. Code Snippets
```tsx
// Fieldset example for Radio group
<fieldset>
  <legend className="text-lg font-semibold">Job Type Preference</legend>
  <div className="flex items-center">
    <input type="radio" id="fulltime" name="jobtype" value="fulltime" />
    <label htmlFor="fulltime" className="ml-2">Full-time</label>
  </div>
  <div className="flex items-center">
    <input type="radio" id="parttime" name="jobtype" value="parttime" />
    <label htmlFor="parttime" className="ml-2">Part-time</label>
  </div>
</fieldset>
```

## 10. Accessibility Rationale
Clear labels and error messaging are critical for users with cognitive impairments or learning disabilities. Screen readers rely on programmatic associations (`htmlFor`, `aria-describedby`) to announce errors accurately when users are focused on an input.

## 11. Testing Methods
- **Screen Reader Navigation**: Tab through the form. Does the screen reader read the label, the input type, the required state, and any helper/error text?
- **Cognitive Walkthrough**: Ask someone unfamiliar with the platform to intentionally cause errors and try to recover.

## 12. Developer Checklist
- [ ] Do all inputs have associated `<label>` tags?
- [ ] Are groups of inputs wrapped in `<fieldset>` and `<legend>`?
- [ ] Are errors linked via `aria-describedby`?
- [ ] Do inputs utilize `autocomplete`?
