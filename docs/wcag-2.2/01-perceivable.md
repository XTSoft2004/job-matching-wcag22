# 01: Perceivable

## 1. Purpose
To ensure that information and user interface components are presentable to users in ways they can perceive (e.g., users must be able to see or hear the content).

## 2. Scope
Covers text alternatives, time-based media, adaptability, and distinguishability (contrast, spacing).

## 3. MUST Rules
- MUST provide text alternatives (`alt` text) for all non-text content.
- MUST provide captions for all pre-recorded audio content in synchronized media.
- MUST ensure a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.
- MUST ensure UI components and graphical objects have a contrast ratio of at least 3:1 against adjacent colors.
- MUST ensure content is not restricted to a single display orientation.

## 4. MUST NOT Rules
- MUST NOT use color as the only visual means of conveying information, indicating an action, or distinguishing a visual element.
- MUST NOT use images of text instead of actual text, except for logos.

## 5. SHOULD Rules
- SHOULD provide audio descriptions for pre-recorded video content.
- SHOULD design components so that text can be resized up to 200% without assistive technology and without loss of content.

## 6. SHOULD NOT Rules
- SHOULD NOT set fixed heights on containers that prevent text from wrapping and expanding when zoomed.

## 7. Recommended Examples
```tsx
// Good: Information conveyed by both color and text/icon
<div className="flex items-center text-red-700 bg-red-100 p-4 rounded" role="alert">
  <ErrorIcon className="mr-2" aria-hidden="true" />
  <span>Error: Password must be at least 8 characters.</span>
</div>
```

## 8. Bad Examples
```tsx
// Bad: Information conveyed by color alone
<div className="text-red-500">
  Password must be at least 8 characters.
</div>
```

## 9. Code Snippets
```tsx
// Correct Image usage in Next.js
import Image from 'next/image';

export default function ProfileAvatar({ user }) {
  return (
    <Image 
      src={user.avatarUrl} 
      alt={`Profile picture of ${user.name}`} 
      width={48} 
      height={48} 
    />
  );
}
```

## 10. Accessibility Rationale
Blind users rely on text alternatives via screen readers. Low-vision users need high contrast and the ability to resize text. Colorblind users need non-color indicators (like underlines or icons) to understand states.

## 11. Testing Methods
- **Contrast Checkers**: Use the WebAIM contrast checker or Chrome DevTools.
- **Screen Reader Check**: Verify alt text is read aloud.
- **Zoom Test**: Use `Ctrl/Cmd + +` to zoom to 200%. Check for overlapping or clipped text.

## 12. Developer Checklist
- [ ] Do all informative images have descriptive `alt` text?
- [ ] Do decorative images have `alt=""`?
- [ ] Does all text meet the 4.5:1 contrast requirement?
- [ ] Are form errors indicated by text/icons, not just red borders?
