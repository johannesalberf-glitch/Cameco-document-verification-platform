import { NextRequest, NextResponse } from 'next/server';
import { listRecords } from '@/lib/store';
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

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'csv';

  const result = await listRecords({ limit: 1000, page: 1 });
  const records = result.records;

  if (format === 'json') {
    return new NextResponse(JSON.stringify(records, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="cameco_registry_export.json"',
      },
    });
  }

  // CSV output
  const headers = [
    'ID',
    'Tracking Code',
    'First Name',
    'Last Name',
    'Category',
    'Status',
    'Issue Date',
    'Expiry Date',
    'Issuing Office',
    'Public Demo',
    'Created At',
  ];

  const escapeCsv = (val: string | boolean | undefined | null) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = records.map((r) => [
    escapeCsv(r.id),
    escapeCsv(r.tracking_code),
    escapeCsv(r.first_name),
    escapeCsv(r.last_name),
    escapeCsv(r.category),
    escapeCsv(r.status),
    escapeCsv(r.issue_date),
    escapeCsv(r.expiry_date),
    escapeCsv(r.issuing_office),
    escapeCsv(r.published_demo),
    escapeCsv(r.created_at),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="cameco_registry_export.csv"',
    },
  });
}

