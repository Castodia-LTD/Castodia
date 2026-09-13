# Accessibility assurance standard

Castodia should target WCAG 2.2 AA for web experiences and equivalent accessible interaction for native wrappers. This document defines the engineering standard; it is not an accessibility-conformance claim.

## Engineering requirements

New and changed user interfaces should provide semantic structure, keyboard operation, visible focus, meaningful labels and instructions, sufficient colour contrast, non-colour-only status communication, accessible validation/errors, scalable text, sensible zoom/reflow, descriptive link/button names and appropriate ARIA only where native semantics are insufficient.

Interactive controls must remain usable with keyboard-only navigation and common assistive technologies. Dynamic updates that materially affect the task should be announced appropriately. Touch targets and mobile layouts should support users with limited dexterity.

## Care-specific usability risks

Accessibility testing should prioritise workflows where omission or misreading could affect care, including person selection, risk/care-plan information, medication-related records, timeline entries, forms, alerts, goals/outcomes, rota information and sign-in/account recovery.

## Test evidence

Before an NHS production assurance claim is made, retain evidence of:

- automated accessibility checks as a supporting control;
- manual keyboard testing;
- screen-reader testing on representative journeys;
- text zoom/reflow testing;
- colour/contrast review;
- error identification and recovery testing;
- independent or suitably competent WCAG 2.2 AA audit;
- remediation decisions and retest evidence.

Automated tooling alone cannot establish WCAG conformance.

## Accessibility statement

A public accessibility statement should identify the service, target standard, known non-conformities, workarounds where appropriate, contact route for accessibility problems, enforcement information and the date/method of the latest assessment. It must describe the actual tested state rather than a desired state.

## Definition of done

A UI change is not complete if it introduces a known serious accessibility barrier without an explicit risk decision, owner and remediation plan. Material accessibility defects affecting safety-relevant workflows should also be considered in the clinical hazard process.