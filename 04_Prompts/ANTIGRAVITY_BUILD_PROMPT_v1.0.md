# Google Antigravity Build Prompt --- ATHLOS War of Batches 2026--27

Read these files first: 1. `01_Product_Docs/ATHLOS_WOB_PRD_v1.0.md` 2.
`01_Product_Docs/ATHLOS_WOB_TRD_v1.0.md` 3. `README_SUBMISSION.md` 4.
Supplied files in `02_Brand_Assets/` and `03_Data_Reference/`

## Non-negotiable rules

-   Do not hard-code last year's workbook layout, sports, dates, points
    rules or batch labels.
-   The old workbook is reference-only until the next-season workbook is
    confirmed.
-   Approved `Batch Scores Table` values are the authority for official
    leaderboard totals. Never silently recalculate/override totals from
    match wins.
-   Excel and Google Sheets changes must enter a review queue. Nothing
    becomes public before admin approval.
-   Missing source rows must be preserved and flagged, never silently
    deleted.
-   Rollback must be import-scoped and protect unrelated later edits.
-   Use supplied official branding only. If assets are missing, use
    labelled placeholders; do not fabricate logos or mascots.
-   Keep secrets out of frontend code, source control and this
    submission package.
-   Do not claim five-minute Google Sheets sync unless the chosen
    backend scheduler supports it.
-   English-only, responsive, dark esports-inspired visual design.
-   Intro plays on each full site opening, lasts around 7--8 seconds, is
    skippable and respects reduced motion.
-   Public users must never see pending/rejected results, admin data or
    OAuth credentials.
-   Season activation requires explicit admin confirmation.

## First, inspect and plan

Before significant coding: 1. Inspect the existing repository,
framework, package manager, database setup and design system. 2. Report
proposed architecture and any deviations from the TRD. 3. List
environment variables, external services and hosting assumptions. 4.
Identify blockers, especially official workbook, official points sheet,
final batch labels and brand asset layers. Separate blockers from items
that can use placeholders. 5. Provide a phased implementation plan with
acceptance checks. Do not stop for minor cosmetic choices; use
documented defaults and label assumptions.

## Build in phases

1.  Foundation: project shell, design system, schema/migrations, secure
    admin auth, `.env.example`, README.
2.  Public site: Home, Leaderboard, Sports, Schedule/Matches, Match
    Detail, Highlights, Polls, Announcements and Past Seasons.
3.  Admin: Overview, Seasons, Sports, Matches & Results, Imports,
    Highlights, Polls, Settings; add audit log and activation
    confirmation.
4.  Excel importer: server parsing, configurable mapping, preview, smart
    merge, validation, conflict resolution, batch approval and safe
    rollback.
5.  Google Sheets: secure OAuth, designated sheet mapping, Sync Now,
    scheduled backend sync if supported, idempotency and review queue.
6.  Polls/highlights/intro: match-level predictions, manual open/close,
    server-side counts, highlight media and skippable branded animation.
7.  Hardening: tests, security, accessibility, responsive checks,
    backup/export and deployment documentation.

## Required deliverables

Working application code, database migrations/schema, safe demo data,
`.env.example`, README, architecture/data
dictionary/import/security/deployment docs as appropriate, automated
tests, and a clear list of incomplete features/blockers. Do not call a
mockup a completed integration.

After each phase, report what changed, tests run, what passed/failed and
the next step. Keep code reusable and maintainable. Prioritise strong
batch identity, readable points, fast mobile browsing and trustworthy
official results.
