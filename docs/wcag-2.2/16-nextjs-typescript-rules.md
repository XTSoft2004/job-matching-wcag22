# 16: Next.js & TypeScript Rules

## 1. Purpose
To ensure accessibility principles are seamlessly integrated into the Next.js App Router and TypeScript architecture.

## 2. Scope
App Router layout and pages, Next.js components (`next/image`, `next/link`), Server Components, Client Components, and TypeScript strict mode types.

## 3. MUST Rules
- MUST enforce TypeScript Strict Mode (`"strict": true` in `tsconfig.json`).
- MUST use `<html lang="vi">` (or appropriate language) in the root `layout.tsx`.
- MUST use `next/image` with mandatory `alt` text for optimized, accessible images.
- MUST use `next/link` for internal navigation to ensure pre-fetching and correct `<a>` tag rendering.
- MUST manage focus manually when route changes occur in Single Page Applications (Next.js App Router).
- MUST explicitly define accessible prop types in TypeScript interfaces (e.g., `ariaLabel?: string`).

## 4. MUST NOT Rules
- MUST NOT use standard `<img>` tags unless `next/image` cannot be used; if so, `alt` is still mandatory.
- MUST NOT use Client Components (`"use client"`) unless necessary for state, effects, or DOM event listeners (e.g., `onKeyDown`).
- MUST NOT disable Next.js ESLint accessibility rules.

## 5. SHOULD Rules
- SHOULD leverage Server Components to deliver clean, pre-rendered semantic HTML to the client quickly.
- SHOULD generate static metadata (`title`, `description`) for SEO and screen reader page announcements.

## 6. SHOULD NOT Rules
- SHOULD NOT pass raw HTML strings into `dangerouslySetInnerHTML` without sanitizing and ensuring the resulting DOM is accessible.

## 7. Recommended Examples
```tsx
// Good: TypeScript interface enforcing accessible props
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label': string; // Enforce accessible name for icon buttons
}

export const IconButton = ({ icon, 'aria-label': ariaLabel, ...props }: IconButtonProps) => (
  <button aria-label={ariaLabel} className="p-2 rounded hover:bg-gray-100" {...props}>
    {icon}
  </button>
);
```

## 8. Bad Examples
```tsx
// Bad: Missing alt requirement in type, using standard <img>
interface AvatarProps { src: string; }
export const Avatar = ({ src }: AvatarProps) => <img src={src} />;
```

## 9. Code Snippets
```tsx
// Root Layout Metadata (app/layout.tsx)
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vietnamese Recruitment Platform',
  description: 'Find your dream job with our accessible recruitment platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only">Bỏ qua để đến nội dung chính</a>
        {children}
      </body>
    </html>
  );
}
```

## 10. Accessibility Rationale
Next.js provides excellent built-in tools (like `next/image` enforcing `alt` tags and `next/link` handling navigation semantics). TypeScript helps enforce accessibility at compile time by requiring developers to pass necessary ARIA attributes as props.

## 11. Testing Methods
- **TypeScript Compiler**: Ensure no `any` types are used for DOM nodes or events.
- **ESLint**: Run `next lint` to catch `jsx-a11y` errors.

## 12. Developer Checklist
- [ ] Is `next/image` used with valid `alt` text?
- [ ] Is `next/link` used for all internal routing?
- [ ] Does the `layout.tsx` define a `lang` attribute and metadata?
- [ ] Do custom component types mandate accessible props (`aria-label`, `aria-describedby`) when appropriate?
