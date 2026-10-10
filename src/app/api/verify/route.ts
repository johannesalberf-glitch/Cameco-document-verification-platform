import { NextRequest, NextResponse } from 'next/server';
import { getRecordByTrackingCode } from '@/lib/store';
import { isValidTrackingCode, getInitials } from '@/lib/utils';
import { PublicVerificationResult } from '@/lib/types';

const rateLimitMap = new Map<string, { count: number; expires: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.expires) {
    rateLimitMap.set(ip, { count: 1, expires: now + 60000 });
    return false;
  }
  if (entry.count >= 60) return true;
  entry.count += 1;
  return false;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Maximum 60 queries per minute permitted.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code || !isValidTrackingCode(code)) {
    return NextResponse.json(
      {
        error: 'Invalid tracking code format. Expected format: CAM-XXXX-XXXX (e.g. CAM-2026-8812).',
      },
      { status: 400 }
    );
  }

  const record = await getRecordByTrackingCode(code);

  if (!record) {
    return NextResponse.json(
      {
        error: `No record located matching tracking code "${code}". Verify the certificate sequence or confirm registration with the issuing office.`,
      },
      { status: 404 }
    );
  }

  const sanitizedResult: PublicVerificationResult = {
    tracking_code: record.tracking_code,
    status: record.status,
    category: record.category,
    holder_name: `${record.first_name} ${record.last_name}`.toUpperCase(),
    holder_initials: getInitials(record.first_name, record.last_name),
    photo_url: record.photo_url || undefined,
    nationality: record.nationality || 'CANADA',
    passport_number: record.passport_number || undefined,
    occupation: record.occupation || undefined,
    gender: record.gender || undefined,
    birth_date: record.birth_date || undefined,
    issuing_office: record.issuing_office,
    issue_date: record.issue_date,
    expiry_date: record.expiry_date,
    verified_at: new Date().toISOString(),
    is_demo: record.published_demo,
    message:
      'This certificate attestation confirms that document metadata matches an authorized filing record in the Cameco Verification Registry.',
    scope_notice:
      'Independent Verification Notice: This record does not substitute for or supersede official statutory notifications issued by Immigration, Refugees and Citizenship Canada (IRCC) or the Canada Border Services Agency (CBSA).',
  };

  return NextResponse.json({ success: true, data: sanitizedResult });
}

