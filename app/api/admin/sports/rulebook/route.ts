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

    if (!sportId) {
      return NextResponse.json({ error: 'Sport ID is required' }, { status: 400 });
    }

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
    const fileName = `${safeSlug}-official-rulebook-${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const rulebookUrl = `/uploads/rulebooks/${fileName}`;

    // Update sport record
    const updated = db.update('sports', sport.id, {
      rulebookUrl,
      rulebookOriginalName: file.name,
      rulebookUploadedAt: new Date().toISOString(),
      rulebookSize: file.size,
      rulebookPublished: true,
    });

    db.logAudit(user.email, 'RULEBOOK_UPLOADED', 'SPORT', sport.id, {
      fileName: file.name,
      size: file.size,
      url: rulebookUrl,
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

    if (!sportId) {
      return NextResponse.json({ error: 'Sport ID is required' }, { status: 400 });
    }

    const activeSeason = getActiveSeason();
    const sport = db.query('sports', (s) => s.id === sportId && s.seasonId === activeSeason.id)[0];
    if (!sport) {
      return NextResponse.json({ error: 'Sport not found' }, { status: 404 });
    }

    const updated = db.update('sports', sport.id, {
      rulebookUrl: undefined,
      rulebookOriginalName: undefined,
      rulebookUploadedAt: undefined,
      rulebookSize: undefined,
      rulebookPublished: false,
    });

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
