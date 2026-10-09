import { NextRequest, NextResponse } from 'next/server';
import { listRecords, createRecord } from '@/lib/store';
import { verifyToken } from '@/lib/auth';
import { generateTrackingCode } from '@/lib/utils';
import { RecordCategory, RecordStatus } from '@/lib/types';

function checkAuth(request: NextRequest): string | null {
  const token = request.cookies.get('cameco_admin_token')?.value;
  if (!token) return null;
  const verified = verifyToken(token);
  return verified ? verified.email : null;
}

export async function GET(request: NextRequest) {
  const adminEmail = checkAuth(request);
  if (!adminEmail) {
    return NextResponse.json({ error: 'Administrative authentication required.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const status = searchParams.get('status') || undefined;
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;

  const result = await listRecords({
    page,
    limit,
    status,
    category,
    search,
    demoOnly: false,
  });

  return NextResponse.json({
    success: true,
    data: result.records,
    pagination: {
      page: result.page,
      limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
}

export async function POST(request: NextRequest) {
  const adminEmail = checkAuth(request);
  if (!adminEmail) {
    return NextResponse.json({ error: 'Administrative authentication required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      category,
      status,
      issue_date,
      expiry_date,
      issuing_office,
      photo_url,
      published_demo,
      notes,
    } = body;

    if (!first_name || !last_name || !category || !status || !issue_date || !expiry_date) {
      return NextResponse.json(
        { error: 'Missing required applicant registration parameters.' },
        { status: 400 }
      );
    }

    const tracking_code = body.tracking_code || generateTrackingCode();

    const created = await createRecord(
      {
        tracking_code,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        category: category as RecordCategory,
        status: status as RecordStatus,
        issue_date,
        expiry_date,
        issuing_office: issuing_office?.trim() || 'Ottawa Central Verification Registry',
        photo_url: photo_url || undefined,
        published_demo: Boolean(published_demo),
        notes: notes?.trim() || undefined,
      },
      adminEmail
    );

    return NextResponse.json({ success: true, data: created });
  } catch {
    return NextResponse.json({ error: 'Registration payload malformed.' }, { status: 400 });
  }
}

