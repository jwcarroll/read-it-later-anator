# Current State

## Project Snapshot
- **Current Phase**: Amplify Gen 2 infra bootstrap clarification
- **Last Completed Iteration**: Clarified `amplify.yml` intent and hosting responsibility boundaries
- **Active Branch**: work

## Latest Completed Work
- Created `agent/specs/2026-03-15-amplify-yml-clarification.md` to answer review feedback about `amplify.yml`.
- Updated `README.md` to explicitly state that `amplify.yml` is expected for Amplify Hosting CI build/publish behavior.
- Added purpose comments at the top of `amplify.yml` to make ownership and artifact source (`frontend/`) obvious.
- Updated `amplify/frontend/hosting.md` with a direct Q&A confirming why `amplify.yml` is kept in source control.

## Next Recommended Iteration
1. Run a real Amplify Hosting build in AWS to verify the CI spec end-to-end.
2. Decide first backend migration target (auth or data) for Amplify Gen 2 resources.

## Open Risks / Blockers
- This environment does not include configured Amplify app credentials for end-to-end cloud verification.
- Frontend artifact remains static placeholder until actual app build pipeline is introduced.

## Resume Checklist
- Read this file.
- Review `agent/state/PREFERENCES.md`.
- Open newest file in `agent/specs/`.
- Continue from documented Next Recommended Iteration.
