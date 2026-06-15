# 21: Definition of Done

## 1. Purpose
To formalize the criteria that a feature or user story must meet regarding accessibility before it can be considered "Done" and ready for production.

## 2. Scope
Agile team workflow, Jira/Trello tickets, QA sign-off.

## 3. MUST Rules
- MUST include WCAG 2.2 AA compliance as a non-negotiable criterion in the overall Definition of Done.
- MUST require 0 Critical and 0 Serious accessibility issues reported by automated tools (axe).
- MUST require manual keyboard testing sign-off.
- MUST require 200% zoom testing sign-off.
- MUST require a minimum Accessibility Score of 95 (if using a scoring tool like Lighthouse).

## 4. MUST NOT Rules
- MUST NOT consider a ticket "Done" if visual design is complete but accessibility is broken (e.g., missing focus rings).
- MUST NOT push accessibility bug fixes to a "future sprint" unless it is an edge-case minor issue.

## 5. SHOULD Rules
- SHOULD include screen reader testing (NVDA/VoiceOver) for all complex, highly interactive features (like the CV Builder).

## 6. SHOULD NOT Rules
- SHOULD NOT allow PMs or stakeholders to override the accessibility Definition of Done to ship faster.

## 7. Recommended Examples
```markdown
### Definition of Done (DoD)
- [ ] Code is peer-reviewed and merged.
- [ ] Unit/Integration tests pass.
- [ ] Feature is visually aligned with Figma designs.
- [ ] **Accessibility: 0 Critical/Serious axe violations.**
- [ ] **Accessibility: 100% Keyboard operable (no traps, visible focus).**
- [ ] **Accessibility: Layout holds at 200% zoom / 320px width.**
- [ ] **Accessibility: Lighthouse Accessibility Score >= 95.**
- [ ] QA has signed off.
```

## 8. Bad Examples
```markdown
### Definition of Done
- [ ] Works on my machine.
- [ ] Looks like the design.
- [ ] (Accessibility to be handled in Phase 2). // BAD: Accessibility is not a Phase 2 feature.
```

## 9. Accessibility Rationale
If accessibility is not explicitly in the Definition of Done, it gets treated as a "nice to have" or a bug to be fixed later. Defining it as mandatory ensures the platform is born accessible and stays accessible.

## 10. Testing Methods
- **Agile Review**: During Sprint Review or QA verification, explicitly ask to see the keyboard flow or axe results.

## 11. Developer Checklist
- [ ] Is the DoD documented clearly in the team's wiki/Jira?
- [ ] Is the DoD enforced during sprint planning and sign-off?
