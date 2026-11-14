# Decision Log --- ATHLOS War of Batches

## Confirmed

-   Public site has no login; admin area is protected.
-   English-only, responsive, dark esports-inspired design;
    leaderboard-first homepage.
-   Seasons, sports, categories and score formats are configurable.
-   Approved Batch Scores Table is authoritative for leaderboard totals.
-   Excel import uses smart merge, preview, conflict review and batch
    approval.
-   Missing rows are preserved and flagged, not automatically deleted.
-   Google Sheets sync targets about every five minutes where supported,
    plus Sync Now; all changes require approval.
-   Result corrections require approval; only approved values are
    public.
-   Rollback is scoped to an import and protects unrelated later edits.
-   Polls predict winners of individual matches; admin manually
    opens/closes them.
-   Season activation requires confirmation; archives are read-only.
-   Intro plays on each full opening, is skippable and respects reduced
    motion.
-   Official branding assets will be supplied; do not fabricate official
    artwork.

## Confirm before production

-   Official upcoming-season workbook and worksheet/tab names.
-   Final batch labels/colours, exact scoring and tie-break rules.
-   Logo/mascot files and transparent layers.
-   Hosting provider/domain, five-minute scheduler, backups and exports.
-   Tournament timezone (default assumption Asia/Kolkata).
