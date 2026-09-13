# Operational resilience, backup and incident framework

This document defines the minimum operational evidence expected for a production Castodia deployment. It supplements provider-specific controls and does not claim that backup, monitoring or disaster-recovery exercises have already been completed.

## Incident classes

Incidents should be triaged across: clinical safety, security, privacy/data breach, availability, integrity/data loss, access-control failure, integration failure and accessibility/usability risk. A single incident may belong to multiple classes.

## Incident record

Every material incident should record detection time, reporter/source, affected service and organisations, impact, data/people potentially affected, immediate containment, evidence preserved, decision owner, customer/regulator notification decisions, root cause, corrective actions, completion owner and closure review.

## Escalation

Any incident with credible risk of harm, unauthorised access to care data, cross-tenant exposure, loss/corruption of records or prolonged production unavailability requires immediate escalation to the accountable product/security lead and, where clinically relevant, the Clinical Safety Officer. Personal-data incidents must enter the data-breach assessment process.

## Backup and restore

Production data must have provider-backed backups appropriate to the service. Castodia must retain evidence of configured backup coverage and perform restoration tests on a defined cadence. A successful backup job is not equivalent to a proven restore.

A restore test should record: date, environment, dataset/scope, recovery point achieved, recovery time achieved, integrity checks, issues and remedial actions. Recovery objectives (RPO/RTO) must be agreed and documented for the live service rather than invented in this repository.

## Business continuity and disaster recovery

The operational plan should cover loss of hosting, database unavailability, authentication-provider failure, accidental destructive change, compromised privileged account and loss of a critical third-party service. Manual/contingency care processes remain the responsibility of each deploying organisation and should be agreed during implementation.

## Monitoring

Production monitoring should cover service availability, server/API errors, authentication anomalies, database/provider alerts, deployment failures and security-relevant events. Monitoring must avoid collecting unnecessary care-record content.

## Access reviews

Privileged access to production services, hosting, Supabase, Apple and repository administration should be reviewed on a scheduled basis and when staff/contractors leave or change role. The review record should show account, role, business need, reviewer, decision and date.

## Change and release evidence

Each production release should retain CI evidence, migration list, deployment approver, known risks and rollback/mitigation information. Material incidents and post-incident actions should feed back into tests, documentation, the clinical hazard log and DPIA where relevant.

## External evidence required for DTAC

Before representing operational controls as complete, retain actual provider configuration evidence, restore-test results, incident exercises or real incident records, access-review records, business-continuity test evidence and current contact/escalation details.