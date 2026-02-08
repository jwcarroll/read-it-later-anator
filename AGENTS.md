# AGENTS.md

This file defines the default operating workflow for any agent working in this repository.

## Core Rule: Spec First, Then Build
Before any implementation work begins, create or update a specification in `agent/specs/`.

A valid specification must include:
1. Problem statement
2. Business value
3. Scope (in / out)
4. Testable acceptance criteria
5. Smallest valuable iteration (SVI)
6. Open questions / assumptions

Do not implement until clarifying questions are asked and answered (or explicitly deferred by the user).

## Required Workflow
1. Read `agent/PLAYBOOK.md`.
2. Create a new spec from `agent/templates/SPEC_TEMPLATE.md`.
3. Ask clarifying questions from the spec's "Open Questions" section.
4. Execute one smallest valuable iteration.
5. Update `agent/state/CURRENT_STATE.md`.
6. Record the user preference delta in `agent/state/PREFERENCES.md` when corrected.

## Cold Start Recovery
At the start of each session, review in order:
1. `agent/state/CURRENT_STATE.md`
2. Latest spec in `agent/specs/`
3. `agent/state/PREFERENCES.md`

## Sub-Agent Delegation Policy
When possible, split work into focused sub-agent tasks (planning, implementation, validation, documentation).
Capture delegation plans and outputs in the active spec's "Execution Notes" section.

## File Map
- `agent/PLAYBOOK.md` — end-to-end workflow and quality gates.
- `agent/templates/SPEC_TEMPLATE.md` — reusable spec template.
- `agent/state/CURRENT_STATE.md` — resumable project snapshot.
- `agent/state/PREFERENCES.md` — user preference memory.
- `agent/specs/` — timestamped specs for each iteration.
