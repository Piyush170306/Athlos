import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminSessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('athlos_admin_session')?.value;
  const verified = verifyAdminSessionToken(token || '');
  if (!verified.valid || !verified.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    exportedBy: verified.user.email,
    seasons: db.getTable('seasons'),
    batches: db.getTable('batches'),
    sports: db.getTable('sports'),
    categories: db.getTable('categories'),
    matches: db.getTable('matches'),
    official_batch_scores: db.getTable('official_batch_scores'),
    highlights: db.getTable('highlights'),
    announcements: db.getTable('announcements'),
    polls: db.getTable('polls'),
    audit_logs: db.getTable('audit_logs'),
  };

  db.logAudit(verified.user.email, 'BACKUP_EXPORTED', 'DATABASE');

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set(
    'Content-Disposition',
    `attachment; filename="athlos_wob_backup_${new Date().toISOString().slice(0, 10)}.json"`
  );

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers,
  });
}
