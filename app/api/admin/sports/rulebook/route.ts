import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { verifyAdminSessionToken } from '@/lib/auth';
import { getActiveSeason } from '@/lib/db/public';

function checkAuth(req: NextRequest) {
  const token = req.cookies.get('athlos_admin_session')?.value;
  if (!token) return null;
  const verified = verifyAdminSessionToken(token);
  return verified.valid ? verified.user : null;
}

export async function POST(req: NextRequest) {
  const user = checkAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const sportId = formData.get('sportId') as string;
    const file = formData.get('file') as File | null;
    const category = ((formData.get('category') as string) || 'common').toLowerCase(); // 'boys', 'girls', or 'common'

    if (!sportId) {
      return NextResponse.json({ error: 'Sport ID is required' }, { status: 400 });
    }

    await db.syncFromRemote();

    const activeSeason = getActiveSeason();
    const sport = db.query('sports', (s) => s.id === sportId && s.seasonId === activeSeason.id)[0];
    if (!sport) {
      return NextResponse.json({ error: 'Sport not found in active season' }, { status: 404 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    // Validate PDF
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      return NextResponse.json({ error: 'Only PDF documents (.pdf) are permitted' }, { status: 400 });
    }

    // Max 20MB
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum 20MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'rulebooks');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeSlug = sport.slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const catSuffix = category !== 'common' ? `-${category}` : '';
    const fileName = `${safeSlug}${catSuffix}-rulebook-${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const rulebookUrl = `/uploads/rulebooks/${fileName}`;

    // Update sport record with category awareness
    const updates: Partial<any> = { rulebookPublished: true };
    if (category === 'boys') {
      updates.rulebookBoysUrl = rulebookUrl;
      updates.rulebookBoysOriginalName = file.name;
      updates.rulebookBoysUploadedAt = new Date().toISOString();
      updates.rulebookBoysSize = file.size;
    } else if (category === 'girls') {
      updates.rulebookGirlsUrl = rulebookUrl;
      updates.rulebookGirlsOriginalName = file.name;
      updates.rulebookGirlsUploadedAt = new Date().toISOString();
      updates.rulebookGirlsSize = file.size;
    } else {
      updates.rulebookUrl = rulebookUrl;
      updates.rulebookOriginalName = file.name;
      updates.rulebookUploadedAt = new Date().toISOString();
      updates.rulebookSize = file.size;
    }

    const updated = db.update('sports', sport.id, updates);
    await db.saveToRemote();

    db.logAudit(user.email, 'RULEBOOK_UPLOADED', 'SPORT', sport.id, {
      fileName: file.name,
      size: file.size,
      url: rulebookUrl,
      category,
    });

    return NextResponse.json({
      success: true,
      sport: updated,
      message: `Official rulebook for ${sport.name} uploaded successfully`,
    });
  } catch (error: any) {
    console.error('Rulebook upload error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = checkAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const sportId = searchParams.get('sportId');
    const category = (searchParams.get('category') || 'common').toLowerCase();

    if (!sportId) {
      return NextResponse.json({ error: 'Sport ID is required' }, { status: 400 });
    }

    await db.syncFromRemote();

    const activeSeason = getActiveSeason();
    const sport = db.query('sports', (s) => s.id === sportId && s.seasonId === activeSeason.id)[0];
    if (!sport) {
      return NextResponse.json({ error: 'Sport not found' }, { status: 404 });
    }

    const updates: Partial<any> = {};
    if (category === 'boys') {
      updates.rulebookBoysUrl = undefined;
      updates.rulebookBoysOriginalName = undefined;
      updates.rulebookBoysUploadedAt = undefined;
      updates.rulebookBoysSize = undefined;
    } else if (category === 'girls') {
      updates.rulebookGirlsUrl = undefined;
      updates.rulebookGirlsOriginalName = undefined;
      updates.rulebookGirlsUploadedAt = undefined;
      updates.rulebookGirlsSize = undefined;
    } else {
      updates.rulebookUrl = undefined;
      updates.rulebookOriginalName = undefined;
      updates.rulebookUploadedAt = undefined;
      updates.rulebookSize = undefined;
      updates.rulebookPublished = false;
    }

    const updated = db.update('sports', sport.id, updates);
    await db.saveToRemote();

    db.logAudit(user.email, 'RULEBOOK_UNPUBLISHED', 'SPORT', sport.id, {
      sportName: sport.name,
    });

    return NextResponse.json({
      success: true,
      sport: updated,
      message: `Rulebook for ${sport.name} unpublished`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
