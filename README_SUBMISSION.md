# ATHLOS War of Batches --- Antigravity Submission Package

## Read first

1.  `01_Product_Docs/ATHLOS_WOB_PRD_v1.0.md` --- product behaviour and
    acceptance criteria.
2.  `01_Product_Docs/ATHLOS_WOB_TRD_v1.0.md` --- technical approach,
    data model, import, security and tests.
3.  `04_Prompts/ANTIGRAVITY_BUILD_PROMPT_v1.0.md` --- paste this into
    Antigravity.
4.  `05_Notes_and_Decisions/DECISION_LOG.md` --- confirmed decisions and
    unresolved checks.

## What to attach

**Required:** PRD, TRD, build prompt and this README.

**Strongly recommended:** old sample workbook (clearly labelled
reference-only), confirmed official next-season workbook when ready,
official ATHLOS logo, official War of Batches emblem, separate
transparent mascot layers, and a short note identifying the official
points worksheet.

**Do not attach:** passwords, API keys, real `.env`, Supabase
service-role keys, Google OAuth secrets/tokens, student personal data or
unrelated private information.

## Folder guide

-   `01_Product_Docs/`: specifications.
-   `02_Brand_Assets/`: official logos and mascot artwork; currently
    contains instructions/placeholders only.
-   `03_Data_Reference/Sample_Workbooks/`: old workbook, reference-only.
-   `03_Data_Reference/Approved_Templates/`: confirmed upcoming-season
    workbook/template.
-   `04_Prompts/`: Antigravity prompt.
-   `05_Notes_and_Decisions/`: decision log.

## Naming convention

Use descriptive names, season and version where relevant. Avoid
`final.xlsx`, `newlogo2.png`, or `latestfinalfinal.xlsx`.

Recommended: - `ATHLOS_WOB_PRD_v1.0.md` - `ATHLOS_WOB_TRD_v1.0.md` -
`ANTIGRAVITY_BUILD_PROMPT_v1.0.md` - `athlos_logo_primary.svg` -
`war_of_batches_2026-27_emblem.png` - `ipm06_dragon_layer.png` -
`ipm07_phoenix_layer.png` - `ipm08_deer_layer.png` -
`wob_2025-26_sample_REFERENCE_ONLY.xlsx` -
`wob_2026-27_official_workbook_v1.xlsx`

Preserve original assets; make optimised copies separately. Increase
workbook version only for an approved revision.

## Before production

-   Confirm the official next-season workbook, worksheet/tab names,
    batch labels and points rules.
-   The old workbook is only a reference; do not treat its formulas or
    scoring as authoritative.
-   Add official logo/mascot assets when available. Do not fabricate
    them.
-   Verify hosting support for five-minute scheduled jobs, email reset,
    backups, storage and exports.
-   Default timezone assumption is Asia/Kolkata, to be confirmed.
