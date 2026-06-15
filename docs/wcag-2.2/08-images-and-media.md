# 08: Images and Media

## 1. Purpose
To provide equivalent text and audio alternatives for visual and multimedia content.

## 2. Scope
Images, icons, SVGs, audio, video, charts, and graphs.

## 3. MUST Rules
- MUST provide descriptive `alt` text for all informative images.
- MUST provide empty `alt=""` for all decorative images so screen readers ignore them.
- MUST provide textual descriptions or data tables for charts and complex graphs.
- MUST ensure UI icons (like a magnifying glass for search) have an accessible name (via `aria-label` or visually hidden text).
- MUST provide captions for all pre-recorded videos.
- MUST provide controls to pause, stop, and adjust volume for video/audio content.

## 4. MUST NOT Rules
- MUST NOT use `alt="image"` or `alt="picture of"`; screen readers already announce the element as an image.
- MUST NOT autoplay audio or video.

## 5. SHOULD Rules
- SHOULD provide a full text transcript for audio/video content.
- SHOULD provide audio descriptions for visual information in videos.

## 6. SHOULD NOT Rules
- SHOULD NOT hide essential information solely inside an image or video without a text fallback.

## 7. Recommended Examples
```tsx
// Good: Informative image
<img src="/company-logo.png" alt="TechCorp Solutions Logo" />

// Good: Decorative image
<img src="/background-swoosh.png" alt="" aria-hidden="true" />

// Good: Icon button
<button aria-label="Search Jobs" className="p-2">
  <SearchIcon aria-hidden="true" />
</button>
```

## 8. Bad Examples
```tsx
// Bad: Missing alt attribute (screen reader might read the filename)
<img src="/12345_profile.jpg" />

// Bad: Redundant text
<img src="/cat.png" alt="Image of a cat" />
```

## 9. Code Snippets
```tsx
// Complex Chart Alternative
<div>
  {/* The visual chart */}
  <div aria-hidden="true">
    <LineChart data={salaryData} />
  </div>
  
  {/* Visually hidden table for screen readers */}
  <table className="sr-only">
    <caption>Average Salary by Experience Level</caption>
    <thead>
      <tr>
        <th scope="col">Years of Experience</th>
        <th scope="col">Average Salary (VND)</th>
      </tr>
    </thead>
    <tbody>
      {salaryData.map(row => (
        <tr key={row.years}>
          <td>{row.years}</td>
          <td>{row.salary}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

## 10. Accessibility Rationale
Blind users cannot see images; they rely on text alternatives. Deaf users cannot hear video audio; they rely on captions. By providing alternatives, multimedia content is accessible to everyone.

## 11. Testing Methods
- **Disable Images**: Turn off images in the browser. Does the page still make sense?
- **Screen Reader Check**: Verify that decorative images are ignored and icons are announced correctly.

## 12. Developer Checklist
- [ ] Do informative images have descriptive `alt` text?
- [ ] Do decorative images have `alt=""` and `aria-hidden="true"`?
- [ ] Do videos have captions and pause controls?
- [ ] Do charts have text/table alternatives?
