# ATHLOS War of Batches 2026–27 — Platform & Secure Admin Dashboard

Official responsive tournament portal and secure administrative dashboard engineered for the **ATHLOS War of Batches 2026–27** inter-batch competition.

---

## 1. Executive Summary & Brand Identities

* **IPM06** (`#10b981`) — Official mascot artwork preserved; batch code displayed strictly as **IPM06**.
* **IPM07** (`#f97316`) — Official mascot artwork preserved; batch code displayed strictly as **IPM07**.
* **IPM08** (`#eab308`) — Official mascot artwork preserved; batch code displayed strictly as **IPM08**.

> **Mascot Identity Mandate:** Mascot artwork and logos remain fully visible. All textual animal names (Dragon, Phoenix, Deer/Stag, Titans) are strictly omitted from public UI.

---

## 2. Non-Negotiable Core System Rules

1. **Official Points Authority:** Row 89 (and dynamic Total Row detection) of the approved `Batch Scores Table` in the official spreadsheet is the **sole authority** for tournament standings. Standings are **never** silently recalculated or overridden from match wins.
2. **Review & Approval Gate:** All spreadsheet uploads (Excel) and Google Sheets synchronizations enter a staging review queue (`import_batches` and `import_rows`). No data becomes public without explicit administrator approval.
3. **Preservation of Missing Rows:** If a record present in a previous spreadsheet disappears in a new version, it is flagged as `MISSING_FROM_SOURCE` and retained. Silent deletions are strictly forbidden.
4. **Import-Scoped Rollback:** Rollbacks reverse changes made by a specific import while safeguarding subsequent independent manual edits.
5. **Strict Category Policy:** Only **Boys** and **Girls** categories are permitted. The "Open" category is abolished across all public and admin pages.
6. **No Public Admin Links:** Admin button and navigation links are completely omitted from public navbar and footer. The portal is accessible directly at `/admin` and `/admin/login` protected by session authentication.
7. **Single Active Season:** Season activation enforces that exactly one tournament season is active at a time, requiring explicit admin confirmation (`ACTIVATE`).

---

## 3. Technology Stack & Architecture

* **Frontend & Server Framework:** Next.js 14 (App Router) + React 18 + TypeScript.
* **Styling & Motion:** Tailwind CSS + Lucide Icons (premium golden & dark sports tournament identity, high contrast, mobile-responsive).
* **Database & Relational Model:** Relational data layer supporting local zero-config JSON/SQLite persistence with Supabase / PostgreSQL schema compatibility across 15 core entities:
  * `seasons`, `batches`, `sports`, `categories`, `matches`, `official_batch_scores`
  * `import_batches`, `import_rows`, `record_versions`
  * `highlights`, `announcements`, `polls`, `poll_votes`, `audit_logs`, `admin_users`, `google_sheets_config`
* **Spreadsheet Processing:** Server-side workbook parser with forward-fill for blank continuation cells, dynamic Total Row detection (Row 89), and November 2026 serial date normalization.
* **Security & Auth:** Scoped admin sessions with bcrypt password hashing, secure HTTP-only cookies, brute-force rate limiting, and expiring one-time password reset tokens.

---

## 4. Quickstart & Local Setup

### Prerequisites
* Node.js v18+ or v20 LTS (portable v20.18.0 included).
* npm v9+.

### Installation
1. Copy `.env.example` to `.env.local` and set unique values for `ADMIN_SESSION_SECRET`, `INITIAL_ADMIN_PASSWORD`, and `CRON_SECRET`. Configure any optional integrations you plan to use.
2. Install dependencies:
   ```bash
   npm ci
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Run the automated test suite:
   ```bash
   npm test
   ```

The database is initialized on first use with the configured `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD`. The local database file is not tracked by Git.

---

## 5. Public Portal Features
* `/`: **Cinematic Golden-Themed Hero** (strictly centrally aligned `ATHLOS` and `WAR OF BATCHES`), followed immediately by the **Official Leaderboard** (Row 89 authority: IPM07 with 30.0 pts, IPM06 with 14.0 pts, IPM08 with 10.0 pts), **Upcoming Fixtures**, **Today's Match Prediction Poll**, and data-driven **Tournament Highlights**.
* `/leaderboard`: Authoritative standings from Row 89 of the Batch Scores Table, tie-break rules, and sport-by-sport points distribution matrix.
* `/matches`: Filterable fixture schedule by sport, category (Boys / Girls only), batch, and status (Upcoming, Completed, Cancelled) with detail modal.
* `/sports` & `/sports/[slug]`: Sport rules, formats, categories, and fixtures for all 15 sports.
* `/highlights`: Data-driven statements generated from verified match results in the latest approved spreadsheet (e.g., `IPM07 defeated IPM06 (75-60) in Basketball (Boys)`).
* `/polls`: Community match prediction polls filtered strictly to fixtures scheduled for **TODAY** (`2026-11-09`).
* `/history`: Immutable read-only historical archive of previous tournament editions (2022–23 through 2025–26).
* **Official Video Intro:** Plays the supplied `athlos_war_of_batches_intro_2026-27.mp4` on full site opening once per session, with responsive aspect ratio, visible Skip Intro button, and automatic bypass when `prefers-reduced-motion` is enabled.
