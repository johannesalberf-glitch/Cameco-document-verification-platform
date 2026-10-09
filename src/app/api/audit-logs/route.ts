import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/store';
import { verifyToken } from '@/lib/auth';

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

  const logs = await getAuditLogs();
  return NextResponse.json({ success: true, data: logs });
}

