# RAMON Project Handoff

## Project

- Workspace: `/Users/suyeon/Documents/Codex/2026-05-29/new-chat`
- Production: `https://ramon-pi.vercel.app/`
- GitHub: `https://github.com/Warny1/Ramon`
- Branch: `main`
- Deployment: push `main`; Vercel deploys automatically.
- This is the real RAMON site. Ignore the old demo site and `demo-data.json` unless explicitly requested.

## Product Direction

RAMON is an administrator-focused tennis lesson management PWA used on Windows PCs and several smartphones.

Core records:

- Members and lesson types
- Weekly and one-time schedules
- Attendance, absence and makeup lessons
- Payments and remaining session counts

Important behavior:

- Attendance and completed makeup lessons deduct a session.
- Absence does not deduct a session.
- A two-person lesson has separate payments per member, but both members share the scheduled lesson.
- Multiple payments for the same member are cumulative.

## Current Architecture

- Static HTML/CSS/JavaScript PWA
- Entry files: `index.html`, `app.js`, `styles.css`
- PWA: `manifest.webmanifest`, `service-worker.js`
- Build: `scripts/build.mjs`
- Vercel: `vercel.json`
- Supabase configuration: generated/read through `supabase-config.js`
- Do not expose or commit Supabase secrets.

Supabase row-level synchronization is implemented in `sync-engine.js`.

Tables are defined in `supabase-schema.sql`:

- `app_settings`
- `members`
- `schedules`
- `payments`
- `attendances`

The app keeps a local browser backup but Supabase is the shared source for multiple devices. Synchronization polls about every five seconds and queues local edits.

## Current Views

Desktop:

- 운영
- 전체 시간표
- 회원
- 결제

Mobile:

- 오늘
- 시간표
- 회원관리
- 결제

Mobile remains intentionally simpler than desktop. Avoid adding desktop-only management controls to mobile unless needed.

## Recent Schedule Work

- Today view is a compact single-day schedule.
- Count card:
  - Today: `오늘 : 10명`
  - Other dates: `6/10 : 10명`
- Full schedule uses a Monday-Sunday weekly view.
- A native date picker selects the week.
- Arrow buttons move one week in the full schedule and one day in operations.
- Day headers include the date.
- Weekly lessons can be marked `결석 예정`.
- Planned absence is stored as a date-specific absence attendance record.
- Planned absence does not deduct remaining sessions.
- A planned-absence cell turns red.
- A `보강 추가` sub-slot appears in that time cell.
- Makeup is saved as a one-time schedule for the selected date and time.
- Operations view displays absence as a solid red badge with white text.

## UI Preferences

- Clean, restrained, modern and operational.
- Avoid oversized buttons and repeated information.
- Avoid decorative cards inside cards.
- Names, lesson types, times and remaining counts must not be clipped.
- Always consider both desktop and mobile.
- Target 13-inch laptop widths as well as larger desktop screens.
- On narrow desktop widths, preserve the center schedule by reducing side-panel width.
- Mobile controls must remain easy to touch but should not dominate the screen.
- Prefer soft neutral colors with clear status colors:
  - Attendance: green
  - Pending: yellow
  - Absence: red

## Data Safety

This app is actively used. Avoid destructive data migrations and never replace Supabase data casually.

Before changing synchronization or record identity:

1. Read `sync-engine.js`.
2. Read `tests/sync-engine-conflict.test.mjs`.
3. Preserve stable record IDs.
4. Test concurrent attendance and payment changes.
5. Do not treat two lessons on the same date as duplicates when their times differ.

Attendance deduplication key:

- Member
- Date
- Class name
- Time

Absence records remain in attendance history but are excluded from session deduction.

## Verification

Run after changes:

```bash
cd /Users/suyeon/Documents/Codex/2026-05-29/new-chat
npm test
npm run build
git diff --check
```

For substantial frontend changes, inspect desktop and mobile layouts using the in-app browser when local browser permissions allow it.

## Git Workflow

The user normally pushes through Terminal.

```bash
cd /Users/suyeon/Documents/Codex/2026-05-29/new-chat
git add app.js index.html styles.css service-worker.js
git commit -m "Describe the change"
git push origin main
```

Only include files that were actually changed.

## Current State

- Branch: `main`
- Latest commit: `81085e3 Emphasize absence status in operations`
- `main` matches `origin/main`.
- Working tree was clean when this handoff was created on June 21, 2026.
- PWA cache version: `member-desk-app-v86`

## Suggested First Message In A New Chat

Read `/Users/suyeon/Documents/Codex/2026-05-29/new-chat/RAMON-HANDOFF.md` first, then inspect the current Git status and continue work on the real RAMON production project. Do not work on the demo site.
