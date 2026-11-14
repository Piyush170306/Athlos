# Technical Requirements Document (TRD)

## ATHLOS --- War of Batches 2026--27

**Document ID:** ATH-WOB-TRD-001 \| **Version:** 1.0 \| **Status:**
Proposed baseline

## 1. Technical approach

Inspect the existing repository and retain a sensible established stack.
If empty, propose a modern TypeScript full-stack app (for example
Next.js), Supabase/Postgres/Auth/Storage, server-side validation, and
automated unit/integration/e2e tests. Supabase is the preferred
direction, but verify current plan capabilities before committing.
Google Sheets sync must run server-side on a scheduled job, not a
browser timer.

## 2. Logical architecture

-   Public UI: reads only approved/published records.
-   Admin UI: authenticated management and review queue.
-   Server service layer: validates inputs, enforces authorisation, runs
    imports, approvals, Google sync and rollback.
-   Database: seasons, batches, sports/categories/events, matches,
    official points, staged imports, mappings, versions, polls/votes,
    highlights, announcements and audit log.
-   External integration: Google OAuth + Sheets API; credentials remain
    server-side.
-   Storage: official branding and approved highlight photos.

## 3. Suggested repository layout

``` text
athlos-war-of-batches/
├── AGENTS.md
├── README.md
├── .env.example
├── .gitignore
├── app/                 # public/admin routes and server endpoints
├── components/          # branding, leaderboard, sports, matches, polls, admin
├── lib/                 # auth, database, validation, imports, sheets, audit, security
├── public/assets/       # logos, mascots, intro assets
├── supabase/migrations/ # if Supabase is selected
├── tests/               # unit, integration, e2e
├── docs/                # architecture, data dictionary, import mapping, security, deploy
└── scripts/
```

Keep only folders needed by the chosen stack.

## 4. Logical data model

Use stable UUIDs/internal IDs, UTC timestamps and display in the
configured tournament timezone.

-   `seasons`: name, slug, status (draft/active/archived), dates,
    activation metadata.
-   `batches`: season or reusable identity, code, display name, colours,
    mascot/logo path, order, enabled.
-   `sports`: season, name/slug, description, icon, enabled,
    configurable result schema.
-   `categories`: sport/season, name, order, enabled.
-   `events`: sport/category, event name/type and result-format
    configuration.
-   `matches`: season/sport/event/category, scheduled time, participants
    where relevant, status (upcoming/completed/cancelled), structured
    result, winner/margin, source key and approved version.
-   `official_batch_scores`: approved values from the Batch Scores
    Table, keyed by season/batch and optionally sport.
-   `import_batches`: source type/name, mapping, status, timestamps,
    creator/approver, summary and rollback reference.
-   `import_rows`: batch, sheet/row, raw/normalized values, target,
    operation, validation errors, conflict and review state.
-   `import_mappings`: reusable sheet/header/column mapping and
    normalization configuration.
-   `record_versions`: before/after snapshots, entity, version, source
    import and actor.
-   `highlights` and `announcements`: season, content, media,
    publication state, order and author.
-   `polls`: match, state, open/close times, eligible batch options.
-   `poll_votes`: poll, selected batch, timestamp and privacy-preserving
    device-token hash; enforce one vote per token/poll where feasible.
-   `audit_log`: actor, action, entity, timestamp, import reference and
    safe before/after summaries. Never log secrets.

Do not force every score into two numeric columns. Use validated
structured results for sets, races, relays and individual events.
Official leaderboard totals must come from approved Batch Scores Table
values, not match-win recalculation.

## 5. Import pipeline

1.  Validate file type and size; parse on server.
2.  Detect sheets, header rows and candidate columns.
3.  Use saved mapping or show mapping UI.
4.  Normalize dates, batch aliases, numbers and blank continuation cells
    without inventing scores.
5.  Validate required fields and sport-specific formats.
6.  Match stable source IDs first; use fallback fields only when
    unambiguous.
7.  Stage row-level insert/update/conflict/invalid/missing-from-source
    outcomes.
8.  Preserve missing rows and flag them; never auto-delete.
9.  Show preview and counts; admin resolves conflicts.
10. Require whole-batch approval/rejection.
11. Apply approved changes transactionally, save versions and audit
    events.
12. Publish approved state and refresh public views.
13. Rollback only the selected import's changes; protect later unrelated
    edits and require manual resolution for conflicts. Use idempotency
    keys and progress reporting for larger imports.

## 6. Google Sheets

