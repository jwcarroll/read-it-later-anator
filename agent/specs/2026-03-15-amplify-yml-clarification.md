# Spec: Amplify `amplify.yml` Clarification and Tightening

- **Date**: 2026-03-15
- **Owner**: agent
- **Status**: Done

## 1) Problem Statement
The previous Amplify bootstrap introduced `amplify.yml`, but review feedback indicates uncertainty about whether this file is supposed to exist and when it is required.

## 2) Business Value
- Primary user impact: removes ambiguity for engineers onboarding Amplify Hosting in this repository.
- Secondary impact: reduces deployment misconfiguration risk by documenting responsibility boundaries between Amplify backend deploy and Amplify Hosting build.
- Why now: reviewer explicitly asked whether `amplify.yml` should be present.

## 3) Scope
### In Scope
- Clarify in docs that `amplify.yml` is expected for Amplify Hosting build/deploy customization.
- Add concise, explicit comments in `amplify.yml` indicating purpose and artifact source.
- Keep infra-only bootstrap boundaries explicit (no auth/data migration).

### Out of Scope
- Any backend resource additions (auth/data/storage/functions).
- Changes to hosting artifact location or runtime model.
- Build pipeline redesign.

## 4) Smallest Valuable Iteration (SVI)
Provide unambiguous in-repo guidance answering “yes, this repo intentionally includes `amplify.yml` for hosting” and explain exactly what it controls.

## 5) Acceptance Criteria (Testable)
- [x] AC1:
  - **Given** project docs
  - **When** an engineer checks Amplify bootstrap guidance
  - **Then** it explicitly states whether `amplify.yml` should exist and why.
  - **Verification**: `cat README.md`

- [x] AC2:
  - **Given** `amplify.yml`
  - **When** an engineer opens the file
  - **Then** purpose and artifact base directory are self-evident from comments/config.
  - **Verification**: `cat amplify.yml`

## 6) Clarifying Questions (Mandatory)
- [x] Q1: Is `amplify.yml` expected in this repo? **Answer**: Yes for Amplify Hosting customization; this iteration makes that explicit.
- [x] Q2: Should this iteration change hosting behavior or only clarify it? **Answer**: Clarify only; keep behavior stable.

## 7) Assumptions (Must be approved or explicitly deferred)
- A1: Reviewer concern is documentation/intent clarity, not a request to remove Amplify Hosting integration.
- A2: Existing hosting behavior (`frontend/` artifact) should remain unchanged.

## 8) Delegation Plan (Sub-Agents)
| Track | Goal | Inputs | Output | Owner |
|---|---|---|---|---|
| Planning | Bound the follow-up to clarity only | Review feedback + existing files | Minimal scope | agent |
| Implementation | Update docs/config comments | README + amplify.yml | Clear guidance | agent |
| Validation | Verify rendered guidance | Updated files | Evidence entries | agent |
| Documentation | Update resumable state | Iteration summary | Current state refresh | agent |

## 9) Execution Notes
- Decision log:
  - Keep `amplify.yml` and clarify it is the Amplify Hosting build spec.
  - Preserve artifact output as `frontend/`.
- Links to commits/PRs:
  - Commit: pending
  - PR: pending

## 10) Validation Evidence
| Acceptance Criterion | Command/Check | Result | Status |
|---|---|---|---|
| AC1 | `cat README.md` | README explicitly explains why `amplify.yml` exists | pass |
| AC2 | `cat amplify.yml` | file includes purpose comments and frontend artifact context | pass |

## 11) Follow-Ups
- Next SVI: Validate hosting build in a real Amplify app environment with credentials.
- Deferred items: backend resource migration.
