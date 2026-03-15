# UX MVP Interactions

## Purpose
Define critical MVP user journeys so frontend and backend implementation can converge on clear UX behavior, API usage, and manual validation steps.

## Assumptions and Constraints
- `frontend/index.html` and `frontend/app.js` are treated as target implementation files for this MVP interaction contract.
- API endpoint paths are fixed to the set requested in this document.
- Feedback should be immediate, explicit, and visible near the action source plus in a global toast region.

---

## 1) Auth Journey

### 1.1 Entry Point UI Location
**`frontend/index.html`**
- Header auth zone: `#auth-controls`.
- Sign-up form modal trigger: `#open-signup`.
- Sign-in form modal trigger: `#open-signin`.
- Sign-out action button in authenticated menu: `#signout-btn`.
- Inline auth error container: `#auth-error`.
- Global feedback/toast region: `#global-feedback`.

**`frontend/app.js`**
- `initAuthControls()` binds click/submit handlers.
- `handleSignUpSubmit(formData)` manages sign-up.
- `handleSignInSubmit(formData)` manages sign-in.
- `handleSignOut()` manages sign-out.
- `renderAuthState(user)` toggles guest vs authenticated UI.

### 1.2 Required API Calls
- `POST /api/auth/signup`
  - Body: `{ email, password, name }`
  - Success: `{ user, token }`
  - Failure examples: `409` (email exists), `400` (validation), `500`.
- `POST /api/auth/signin`
  - Body: `{ email, password }`
  - Success: `{ user, token }`
  - Failure examples: `401` (invalid credentials), `400`, `500`.
- `POST /api/auth/signout`
  - Body: optional or empty.
  - Success: `204` or `{ success: true }`.
  - Failure examples: `401` (already expired), `500`.

### 1.3 Microcopy and Feedback Behavior
- **Sign-up success:** `"Welcome! Your account is ready."`
  - Behavior: close modal, set session token, switch header to authenticated state, show success toast.
- **Sign-up failure (email exists):** `"That email is already registered. Try signing in instead."`
  - Behavior: keep modal open, focus email field, show inline error + error toast.
- **Sign-in success:** `"Signed in successfully."`
  - Behavior: close modal, refresh feed, clear auth errors.
- **Sign-in failure (invalid credentials):** `"Email or password is incorrect."`
  - Behavior: keep modal open, clear password field, announce error in `#auth-error`.
- **Sign-out success:** `"Signed out."`
  - Behavior: clear token/local user state, reset feed section to signed-out view.
- **Sign-out failure:** `"We couldn't sign you out cleanly. Your local session was cleared."`
  - Behavior: clear local session anyway, show warning toast.

### 1.4 Manual Acceptance Checks (Browser)
1. Open Sign Up from `#open-signup`, submit valid user; verify header changes to authenticated UI and success toast appears.
2. Repeat Sign Up with same email; verify inline error appears and modal stays open.
3. Open Sign In from `#open-signin`, submit invalid password; verify password field clears and error copy appears.
4. Submit valid Sign In; verify feed refresh begins and auth errors are cleared.
5. Click `#signout-btn`; verify UI returns to guest state and protected controls are hidden.

---

## 2) Link Creation Journey

### 2.1 Entry Point UI Location
**`frontend/index.html`**
- Link form wrapper: `#link-create-form`.
- URL input: `#link-url-input`.
- Visibility selector (`private|team|workspace`): `#link-visibility-select`.
- Team selector (shown only for `team` visibility): `#link-team-select`.
- Submit button: `#link-submit-btn`.
- Field-level validation container: `#link-form-errors`.

**`frontend/app.js`**
- `initLinkCreationForm()` sets listeners.
- `validateLinkForm({ url, visibility, teamId })` performs client checks.
- `handleCreateLinkSubmit(payload)` calls create API.
- `renderLinkCreateFeedback(result)` handles success/error updates.

### 2.2 Required API Calls
- `POST /api/links`
  - Body:
    - private: `{ url, visibility: "private" }`
    - team: `{ url, visibility: "team", teamId }`
    - workspace: `{ url, visibility: "workspace" }`
  - Success: `201` with created link object.
  - Failure examples: `400` (invalid URL/missing fields), `403` (not allowed for visibility), `409` (duplicate), `500`.
- `GET /api/teams` (for visibility `team` flow; load selector options)
  - Success: list of teams user can post to.
- `GET /api/workspaces/members` (for workspace-context permission hints)
  - Success: membership/role data used to enable/disable workspace visibility option.

### 2.3 Microcopy and Feedback Behavior
- **Client URL validation failure:** `"Enter a valid URL starting with http:// or https://."`
  - Behavior: block submit; highlight `#link-url-input`.
- **Missing team selection for team visibility:** `"Select a team to share this link."`
  - Behavior: block submit; focus `#link-team-select`.
- **Create success:** `"Link saved."` plus visibility context:
  - private: `"Visible only to you."`
  - team: `"Shared with selected team."`
  - workspace: `"Shared with workspace members."`
  - Behavior: reset URL field, keep previous visibility selection, prepend new item to feed.
- **Create failure (authorization):** `"You don't have permission to share with that audience."`
  - Behavior: keep form data intact, show inline + toast error.
- **Create failure (network/server):** `"Couldn't save link right now. Try again."`
  - Behavior: retain form values, re-enable submit button, show retry-friendly toast.

