# Interoperability assurance statement

Castodia uses web/API and database boundaries internally, but this repository does not currently evidence conformance to a specific NHS interoperability profile. DTAC evidence must therefore distinguish existing capability from future or customer-specific integration work.

## Current position

Castodia is designed as a multi-product platform with explicit application/API boundaries and a shared data layer. No claim is made here that the product currently implements NHS FHIR APIs, UK Core profiles, NHS Number verification, PDS, GP Connect, MESH, Spine services or another NHS national integration unless corresponding implementation and conformance evidence is present in the repository and production assurance pack.

## Integration principles

New integrations must:

- use documented, versioned interfaces;
- authenticate and authorise both system and user contexts appropriately;
- validate inputs and reject malformed/untrusted data;
- preserve provenance where clinical/care information is imported or transformed;
- define retry, timeout, duplicate/idempotency and partial-failure behaviour;
- log integration metadata without unnecessary sensitive payloads;
- document data ownership, reconciliation and the authoritative source;
- be included in clinical-safety and DPIA review where relevant.

## Standards assessment

For every commissioned NHS integration, record the applicable standard/profile, version, implementation guide, conformance method, test environment, test evidence and known deviations. Use NHS England standards and UK Core where they actually apply; do not implement FHIR solely to create a compliance claim when the target interface uses a different mandated standard.

## Data portability

Where customers require export or transition support, exports should use documented field definitions, stable identifiers where lawful/appropriate, clear timestamps and sufficient context to interpret records. Export must preserve organisation boundaries and access controls.

## Future evidence

When interoperability features are added, this document should link directly to interface specifications, automated contract tests, conformance results and operational monitoring/runbooks for each integration.