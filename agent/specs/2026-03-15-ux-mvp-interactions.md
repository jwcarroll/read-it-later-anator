# Spec: UX MVP Interactions Documentation

- **Date**: 2026-03-15
- **Owner**: agent
- **Status**: Approved (clarifications deferred by user request to proceed)

## 1) Problem Statement
The repository lacks a dedicated UX interactions document that maps critical MVP user journeys to concrete UI entry points, required API calls, user feedback copy, and manual browser validation checks.

## 2) Business Value
- Primary user impact: engineers and product stakeholders can align quickly on intended MVP UX behavior for authentication, link creation, feed states, and team sharing.
- Secondary impact: reduces ambiguity before frontend/backend implementation by defining expected interaction contracts and failure handling.
- Why now: user explicitly requested a structured document for critical journeys.

## 3) Scope
### In Scope
- Create `docs/UX_MVP_INTERACTIONS.md`.
- Define four journeys: auth, link creation, link feed, team sharing.
- For each journey, include:
  - Entry point UI locations in `frontend/index.html` and `frontend/app.js`.
  - Required API calls across `/api/auth/*`, `/api/links`, `/api/teams`, `/api/workspaces/members`.
  - Success/failure microcopy and user feedback behavior.
  - Manual browser acceptance checks.

### Out of Scope
- Implementing frontend code in `frontend/`.
- Implementing backend API endpoints.
- Wireframing/visual design artifacts.

## 4) Smallest Valuable Iteration (SVI)
Add one standalone UX interactions document with explicit, testable journey definitions that can be used immediately for manual QA and implementation planning.

## 5) Acceptance Criteria (Testable)
- [x] AC1:
  - **Given** a reviewer opens `docs/UX_MVP_INTERACTIONS.md`
  - **When** they read the auth and link creation sections
  - **Then** they can identify entry points, API calls, feedback microcopy, and manual checks.
  - **Verification**: `cat docs/UX_MVP_INTERACTIONS.md`

- [x] AC2:
  - **Given** a reviewer reads the link feed and team-sharing sections
  - **When** they inspect each journey
  - **Then** each section contains required states, success/failure handling, and browser-validatable acceptance checks.
  - **Verification**: `cat docs/UX_MVP_INTERACTIONS.md`

- [x] AC3:
  - **Given** project state files are used for cold-start continuity
  - **When** another agent starts a new session
  - **Then** the latest work is reflected in `agent/state/CURRENT_STATE.md`.
  - **Verification**: `cat agent/state/CURRENT_STATE.md`

## 6) Clarifying Questions (Mandatory)
- [x] Q1: Should the document assume specific selectors/function names for `frontend/index.html` and `frontend/app.js` even though those files are not present yet?
  - Deferred by user (no response in-turn); assumption A1 used.
- [x] Q2: Should API call definitions include nominal HTTP methods and payload/response expectations where helpful?
  - Deferred by user (no response in-turn); assumption A2 used.

## 7) Assumptions (Must be approved or explicitly deferred)
- A1: It is acceptable to define proposed entry point IDs/component zones and handler names as implementation targets for future `frontend/index.html` and `frontend/app.js` files.
- A2: Including practical method/payload expectations improves usefulness even if APIs are not yet implemented.
- A3: Browser acceptance checks can be written as manual steps expected to be executed once frontend exists.

## 8) Delegation Plan (Sub-Agents)
| Track | Goal | Inputs | Output | Owner |
|---|---|---|---|---|
| Planning | Map requested journeys to a repeatable doc structure | User request, repo context | Journey section outline | planning sub-agent |
| Implementation | Author the UX interactions markdown doc | Outline, assumptions | `docs/UX_MVP_INTERACTIONS.md` | implementation sub-agent |
| Validation | Verify required headings/content are present | Created docs + state file | Evidence table entries | validation sub-agent |
| Documentation | Update resume state for next session continuity | Spec + delivered doc | `agent/state/CURRENT_STATE.md` update | documentation sub-agent |

## 9) Execution Notes
- Decision log:
  - Chosen approach is documentation-only, minimizing change cost and preserving existing architecture.
  - Included concrete yet lightweight UI/API contracts to reduce future ambiguity.
- Links to commits/PRs:
  - Commit: pending
  - PR: pending

## 10) Validation Evidence
| Acceptance Criterion | Command/Check | Result | Status |
|---|---|---|---|
| AC1 | `cat docs/UX_MVP_INTERACTIONS.md` | Document includes auth/link creation entry points, API calls, microcopy, and manual checks | Pass |
| AC2 | `cat docs/UX_MVP_INTERACTIONS.md` | Document includes feed/team-sharing states, feedback behavior, and manual checks | Pass |
| AC3 | `cat agent/state/CURRENT_STATE.md` | Current state updated with completed iteration and next steps | Pass |

## 11) Follow-Ups
- Next SVI: Create initial frontend skeleton (`frontend/index.html` + `frontend/app.js`) that matches documented entry points.
- Deferred items: API schema contracts/OpenAPI for each endpoint.
