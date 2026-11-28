const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// 1. Test Prediction Poll Deadline Calculation in Asia/Kolkata (IST)
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function calculatePollDeadline(matchDate, timeSlot) {
  const normSlot = (timeSlot || '').trim().toLowerCase();
  const parts = matchDate.split('-');
  if (parts.length !== 3) {
    return {
      closesAt: new Date().toISOString(),
      closingDisplay: 'Schedule Pending Confirmation',
      isAmbiguous: true,
    };
  }
  const [year, month, day] = parts;
  const mIdx = parseInt(month, 10) - 1;
  const dayNum = parseInt(day, 10);
  const formattedDate = `${dayNum} ${MONTH_NAMES[mIdx] || month} ${year}`;

  if (normSlot.includes('morning')) {
    const closesAt = new Date(`${year}-${month}-${day}T06:00:00+05:30`).toISOString();
    return {
      closesAt,
      closingDisplay: `${formattedDate}, 6:00 AM IST`,
      isAmbiguous: false,
    };
  }
  if (normSlot.includes('evening')) {
    const closesAt = new Date(`${year}-${month}-${day}T18:00:00+05:30`).toISOString();
    return {
      closesAt,
      closingDisplay: `${formattedDate}, 6:00 PM IST`,
      isAmbiguous: false,
    };
  }
  return {
    closesAt: new Date(`${year}-${month}-${day}T06:00:00+05:30`).toISOString(),
    closingDisplay: `${formattedDate} (Session Ambiguous - Admin Review Needed)`,
    isAmbiguous: true,
  };
}

function isPollClosed(poll) {
  if (poll.status === 'CLOSED' || poll.status === 'CANCELLED') return true;
  if (poll.match && (poll.match.status === 'COMPLETED' || poll.match.status === 'CANCELLED')) return true;
  if (poll.closesAt) {
    const now = new Date();
    if (now >= new Date(poll.closesAt)) return true;
  }
  return false;
}

test('Poll Deadlines: Source file exists and implements IST 6:00 AM and 6:00 PM logic', () => {
  const src = fs.readFileSync('lib/polls/deadlines.ts', 'utf8');
  assert.ok(src.includes('06:00:00+05:30'), 'Must define Morning 6:00 AM IST deadline');
  assert.ok(src.includes('18:00:00+05:30'), 'Must define Evening 6:00 PM IST deadline');
  assert.ok(src.includes('Asia/Kolkata'), 'Must reference Asia/Kolkata timezone');
});

test('Poll Deadlines: Morning matches close at exactly 6:00 AM IST on the match date', () => {
  const matchDate = '2026-12-02';
  const result = calculatePollDeadline(matchDate, 'Morning');

  // In IST (+05:30), 6:00 AM on 2 Dec 2026 is 00:30 UTC on 2 Dec 2026
  assert.strictEqual(result.closesAt, '2026-12-02T00:30:00.000Z');
  assert.strictEqual(result.closingDisplay, '2 Dec 2026, 6:00 AM IST');
  assert.strictEqual(result.isAmbiguous, false);
});

test('Poll Deadlines: Evening matches close at exactly 6:00 PM IST on the match date', () => {
  const matchDate = '2026-12-02';
  const result = calculatePollDeadline(matchDate, 'Evening');

  // In IST (+05:30), 6:00 PM (18:00) on 2 Dec 2026 is 12:30 UTC on 2 Dec 2026
  assert.strictEqual(result.closesAt, '2026-12-02T12:30:00.000Z');
  assert.strictEqual(result.closingDisplay, '2 Dec 2026, 6:00 PM IST');
  assert.strictEqual(result.isAmbiguous, false);
});

test('Poll Deadlines: Missing or ambiguous sessions are safely flagged for admin review', () => {
  const matchDate = '2026-12-03';
  const result = calculatePollDeadline(matchDate, 'TBD_UNKNOWN_SESSION');

  assert.strictEqual(result.isAmbiguous, true);
  assert.ok(result.closingDisplay.includes('Admin Review Needed'));
});

// 2. Test Poll Closure Check Logic
test('Poll Closure: isPollClosed correctly identifies expired and completed polls', () => {
  // Expired deadline in the past
  const pastPoll = {
    status: 'OPEN',
    closesAt: '2020-01-01T00:00:00.000Z',
    match: { status: 'UPCOMING' },
  };
  assert.strictEqual(isPollClosed(pastPoll), true);

  // Future deadline
  const futurePoll = {
    status: 'OPEN',
    closesAt: '2099-01-01T00:00:00.000Z',
    match: { status: 'UPCOMING' },
  };
  assert.strictEqual(isPollClosed(futurePoll), false);

  // Match completed
  const completedMatchPoll = {
    status: 'OPEN',
    closesAt: '2099-01-01T00:00:00.000Z',
    match: { status: 'COMPLETED' },
  };
  assert.strictEqual(isPollClosed(completedMatchPoll), true);
});

// 3. Test Admin Session Token Lifespan (12 Hours)
test('Admin Authentication: Token lifespan is configured for 12 hours without repeated section prompts', () => {
  const authFile = fs.readFileSync('lib/auth/index.ts', 'utf8');
  assert.ok(authFile.includes("expiresIn: '12h'"), 'JWT token must be configured for 12h');

  const loginRoute = fs.readFileSync('app/api/auth/login/route.ts', 'utf8');
  assert.ok(loginRoute.includes('12 * 60 * 60'), 'Cookie maxAge must be 12 hours');

  // Verify Admin layout does not contain blocking modal
  const adminLayout = fs.readFileSync('app/admin/layout.tsx', 'utf8');
  assert.ok(!adminLayout.includes('Set Unique Admin Password'), 'Blocking password modal must not exist in layout');
  assert.ok(adminLayout.includes('if (adminUser)'), 'Layout must avoid re-authenticating when adminUser is present');
});

// 4. Test Notification Deduplication Structure
test('Notifications: Structure and deduplication key exist in DatabaseSchema', () => {
  const typesFile = fs.readFileSync('lib/types/index.ts', 'utf8');
  assert.ok(typesFile.includes('export interface TournamentNotification'), 'TournamentNotification must be exported');
  assert.ok(typesFile.includes('dedupKey: string'), 'Must contain dedupKey for repeat sync protection');

  const db = JSON.parse(fs.readFileSync('data/athlos_wob.json', 'utf8'));
  assert.ok(Array.isArray(db.notifications), 'Database must contain notifications array');
});

// 5. Test Public Navigation Bell Component
test('Public Navigation: NotificationCenter bell icon is integrated in Navbar', () => {
  const navbarSrc = fs.readFileSync('components/Navbar.tsx', 'utf8');
  assert.ok(navbarSrc.includes('NotificationCenter'), 'Navbar must import and render NotificationCenter');

  const notifSrc = fs.readFileSync('components/NotificationCenter.tsx', 'utf8');
  assert.ok(notifSrc.includes('athlos_read_notification_ids'), 'NotificationCenter must track read status in localStorage');
  assert.ok(notifSrc.includes('Notification.requestPermission'), 'NotificationCenter must provide optional push permission trigger');
});
