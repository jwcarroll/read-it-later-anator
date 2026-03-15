# Amplify Hosting Source of Truth

This repository currently ships a static frontend artifact from `frontend/`.

Amplify Hosting publishes that folder directly (configured in `amplify.yml`) during this infra-only bootstrap phase.
No SSR/runtime compute hosting is configured yet.

## Do we need `amplify.yml`?

Yes. This repo keeps `amplify.yml` in source control so Amplify Hosting build/publish behavior is explicit and reviewable.
