# 11: Responsive and Zoom

## 1. Purpose
To ensure the platform is usable across all screen sizes and that users can zoom the interface without losing content or functionality.

## 2. Scope
Media queries, responsive layouts, 200% zoom, 400% zoom (reflow), and mobile touch interfaces.

## 3. MUST Rules
- MUST support browser zoom up to 200% without loss of content or functionality.
- MUST allow content to reflow into a single column on small screens (or at 400% zoom) to avoid horizontal scrolling.
- MUST ensure interactive elements remain usable when zoomed or stacked.
- MUST keep the viewport meta tag scalable: `<meta name="viewport" content="width=device-width, initial-scale=1" />`.

## 4. MUST NOT Rules
- MUST NOT use `maximum-scale=1` or `user-scalable=no` in the viewport meta tag.
- MUST NOT rely on fixed pixel heights (`h-64`) for text containers; allow them to expand with content.
- MUST NOT require 2D scrolling (horizontal and vertical) for main content reading.

## 5. SHOULD Rules
- SHOULD use CSS Flexbox and Grid, which naturally handle reflow and resizing better than fixed positioning.
- SHOULD use relative units (`rem`, `em`) for typography and spacing.

## 6. SHOULD NOT Rules
- SHOULD NOT hide essential navigation or content on mobile screens; use accessible drawers or menus instead.

## 7. Recommended Examples
```html
<!-- Good: Accessible viewport meta tag -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

```tsx
// Good: Responsive grid that reflows into a single column
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <JobCard />
  <JobCard />
  <JobCard />
</div>
```

## 8. Bad Examples
```html
<!-- Bad: Disabling zoom -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
```

## 9. Code Snippets
```tsx
// Allowing containers to expand with text
// Instead of h-48 (fixed height), use min-h-[12rem] (minimum height)
<div className="min-h-[12rem] p-4 bg-white shadow rounded">
  <h3 className="text-xl font-bold">Software Engineer</h3>
  <p className="text-gray-600 mt-2">
    Long description that might wrap to multiple lines when zoomed...
  </p>
</div>
```

## 10. Accessibility Rationale
Users with low vision often use browser zoom to enlarge text. If the layout is rigid, text overlaps or disappears. If `user-scalable=no` is used, mobile users cannot pinch-to-zoom to read fine print.

## 11. Testing Methods
- **200% Zoom Test**: In Chrome/Edge, press `Ctrl/Cmd + +` until the zoom reaches 200%. Verify all text is readable and buttons are clickable.
- **Reflow Test**: Resize the browser window to 320px wide. Verify that there is no horizontal scrolling required to read text.

## 12. Developer Checklist
- [ ] Is the viewport meta tag scalable?
- [ ] Does the page function correctly at 200% zoom?
- [ ] Does the page reflow to a single column at 320px width?
- [ ] Are text containers flexible in height?