-   OAuth authorises a designated spreadsheet; request minimum necessary
    scopes.
-   Store spreadsheet ID and mapping configuration, never credentials in
    source code.
-   Store refresh tokens securely server-side; never expose them to the
    browser.
-   Backend scheduler targets approximately five-minute sync only if the
    selected host supports it.
-   Add Sync Now, last attempt/success, error details and pending-review
    status.
-   Detect unchanged content and avoid duplicate batches; prevent
    overlapping jobs.
-   Each changed sheet creates a staged batch using the same validation
    and approval pipeline as Excel.
-   Handle revoked/expired access and prompt admin to reconnect.
-   Verify API quotas and hosting limits before promising cadence.

## 7. Approval, publication and rollback

Pending changes must be separate from published records or use versioned
data with an approved-version pointer. Public reads must exclude
pending/rejected values. Approvals and rollback should be server-side
and transactional. If a record changed after the import, rollback must
not blindly restore stale data; show the conflict for admin resolution.
Season activation must enforce one active season and require
confirmation.

## 8. Security

-   Enable database row-level security where supported.
-   Public can read published records only; no access to staged imports,
    audit logs, admin profiles or OAuth tokens.
-   All writes are validated and authorised server-side.
-   Service-role keys and OAuth secrets are server-only; never use
    public frontend prefixes for secrets.
-   Validate upload size/type/content and generate safe storage keys.
-   Rate-limit login, password reset, sync endpoints and polls.
-   Use secure sessions/cookies and CSRF protection where relevant.
-   Set appropriate CORS/security headers; avoid exposing stack traces.
-   Document backup/restore and verify actual plan capabilities.

## 9. Realtime and caching

Approved changes should appear without manual refresh using supported
cache revalidation or realtime subscriptions. Never expose draft import
changes through public subscriptions. If true realtime is unavailable,
use a documented refresh fallback.

## 10. Assets and filenames

Expected official assets: ATHLOS logo, War of Batches emblem, IPM06
dragon, IPM07 phoenix, IPM08 deer, optional approved highlight photos.
Preserve originals and create optimised copies separately. Use
transparent layers where available. Do not fabricate official art.

Suggested names: - `athlos_logo_primary.svg` -
`war_of_batches_2026-27_emblem.png` - `ipm06_dragon_layer.png` -
`ipm07_phoenix_layer.png` - `ipm08_deer_layer.png` -
`wob_2025-26_sample_REFERENCE_ONLY.xlsx` -
`wob_2026-27_official_workbook_v1.xlsx`

## 11. Environment variables

Create `.env.example` with placeholders only; include only variables
actually used:

``` env
NEXT_PUBLIC_APP_NAME=ATHLOS War of Batches
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GOOGLE_TOKEN_ENCRYPTION_KEY=
ADMIN_ALLOWED_EMAILS=
CRON_SECRET=
```

Never commit real `.env`, API keys, service-role keys, OAuth secrets or
reset tokens.

## 12. Test plan

Unit tests: column mapping, date/number normalization, matching/conflict
detection, official score authority, tie handling, result validation,
poll aggregation.

Integration tests: staged import not public, approval publishes,
rejection preserves state, missing rows preserved, rollback protects
later edits, Google sync idempotent and approval-gated, one active
season.

E2E: public/mobile pages, admin login/reset, create season/sport/match,
import-preview-approve, poll open/close, season activation confirmation,
intro skip and reduced-motion.

## 13. Deployment checks

Before choosing host, verify scheduled-job frequency, OAuth callback
support, secure token storage, DB/storage limits, backups/restore, email
reset delivery, cache/realtime, and rate limits. Document setup,
migrations, admin bootstrap, Google OAuth, scheduler,
backup/export/restore and deployment.

## 14. Unresolved technical checks

-   Final workbook and official worksheet/tab names.
-   Stable source IDs or approved fallback matching.
-   Five-minute scheduler availability and cost.
-   Backup and downloadable export support.
-   Asset formats/layers.
-   Tournament timezone (assume Asia/Kolkata until confirmed).
-   Deployment domain and OAuth callback URI.
-   Never assume last year's points rules or formula references are
    correct.

## 15. Definition of done

Working, documented app; migrations and `.env.example`; no exposed
secrets; public/admin data boundaries tested; imports staged and
auditable; safe rollback; secure approval-gated Google sync; official
totals from Batch Scores Table; responsive accessible UI; skippable
intro; current setup/test/deploy/recovery documentation.
