import { NextRequest, NextResponse } from 'next/server';
import { listRecords } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '9', 10), 20);
  const category = searchParams.get('category') || undefined;
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;

  // Restricts query to demonstrative records only.
  const result = await listRecords({
    page,
    limit,
    category,
    status,
    search,
    demoOnly: true,
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

