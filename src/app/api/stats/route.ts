import { NextRequest, NextResponse } from 'next/server';
import { listRecords, getAuditLogs } from '@/lib/store';
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

  const { records } = await listRecords({ limit: 1000, page: 1 });
  const auditLogs = await getAuditLogs();

  const total = records.length;
  const verifiedCount = records.filter((r) => r.status === 'VERIFIED').length;
  const pendingCount = records.filter((r) => r.status === 'PENDING_REVIEW').length;
  const rejectedCount = records.filter((r) => r.status === 'REJECTED').length;
  const expiredCount = records.filter((r) => r.status === 'EXPIRED' || r.status === 'REVOKED').length;
  const demoCount = records.filter((r) => r.published_demo).length;

  return NextResponse.json({
    success: true,
    data: {
      totalRecords: total,
      verifiedCount,
      pendingCount,
      rejectedCount,
      expiredCount,
      demoCount,
      totalAuditLogs: auditLogs.length,
      lastAuditTime: auditLogs[0]?.created_at || null,
    },
  });
}

