# 18: Recruitment Platform Rules

## 1. Purpose
To define specific accessibility implementations for key features and screens within the Vietnamese recruitment platform.

## 2. Scope
Home Page, Job Search, Job/Company Details, Auth/Registration, CV Builder, Resume Upload, Dashboards (Candidate, Employer, Admin), Notifications, Chat, and Profile Settings.

## 3. Specific Screen Rules

### Job Search & Filters
- **MUST**: The search input must act as a combobox/autocomplete, announcing suggestions to screen readers.
- **MUST**: Filter groups (Location, Salary) must be wrapped in `<fieldset>` with a `<legend>`.
- **MUST**: Dynamically updating job result counts must be announced via an `aria-live="polite"` region.

### CV Builder & Resume Upload
- **MUST**: Drag-and-drop file upload zones MUST have an alternative "Browse Files" button that is keyboard accessible.
- **MUST**: The CV Builder interface (adding work experience dynamically) must manage focus. When a new "Experience" block is added, focus should move to the first input of that new block.
- **MUST**: Expose upload progress and success/error states to screen readers.

### Authentication & Registration
- **MUST**: Password fields MUST have a toggle to show/hide the password for cognitive accessibility. The toggle button must have an `aria-label` (e.g., "Show password" / "Hide password").
- **MUST**: Clear inline validation for password strength requirements.

### Job & Company Detail Pages
- **MUST**: Utilize strict heading hierarchy. `<h1>` for Job Title, `<h2>` for sections like "Requirements", "Benefits".
- **MUST**: Complex benefit icons MUST have text labels or `aria-label`.

### Dashboards & Data Tables
- **MUST**: Applications tables must use semantic `<table>`, `<th>`, `<tr>`. Actions (View, Reject) must be accessible buttons.
- **MUST**: Pagination controls must indicate the current page (`aria-current="page"`) and have accessible names for Next/Prev buttons.

### Notifications & Chat
- **MUST**: Incoming chat messages and critical notifications must be announced using `aria-live` or `role="status"`.
- **MUST**: Chat interfaces must trap focus sensibly when a chat window is open, without preventing the user from returning to the main application.

## 4. MUST NOT Rules
- MUST NOT use complex canvas-based CV rendering unless an accessible HTML alternative is provided.
- MUST NOT hide the "Apply" button dynamically without announcing the change.

## 5. SHOULD Rules
- SHOULD provide a summary of applied filters at the top of the job search results.

## 6. SHOULD NOT Rules
- SHOULD NOT auto-refresh job search results periodically without user consent, as it disorients screen reader users.

## 7. Recommended Examples
```tsx
// Good: Drag and drop upload with keyboard fallback
<div 
  className="border-dashed border-2 p-8 text-center"
  onDrop={handleDrop}
  onDragOver={handleDragOver}
>
  <p>Drag and drop your CV here, or</p>
  <input 
    type="file" 
    id="cv-upload" 
    className="sr-only" 
    onChange={handleFileSelect} 
    accept=".pdf,.doc,.docx"
  />
  <label 
    htmlFor="cv-upload" 
    className="btn-primary cursor-pointer inline-block mt-2"
    tabIndex={0}
    onKeyDown={(e) => { if(e.key === 'Enter') document.getElementById('cv-upload').click(); }}
  >
    Browse Files
  </label>
</div>
```

## 8. Bad Examples
```tsx
// Bad: Drag and drop only, inaccessible to keyboard/mobile
<div onDrop={handleDrop}>Drag your CV here</div>
```

## 9. Code Snippets
```tsx
// Announcing job search results
<div aria-live="polite" className="sr-only">
  {isLoading ? 'Searching for jobs...' : `Found ${results.length} jobs matching your criteria.`}
</div>
```

## 10. Accessibility Rationale
Recruitment platforms are highly form-heavy and interactive. Ensuring complex flows like CV building and job filtering are accessible ensures users with disabilities can independently seek employment.

## 11. Developer Checklist
- [ ] Does the Job Search form announce result changes dynamically?
- [ ] Is the File Upload component keyboard accessible?
- [ ] Can users complete the entire Application flow without a mouse?
- [ ] Are password visibility toggles accessible?
