# Product Requirements Document (PRD)

## ATHLOS --- War of Batches 2026--27

**Document ID:** ATH-WOB-PRD-001 \| **Version:** 1.0 \| **Status:**
Implementation draft

## 1. Product summary

Build a responsive public tournament website and secure admin dashboard
for ATHLOS War of Batches 2026--27. The tournament involves IPM06, IPM07
and IPM08 and supports 12+ sports, custom categories and different score
formats. The previous-season workbook is reference-only; do not
hard-code its sports, dates, points rules, columns or batch labels.

## 2. Goals

-   Make approved standings, schedules, match results and highlights
    easy to browse on mobile and desktop.
-   Let admins configure seasons, batches, sports, categories, matches,
    results, polls, announcements and branding without code changes.
-   Import Excel and sync an authorised Google Sheet through a
    review-and-approval workflow.
-   Keep a complete audit trail and safely undo a specific import.
-   Provide a short, skippable branded intro.

## 3. Users

**Public visitor:** no login; browses the active season, leaderboard,
sports, matches, highlights, polls, announcements and past seasons; can
vote in an open match poll.

**Administrator:** secure login; manages seasons and all tournament
content, imports/reviews/approvals, Google Sheets connection, polls,
highlights, announcements, audit log and settings. Initial release can
use a single admin permission level. Password recovery uses the
authorised admin email.

## 4. Public site

Navigation: Home, Leaderboard, Sports, Matches/Schedule, Today's
Highlights, Polls and Past Seasons/History. Use a dark, energetic
esports-inspired design, English-only, mobile-responsive.

**Homepage:** leaderboard first, prominently showing overall points;
then upcoming/recent matches, sports, highlights, open polls and
announcements. Approved changes should appear without a full manual
refresh.

**Leaderboard:** rank, batch identity, official total points, wins and
sport-wise breakdown. Official totals must come from the approved
`Batch Scores Table` in the authorised spreadsheet. Never silently
recalculate or override totals from match wins. Compare match data to
totals only to flag discrepancies. Apply configured tie-break rules if
available; otherwise show equal ranks until an admin resolves the tie.

**Sports and categories:** dynamically configured sport cards,
filters/search and admin-defined categories (not just boys/girls).
Support configurable result formats such as sets, goals, runs, points,
race times, relays and individual events.

**Matches:** filters by sport, category, batch, date and status. Initial
statuses: Upcoming, Completed, Cancelled. Match detail includes event,
category, time, participants, approved score/result, winner, margin
where relevant, status, highlight and related poll. Admin can
create/edit matches manually and through imports.

**Highlights:** admin-authored title/text, date, match/score reference,
margin if relevant, optional photo, ordering/pinning and accessible alt
text.

**Polls:** predict the winning batch for an individual match. Admin
manually opens/closes polls. Show server-backed counts/percentages while
open. No public login. Use browser/device-level duplicate deterrence and
rate limiting, but clearly document this does not guarantee one vote per
person.

**Announcements/history:** optional homepage banner plus dated feed.
Past seasons preserve final results/standings and are read-only in
normal use.

## 5. Intro animation

On every full site opening, play an estimated 7--8 second intro with a
visible Skip button. Sequence: ATHLOS logo glows/dissolves into
particles; IPM06 dragon, IPM07 phoenix and IPM08 deer enter with
cinematic/gold effects; they assemble into the supplied official War of
Batches 2026--27 emblem; then enter the site. Use cinematic motion with
exact official artwork at the end. Preserve logo geometry, typography
and mascot placement. Use separate transparent layers when supplied. Do
not fabricate official art. Respect reduced-motion settings and ensure
the site remains usable if animation assets fail.

## 6. Admin dashboard

Sidebar: Overview, Seasons, Sports, Matches & Results, Imports,
Highlights, Polls, Settings.

-   Configure seasons, batches, colours/mascots, sports, categories,
    events, fixtures, score formats, display settings, import mappings
    and content.
-   Admin creates/configures/imports/reviews a season and explicitly
    confirms activation. Uploading a workbook must not activate it
    automatically.
-   Import Excel with automatic column/sheet detection, editable
    mappings, preview, validation and reusable mappings.
-   Default import behaviour is smart merge: update matches, add new
    records, flag conflicts. Match using stable source IDs where
    present; otherwise use cautious field matching. Ambiguous matches
    must be flagged.
-   If a row disappears from a new spreadsheet, preserve the existing
    record and flag it; do not silently delete.
-   Review conflicts, then approve or reject the import as a whole.
    Unapproved values remain private.
-   Corrections to published results require approval; public visitors
    see only last approved values.
-   Google Sheets uses authorised Google account access, Sync Now and a
    backend scheduled sync targeting approximately every 5 minutes where
    hosting supports it. Every sync creates a review batch; no automatic
    publication.
-   Show last attempt/success, sync errors and pending approvals.
-   Rollback a selected import to its previous published state. Only
    reverse records affected by that import; if later edits conflict,
    require admin resolution rather than overwrite them.
-   Audit imports, edits, approvals/rejections, rollbacks and season
    activation with actor and timestamp.
-   Secure admin auth, protected server-side writes, rate limits,
    expiring one-use password-reset links, no secrets in frontend.

## 7. Data rules

-   Authorised spreadsheet is official source for points.
-   Approved `Batch Scores Table` is the official leaderboard totals
    source.
-   Do not hard-code previous season's scoring rules (including any win
    or athletics point values).
-   Normalize dates, blank continuation cells and aliases carefully;
    flag ambiguity instead of inventing data.
-   Public queries must never expose pending/rejected imports, draft
    results, admin records or OAuth credentials.

## 8. Quality and acceptance criteria

-   Accessible responsive public site with clear loading/empty/error
    states.
-   Admin can add a new sport/category without code changes.
-   Import preview shows additions, updates, invalid rows, conflicts and
    missing-from-source warnings.
-   Missing records are preserved and flagged.
-   Public data changes only after approval.
-   Rollback is import-scoped, protects unrelated later edits and is
    audited.
-   Google sync is secure/idempotent and approval-gated; five-minute
    cadence is only promised if hosting supports it.
-   Polls can be manually opened/closed and counts are server-backed.
-   Archived seasons are read-only; season activation requires
    confirmation.
-   Intro can be skipped and supports reduced motion.
-   Tests cover official points authority, imports, approval, rollback,
    public visibility and poll validation.

## 9. Assumptions to verify

-   Confirm the next-season workbook, official worksheet/tab names,
    batch labels and score rules.
-   Previous workbook may contain inconsistent dates, blank continuation
    cells or formula/label mismatches; do not assume it is
    authoritative.
-   Official logo/mascot assets may arrive later; use labelled
    placeholders until supplied.
-   Verify hosting supports scheduled jobs, OAuth callbacks, email
    reset, backups, storage and exports before promising free-tier
    capabilities.
-   Default timezone assumption: Asia/Kolkata, to be confirmed.

## 10. Suggested phases

1.  Foundation, schema, authentication and responsive shell.
2.  Public site and approved-data boundary.
3.  Admin management, approval workflow and audit log.
4.  Excel importer, conflict handling and rollback.
5.  Google Sheets OAuth and scheduled sync.
6.  Polls, highlights and intro.
7.  Security, accessibility, tests, backup/export and deployment docs.

Before significant implementation, inspect the existing repository and
report architecture, assumptions, external services and blockers.
Implement in small testable phases and keep documentation current.
