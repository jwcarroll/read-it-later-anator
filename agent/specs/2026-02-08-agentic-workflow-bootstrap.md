# Spec: Agentic Workflow Bootstrap

- **Date**: 2026-02-08
- **Owner**: agent
- **Status**: Approved

## 1) Problem Statement
The project lacks durable operating instructions for how an agent should plan, clarify, execute, and resume work across sessions.

## 2) Business Value
- Primary user impact: predictable delivery quality through specification-first execution.
- Secondary impact: lower rework and fewer misunderstandings by forcing clarification before coding.
- Why now: implementation is about to begin and needs a reliable operating system.

## 3) Scope
### In Scope
- Create repository-level agent instructions.
- Define a reusable specification template with testable criteria.
- Create resumable state and preference memory files.
- Define lean iteration and delegation guidelines.

### Out of Scope
- Product feature implementation.
- Automation scripts for orchestration.
- CI enforcement of process rules.

## 4) Smallest Valuable Iteration (SVI)
Deliver a complete markdown-based operating framework that any new agent session can follow immediately without prior context.

## 5) Acceptance Criteria (Testable)
- [x] AC1:
  - **Given** a new agent session
  - **When** the agent opens `AGENTS.md`
  - **Then** it can find required workflow steps and references to detailed process/state files.
  - **Verification**: inspect `AGENTS.md` for workflow + file map references.

- [x] AC2:
  - **Given** the need to create a new unit of work
  - **When** the agent uses the provided spec template
  - **Then** the template includes business value, testable acceptance criteria, clarifying questions, and delegation planning sections.
  - **Verification**: inspect `agent/templates/SPEC_TEMPLATE.md` sections.

- [x] AC3:
  - **Given** a cold start
  - **When** the agent checks state files
  - **Then** it can identify current status, next step, and stored user preferences.
  - **Verification**: inspect `agent/state/CURRENT_STATE.md` and `agent/state/PREFERENCES.md`.

## 6) Clarifying Questions (Mandatory)
- [x] Q1: Should workflow be captured as repository-local markdown so future sessions can continue seamlessly? (Inferred yes from request.)
- [x] Q2: Should user behavior corrections be persisted explicitly? (Inferred yes from request.)

## 7) Assumptions (Must be approved or explicitly deferred)
- A1: Markdown-based process docs are sufficient for initial workflow encapsulation.
- A2: Sub-agent orchestration is represented as a planning structure/documentation standard, not tool-specific runtime automation.

## 8) Delegation Plan (Sub-Agents)
| Track | Goal | Inputs | Output | Owner |
|---|---|---|---|---|
| Planning | Define lean lifecycle and gates | User requirements | `agent/PLAYBOOK.md` | planning sub-agent |
| Implementation | Create instruction + template + state files | Plan output | Markdown artifacts | implementation sub-agent |
| Validation | Verify artifacts contain required sections | Created files | checklist evidence | validation sub-agent |
| Documentation | Ensure discoverability via AGENTS index | All artifacts | `AGENTS.md` file map | documentation sub-agent |

## 9) Execution Notes
- Decision log:
  - Used a single top-level `agent/` namespace to keep process assets centralized.
  - Added explicit quality gates to reduce drift from user preferences.
- Links to commits/PRs:
  - Commit: pending
  - PR: pending

## 10) Validation Evidence
| Acceptance Criterion | Command/Check | Result | Status |
|---|---|---|---|
| AC1 | `sed -n '1,220p' AGENTS.md` | Workflow and file map present | Pass |
| AC2 | `sed -n '1,260p' agent/templates/SPEC_TEMPLATE.md` | Required sections present | Pass |
| AC3 | `sed -n '1,240p' agent/state/CURRENT_STATE.md && sed -n '1,220p' agent/state/PREFERENCES.md` | Resume and preference memory present | Pass |

## 11) Follow-Ups
- Next SVI: Create first product-feature spec using the template.
- Deferred items: Optional automation to enforce this workflow in CI.
