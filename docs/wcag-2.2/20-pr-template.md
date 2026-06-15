# 20: Pull Request Template

## 1. Purpose
To ensure accessibility is verified by the developer before code is submitted for review, making accessibility a core part of the development lifecycle.

## 2. Scope
This template should be included in the repository as `.github/pull_request_template.md` (or equivalent).

## 3. MUST Rules
- MUST require developers to check off accessibility requirements before submitting a PR.
- MUST include instructions on how to test the specific UI changes being proposed.

## 4. MUST NOT Rules
- MUST NOT allow PRs to be merged if the accessibility checklist is incomplete or marked N/A without a valid reason.

## 5. SHOULD Rules
- SHOULD encourage linking to specific WCAG rules if the PR addresses an accessibility bug.

## 6. SHOULD NOT Rules
- SHOULD NOT be overly burdensome; it should be a quick verification of standard practices.

## 7. Recommended Examples
```markdown
## Description
<!-- Describe your changes in detail -->

## Related Ticket
<!-- Link to JIRA/Trello/Linear ticket -->

## Accessibility Checklist
<!-- Please verify the following before requesting a review. Check 'N/A' if the PR does not modify the UI. -->

- [ ] My code passes local `jsx-a11y` ESLint checks.
- [ ] I have run axe DevTools on the changed pages and there are 0 critical/serious issues.
- [ ] I have tested the new functionality using **only a keyboard** (Tab, Shift+Tab, Enter, Space, Esc).
- [ ] All new images/icons have appropriate `alt` text or `aria-label`.
- [ ] All new form inputs have associated `<label>` tags and error states are linked via `aria-describedby`.
- [ ] Any new Modals/Drawers successfully trap focus and restore focus when closed.
- [ ] Color contrast for new text and UI elements meets the 4.5:1 (text) or 3:1 (UI) ratio.

## Testing Instructions
<!-- How can the reviewer manually test these changes (specifically accessibility features)? -->
1. Navigate to...
2. Try pressing Tab to...
```

## 8. Code Snippets
See recommended example for the exact Markdown snippet to use.

## 9. Accessibility Rationale
A PR template acts as a final gatekeeper. By forcing developers to acknowledge they have tested with a keyboard and run axe DevTools, the number of accessibility defects reaching QA or Production drops dramatically.

## 10. Developer Checklist
- [ ] Is this template integrated into the repository configuration?
- [ ] Are team members trained on how to truthfully complete the checklist?
