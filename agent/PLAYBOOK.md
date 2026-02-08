# Agent Playbook

## Purpose
Provide a lean, testable, resumable workflow for agentic coding so work can restart from cold context with minimal ambiguity.

## Operating Principles
- Spec-first delivery.
- Clarify before coding.
- Ship the smallest valuable iteration.
- Keep context clean through delegation.
- Preserve decisions and state for easy resume.

## Iteration Loop

### 0) Session Bootstrap (Cold Start)
1. Read `agent/state/CURRENT_STATE.md`.
2. Read `agent/state/PREFERENCES.md`.
3. Open the newest spec in `agent/specs/`.
4. Summarize current objective, status, and risks.

Exit criteria:
- Current objective stated.
- Next candidate SVI identified.
- Unknowns listed.

### 1) Spec Drafting
Create a new spec from `agent/templates/SPEC_TEMPLATE.md`.

Requirements:
- Business value tied to user outcome.
- Acceptance criteria written as observable checks.
- SVI defined to be completable in one focused pass.
- Explicit out-of-scope list.

Exit criteria:
- Spec has no empty required sections.
- Acceptance criteria are testable.

### 2) Clarification Gate (Mandatory)
Ask targeted questions for every unresolved decision that affects scope, UX, API, data model, or testing.

Rules:
- Do not begin implementation until answers are received or user approves assumptions.
- If assumptions are needed, mark them in the spec and request confirmation.

Exit criteria:
- Open questions resolved or explicitly deferred.

### 3) Delegation Plan (Sub-Agents)
Break work into focused tracks when beneficial:
- Planning/architecture
- Implementation
- Validation/testing
- Documentation/release notes

For each track, capture:
- Goal
- Inputs
- Expected output
- Owner (sub-agent role)

Exit criteria:
- Clear handoff boundaries.
- No overlapping ownership.

### 4) Build the SVI
Implement only what is needed for current acceptance criteria.

Rules:
- Avoid speculative architecture.
- Keep changes small and reviewable.
- Update docs/tests with code.

Exit criteria:
- Acceptance criteria covered.
- No unrelated refactors.

### 5) Validation
Run checks mapped directly to criteria.

Validation format:
- Command
- Expected result
- Actual result
- Pass/fail

Exit criteria:
- All criteria have evidence.
- Failures documented with follow-up tasks.

### 6) State & Memory Update
Before closing the iteration:
1. Update `agent/state/CURRENT_STATE.md` with:
   - What shipped
   - What is next
   - Risks/blockers
2. Update `agent/state/PREFERENCES.md` if user corrected behavior.
3. Link commit/PR references in the active spec.

Exit criteria:
- A new agent can resume from state files alone.

## Quality Gates Checklist
- [ ] Spec exists and is current.
- [ ] Business value is explicit.
- [ ] Acceptance criteria are testable.
- [ ] Clarifying questions asked and answered/deferred.
- [ ] SVI delivered.
- [ ] Evidence-based validation recorded.
- [ ] State files updated.
- [ ] Preference changes captured.

## Naming Conventions
- Specs: `agent/specs/YYYY-MM-DD-<short-title>.md`
- One iteration per spec unless user requests otherwise.

## Anti-Patterns to Avoid
- Jumping into code before clarification.
- Large multi-feature batches.
- Untracked assumptions.
- Finishing without updating resume state.
