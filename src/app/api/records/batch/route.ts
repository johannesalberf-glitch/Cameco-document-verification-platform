import { NextRequest, NextResponse } from 'next/server';
import { updateRecord } from '@/lib/store';
import { verifyToken } from '@/lib/auth';
import { RecordStatus } from '@/lib/types';

function checkAuth(request: NextRequest): string | null {
  const token = request.cookies.get('cameco_admin_token')?.value;
  if (!token) return null;
  const verified = verifyToken(token);
  return verified ? verified.email : null;
}

export async function POST(request: NextRequest) {
  const adminEmail = checkAuth(request);
  if (!adminEmail) {
    return NextResponse.json({ error: 'Administrative authentication required.' }, { status: 401 });
  }

  try {
    const { recordIds, status } = await request.json();

    if (!Array.isArray(recordIds) || recordIds.length === 0 || !status) {
      return NextResponse.json(
        { error: 'Must provide an array of recordIds and target status.' },
        { status: 400 }
      );
    }

    const updatedList = [];
    for (const id of recordIds) {
      const updated = await updateRecord(id, { status: status as RecordStatus }, adminEmail);
      if (updated) updatedList.push(updated);
    }

    return NextResponse.json({
      success: true,
      message: `Batch update applied to ${updatedList.length} records.`,
      data: updatedList,
    });
  } catch {
    return NextResponse.json({ error: 'Batch update payload malformed.' }, { status: 400 });
  }
}

