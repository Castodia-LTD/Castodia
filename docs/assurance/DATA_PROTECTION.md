# Data protection assurance framework

This document records the repository-level controls and the operational evidence Castodia must maintain for DTAC data-protection assurance. It is not a completed DPIA or legal opinion.

## Principles

Castodia must apply UK GDPR and Data Protection Act 2018 principles including lawfulness, fairness and transparency; purpose limitation; data minimisation; accuracy; storage limitation; integrity/confidentiality; and accountability.

## Data-flow documentation

For each production workflow processing personal or special-category data, the organisation should maintain a data-flow record identifying:

- data subjects and data categories;
- source of the data;
- purpose and lawful basis;
- special-category condition where applicable;
- recipients and processors/subprocessors;
- storage locations and international transfers;
- retention/deletion rule;
- access roles and technical controls;
- audit/logging expectations.

Material changes to processing must trigger a DPIA review before release where required.

## Repository controls

Engineering changes must preserve:

- organisation/tenant isolation;
- least-privilege access;
- server-side handling of privileged credentials;
- no service-role keys or production secrets committed to source control;
- RLS/policy testing for sensitive tables;
- explicit authorisation checks on privileged API routes;
- minimisation of personal data in logs and error messages;
- secure deletion/retention behaviour when implemented.

## DPIA checklist

A production DPIA should document the nature, scope, context and purposes of processing; necessity and proportionality; risks to individuals; safeguards and security measures; consultation where appropriate; residual risks; approval and review date.

## Rights and operational procedures

Castodia must have documented processes for access, rectification, erasure where applicable, restriction, objection, portability where applicable, complaint handling and breach response. Technical features should not promise deletion where legal or care-record retention duties require preservation.

## Retention

Retention periods must be defined by record type and customer/legal requirements rather than a single arbitrary platform-wide period. Deletion jobs or UI actions must be traceable to approved retention rules.

## Suppliers and subprocessors

Maintain a current subprocessor register and contractual evidence for services processing personal data. The repository must not claim that a supplier provides a specific certification, residency guarantee or contractual safeguard unless that evidence is current and retained.

## Logging

Production logs should avoid care-record content, credentials, tokens and unnecessary identifiers. Security/audit logs should record sufficient metadata to investigate access and changes without duplicating the sensitive payload.

## Breaches

A suspected personal-data breach must enter the incident-management process immediately, preserve relevant evidence, assess risk to individuals, and support required controller/customer and ICO notification timelines. The repository incident procedure is in `docs/assurance/OPERATIONS_AND_INCIDENTS.md`.