import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await db.syncFromRemote();
    const notifications = db.getTable('notifications') || [];

    // Return notifications sorted newest first, max 30 items
    const sorted = [...notifications].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }).slice(0, 30);

    return NextResponse.json({
      success: true,
      notifications: sorted,
    });
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    return NextResponse.json({ success: false, notifications: [] }, { status: 500 });
  }
}
