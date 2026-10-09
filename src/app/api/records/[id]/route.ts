import { NextRequest, NextResponse } from 'next/server';
import { getRecordById, updateRecord, deleteRecord } from '@/lib/store';
import { verifyToken } from '@/lib/auth';

function checkAuth(request: NextRequest): string | null {
  const token = request.cookies.get('cameco_admin_token')?.value;
  if (!token) return null;
  const verified = verifyToken(token);
  return verified ? verified.email : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminEmail = checkAuth(request);
  if (!adminEmail) {
    return NextResponse.json({ error: 'Administrative authentication required.' }, { status: 401 });
  }

  const record = await getRecordById(params.id);
  if (!record) {
    return NextResponse.json({ error: 'Record not located.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: record });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminEmail = checkAuth(request);
  if (!adminEmail) {
    return NextResponse.json({ error: 'Administrative authentication required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await updateRecord(params.id, body, adminEmail);

    if (!updated) {
      return NextResponse.json({ error: 'Record not located.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ error: 'Update payload invalid.' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminEmail = checkAuth(request);
  if (!adminEmail) {
    return NextResponse.json({ error: 'Administrative authentication required.' }, { status: 401 });
  }

  const ok = await deleteRecord(params.id, adminEmail);
  if (!ok) {
    return NextResponse.json({ error: 'Record not located or deletion failed.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Record removed successfully.' });
}

