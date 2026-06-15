# 09: Semantic HTML

## 1. Purpose
To ensure the underlying structure of the application conveys meaning and relationships, independently of visual styling.

## 2. Scope
Landmark elements, heading hierarchy, lists, links, buttons, and tables.

## 3. MUST Rules
- MUST use HTML5 landmark elements: `<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<aside>`, `<footer>`.
- MUST use a logical heading hierarchy (`<h1>` to `<h6>`) without skipping levels (e.g., do not jump from `<h1>` to `<h3>`).
- MUST use only one `<h1>` per page.
- MUST use `<button>` for actions (submitting a form, opening a modal) and `<a>` for navigation (changing URLs).
- MUST use semantic table tags (`<table>`, `<th>`, `<tr>`, `<td>`, `<caption>`, `scope`) for tabular data.
- MUST use `<ul>`, `<ol>`, and `<li>` for lists of items.

## 4. MUST NOT Rules
- MUST NOT use generic `<div>` or `<span>` elements for interactive controls.
- MUST NOT use heading tags solely for visual sizing; use CSS classes instead.

## 5. SHOULD Rules
- SHOULD use `<time>` for dates and times.
- SHOULD use `<figure>` and `<figcaption>` for images with captions.

## 6. SHOULD NOT Rules
- SHOULD NOT use tables for page layout.

## 7. Recommended Examples
```tsx
// Good: Semantic Layout
<div className="layout">
  <header>
    <nav aria-label="Main Navigation">...</nav>
  </header>
  <main>
    <h1>Senior Frontend Developer</h1>
    <section aria-labelledby="job-description">
      <h2 id="job-description">Job Description</h2>
      <p>...</p>
    </section>
  </main>
  <footer>...</footer>
</div>
```

## 8. Bad Examples
```tsx
// Bad: Div soup, no semantics
<div className="layout">
  <div className="header">
    <div className="nav">...</div>
  </div>
  <div className="content">
    <div className="h1-style">Senior Frontend Developer</div>
    <div className="section">
      <div className="h2-style">Job Description</div>
      <p>...</p>
    </div>
  </div>
</div>
```

## 9. Code Snippets
```tsx
// Semantic Data Table
<table className="w-full">
  <caption className="sr-only">Recent Applications</caption>
  <thead>
    <tr>
      <th scope="col">Job Title</th>
      <th scope="col">Date Applied</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Senior React Developer</td>
      <td><time dateTime="2023-10-15">Oct 15, 2023</time></td>
      <td>Pending</td>
    </tr>
  </tbody>
</table>
```

## 10. Accessibility Rationale
Semantic HTML automatically provides Name, Role, and Value to screen readers. It allows blind users to navigate by landmarks (e.g., "Jump to main content") or by headings (e.g., "List all headings on this page").

## 11. Testing Methods
- **WAVE Tool**: Run WAVE to check heading structure and landmark usage.
- **Screen Reader Rotor**: Open the rotor/elements list in VoiceOver/NVDA and ensure headings and landmarks are populated logically.

## 12. Developer Checklist
- [ ] Is there exactly one `<h1>` per page?
- [ ] Are headings nested sequentially without skipping levels?
- [ ] Are `<button>` and `<a>` used correctly?
- [ ] Are HTML5 landmarks used (`<header>`, `<main>`, `<footer>`)?