### 2.4 Manual Acceptance Checks (Browser)
1. Submit empty or malformed URL; verify submit is blocked and validation message appears.
2. Select `team` visibility without choosing a team; verify targeted validation message.
3. Submit valid private URL; verify feed prepends new item and success microcopy appears.
4. Submit as workspace visibility with insufficient role; verify authorization-denied message and no feed mutation.
5. Temporarily force API failure (e.g., devtools offline); verify form preserves user input and shows retry message.

---

## 3) Link Feed Journey

### 3.1 Entry Point UI Location
**`frontend/index.html`**
- Feed container: `#link-feed`.
- Feed loading skeleton region: `#link-feed-loading`.
- Feed empty state region: `#link-feed-empty`.
- Feed list region: `#link-feed-list`.
- Authorization-denied state panel: `#link-feed-forbidden`.
- Refresh button: `#link-feed-refresh`.

**`frontend/app.js`**
- `loadLinkFeed()` orchestrates request and state transitions.
- `renderFeedLoading()` displays skeleton/loading message.
- `renderFeedEmpty()` shows empty-state CTA.
- `renderFeedSuccess(items)` renders list.
- `renderFeedForbidden(reason)` shows authz guidance.

### 3.2 Required API Calls
- `GET /api/links`
  - Query optional: `?visibility=private|team|workspace`, `?limit=...`.
  - Success: `200` with list of link items.
  - Failure examples: `401` (not signed in), `403` (forbidden scope), `500`.
- `GET /api/workspaces/members`
  - Used when `403` occurs to determine whether to show "request access" guidance.

### 3.3 Microcopy and Feedback Behavior
- **Loading:** `"Loading links…"`
  - Behavior: show skeleton placeholders; disable refresh button until response.
- **Empty success state:** `"No links yet. Save your first URL to get started."`
  - Behavior: show CTA linking/focusing `#link-create-form`.
- **Success state:** no blocking message; optional subtle status `"Updated just now."`
  - Behavior: render newest-first list with visibility badges.
- **Authorization denied:** `"You don't have access to this feed."`
  - Secondary guidance: `"Try a different visibility filter or request workspace access."`
  - Behavior: hide list, show denied panel with recovery actions.
- **Not signed in:** `"Sign in to view your links."`
  - Behavior: show sign-in CTA linked to `#open-signin`.

### 3.4 Manual Acceptance Checks (Browser)
1. Load feed on signed-in account with slow network throttling; verify loading skeleton appears before data.
2. Load feed for new account with no links; verify empty-state copy and CTA to link form.
3. Load feed with existing links; verify list renders and each item shows visibility.
4. Trigger `403` by selecting unauthorized scope/filter; verify denied panel and recovery guidance.
5. Load while signed out; verify sign-in CTA state instead of data list.

---

## 4) Team-Sharing Journey

### 4.1 Entry Point UI Location
**`frontend/index.html`**
- Team context selector near link form: `#team-context-select`.
- Create team action: `#create-team-btn`.
- Create team modal form: `#create-team-form`.
- Share action in link row/card: `.share-to-team-btn`.
- Share confirmation container: `#team-share-feedback`.

**`frontend/app.js`**
- `initTeamSharingControls()` binds team selectors and share controls.
- `loadTeamOptions()` hydrates existing team list.
- `handleCreateTeam(formData)` creates a new team.
- `handleShareLinkToTeam({ linkId, teamId })` executes sharing.
- `renderTeamShareConfirmation(data)` surfaces completion status.

### 4.2 Required API Calls
- `GET /api/teams`
  - Purpose: load/select team options for sharing.
- `POST /api/teams`
  - Body: `{ name }`
  - Success: `201` team object.
  - Failure examples: `400` (invalid name), `409` (name conflict), `500`.
- `POST /api/links`
  - For initial team-visible create flow: `{ url, visibility: "team", teamId }`.
- `GET /api/workspaces/members`
  - Purpose: verify membership/role and present permissions guidance before/after share action.

### 4.3 Microcopy and Feedback Behavior
- **Team list loading:** `"Loading teams…"`
  - Behavior: disable share buttons until loaded.
- **Create team success:** `"Team created."`
  - Behavior: auto-select new team in `#team-context-select`.
- **Create team failure (name conflict):** `"A team with that name already exists."`
  - Behavior: keep modal open, focus name input.
- **Share success:** `"Shared with {teamName}."`
  - Behavior: show confirmation in `#team-share-feedback`, update link badge/activity.
- **Share failure (not a member):** `"You must be a team member to share here."`
  - Behavior: keep selection, show guidance to request access.
- **Share failure (generic):** `"Couldn't share link right now. Try again."`
  - Behavior: preserve form state and allow retry.

### 4.4 Manual Acceptance Checks (Browser)
1. Open team selector; verify loading state appears and selector enables once teams load.
2. Create a new unique team; verify team is auto-selected and success message displayed.
3. Attempt duplicate team creation; verify conflict microcopy and focus behavior.
4. Share a link to a valid selected team; verify confirmation text and team badge update.
5. Attempt share where membership is missing; verify permission warning and no success confirmation.

---

## Cross-Journey Feedback Rules
- All async submits must disable the initiating button until completion.
- Inline errors remain anchored to the relevant control and are cleared on successful retry.
- Toasts in `#global-feedback` auto-dismiss after ~4 seconds but remain screen-reader announced.
- Failure messages should be actionable and avoid exposing raw server errors.
