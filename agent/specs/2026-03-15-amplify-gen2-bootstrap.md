# Spec: Amplify Gen 2 Infra Bootstrap (TypeScript)

- **Date**: 2026-03-15
- **Owner**: agent
- **Status**: Done

## 1) Problem Statement
The repository lacks AWS Amplify Gen 2 scaffolding, so there is no standardized infra entrypoint for local cloud sandboxing/deploy, and no Amplify hosting pipeline definition for the current frontend artifact.

## 2) Business Value
- Primary user impact: enables immediate, low-risk infra bootstrap so teams can provision Amplify environments and host the current frontend artifact without waiting for auth/data feature migration.
- Secondary impact: creates a stable seam for future incremental adoption of Amplify-managed resources.
- Why now: user requested infra-first bootstrap before feature migration.

## 3) Scope
### In Scope
- Add root-level Amplify Gen 2 TypeScript scaffold under `amplify/`.
- Add environment-aware backend config metadata (no auth/data resources yet).
- Add Amplify Hosting config aligned to current static frontend artifact flow.
- Add root npm scripts for `ampx sandbox` and `ampx deploy` workflows.
- Document artifact origin and Amplify hosting behavior.

### Out of Scope
- Auth, data, storage, or function resource migration.
- Frontend framework migration or runtime behavior changes.
- CI provider migration beyond adding Amplify build spec file.

## 4) Smallest Valuable Iteration (SVI)
Create a minimal but runnable Amplify Gen 2 scaffold with deploy/sandbox scripts and CI hosting config that serves the current `frontend/` static artifact as-is.

## 5) Acceptance Criteria (Testable)
- [x] AC1:
  - **Given** repo root
  - **When** an engineer inspects infra files
  - **Then** an Amplify Gen 2 TypeScript backend entrypoint exists with environment-aware output metadata and no app resources.
  - **Verification**: `cat amplify/backend.ts`

- [x] AC2:
  - **Given** repo root
  - **When** an engineer inspects automation files
  - **Then** root npm scripts include local sandbox and cloud deploy commands using `ampx`.
  - **Verification**: `cat package.json`

- [x] AC3:
  - **Given** Amplify Hosting build pipeline
  - **When** `amplify.yml` is used
  - **Then** it publishes the static frontend artifact from `frontend/` with clear preBuild/build steps.
  - **Verification**: `cat amplify.yml`

- [x] AC4:
  - **Given** project docs
  - **When** setup is reviewed
  - **Then** docs explain artifact source and how Amplify hosts it in this infra-only phase.
  - **Verification**: `cat README.md`

## 6) Clarifying Questions (Mandatory)
- [x] Q1: Should this iteration include auth/data resources? **Answer**: No; explicitly deferred by user (“infra-only bootstrap first”).
- [x] Q2: What frontend artifact should Amplify host right now? **Answer**: Current static frontend from `frontend/`.
- [x] Q3: Should deploy scripts be root-level npm scripts? **Answer**: Yes; explicitly requested by user.

## 7) Assumptions (Must be approved or explicitly deferred)
- A1: Existing web app artifact for this phase is a static bundle/files in `frontend/` and does not require SSR/runtime hosting.
- A2: Root package scripts can be introduced even if broader app package structure is still evolving.

## 8) Delegation Plan (Sub-Agents)
| Track | Goal | Inputs | Output | Owner |
|---|---|---|---|---|
| Planning | Define minimal infra-only bootstrap boundaries | User request + repo docs | Scoped SVI | agent |
| Implementation | Add Amplify scaffold/scripts/config/docs | Spec + existing repo | New/updated files | agent |
| Validation | Verify files/commands | Implemented files | Evidence table | agent |
| Documentation | Capture state update | Spec + changes | Updated state snapshot | agent |

## 9) Execution Notes
- Decision log:
  - Keep backend empty (no resources) and emit branch/environment metadata only.
  - Use `frontend/` as Amplify artifact base directory for static hosting.
- Links to commits/PRs:
  - Commit: pending
  - PR: pending (to be filled after commit/PR creation)

## 10) Validation Evidence
| Acceptance Criterion | Command/Check | Result | Status |
|---|---|---|---|
| AC1 | `cat amplify/backend.ts` | backend entrypoint present with env-aware bootstrap output and no resources | pass |
| AC2 | `cat package.json` | root scripts include `ampx:sandbox` and `ampx:deploy` | pass |
| AC3 | `cat amplify.yml` | CI config publishes `frontend/` artifact with preBuild/build phases | pass |
| AC4 | `cat README.md` | docs describe static artifact source and Amplify hosting flow | pass |

## 11) Follow-Ups
- Next SVI: Add first Amplify-managed backend capability (likely auth) once requirements are specified.
- Deferred items: Data model/resource migration, API integration, frontend runtime migration.
