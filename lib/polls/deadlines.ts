/**
 * ATHLOS War of Batches - Prediction Poll Deadlines & Timezone Authority
 * Timezone: Asia/Kolkata (IST = UTC+05:30)
 *
 * Rules:
 * - Morning matches: Prediction poll closes at 6:00 AM IST on the SAME match date.
 * - Evening matches: Prediction poll closes at 6:00 PM IST on the SAME match date.
 * - Afternoon matches (if any): Closes at 12:00 PM IST on the SAME match date.
 * - Missing/Ambiguous sessions: Flagged for administrator review.
 */

export interface PollDeadlineResult {
  closesAt: string;          // ISO 8601 UTC timestamp
  closingDisplay: string;    // Human-readable formatted string in IST
  isAmbiguous: boolean;      // Flag if session was missing or unrecognized
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function calculatePollDeadline(matchDate?: string, timeSlot?: string): PollDeadlineResult {
  const normSlot = (timeSlot || '').trim().toLowerCase();
  const dateStr = (matchDate || '').trim();

  // Validate matchDate format: YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
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
    // 6:00 AM IST on the match date -> 06:00:00+05:30
    // UTC equivalent: 00:30:00.000Z
    const closesAt = new Date(`${year}-${month}-${day}T06:00:00+05:30`).toISOString();
    return {
      closesAt,
      closingDisplay: `${formattedDate}, 6:00 AM IST`,
      isAmbiguous: false,
    };
  }

  if (normSlot.includes('evening')) {
    // 6:00 PM IST on the match date -> 18:00:00+05:30
    // UTC equivalent: 12:30:00.000Z
    const closesAt = new Date(`${year}-${month}-${day}T18:00:00+05:30`).toISOString();
    return {
      closesAt,
      closingDisplay: `${formattedDate}, 6:00 PM IST`,
      isAmbiguous: false,
    };
  }

  if (normSlot.includes('afternoon')) {
    // 12:00 PM IST on the match date -> 12:00:00+05:30
    // UTC equivalent: 06:30:00.000Z
    const closesAt = new Date(`${year}-${month}-${day}T12:00:00+05:30`).toISOString();
    return {
      closesAt,
      closingDisplay: `${formattedDate}, 12:00 PM IST`,
      isAmbiguous: false,
    };
  }

  // Ambiguous session: fallback to morning 6:00 AM IST and flag record
  const fallbackClosesAt = new Date(`${year}-${month}-${day}T06:00:00+05:30`).toISOString();
  return {
    closesAt: fallbackClosesAt,
    closingDisplay: `${formattedDate} (Session Ambiguous - Admin Review Needed)`,
    isAmbiguous: true,
  };
}

export function isPollClosed(poll: {
  status?: string;
  closesAt?: string;
  match?: { status?: string };
}): boolean {
  if (poll.status === 'CLOSED') {
    return true;
  }
  if (poll.match && (poll.match.status === 'COMPLETED' || poll.match.status === 'CANCELLED')) {
    return true;
  }
  if (poll.closesAt) {
    const now = new Date();
    const deadline = new Date(poll.closesAt);
    if (now >= deadline) {
      return true;
    }
  }
  return false;
}
