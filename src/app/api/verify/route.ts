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
        error: 'Please provide a valid document code or digits to verify.',
      },
      { status: 400 }
    );
  }

  const record = await getRecordByTrackingCode(code);

  if (!record) {
    return NextResponse.json(
      { error: `No matching record exists for document tracking code "${code.trim()}".` },
      { status: 404 }
    );
  }

  const cleanGender = (record.gender || 'Female').replace(/ \/ .*$/, '');
  const cleanOffice = record.issuing_office?.includes('Kuwait') 
    ? 'Cameco Central Verification Registry' 
    : record.issuing_office || 'Cameco Central Verification Registry';

  const sanitizedResult: PublicVerificationResult = {
    tracking_code: record.tracking_code,
    status: record.status,
    category: record.category,
    holder_name: `${record.first_name} ${record.last_name}`.toUpperCase(),
    holder_initials: getInitials(record.first_name, record.last_name),
    photo_url: record.photo_url || '',
    nationality: record.nationality || 'CANADA',
    passport_number: record.passport_number || record.tracking_code,
    phone_number: record.phone_number || undefined,
    occupation: record.occupation || '',
    gender: cleanGender,
    birth_date: record.birth_date || '',
    issuing_office: cleanOffice,
    issue_date: record.issue_date,
    expiry_date: record.expiry_date,
    verified_at: new Date().toISOString(),
    is_demo: record.published_demo,
    message:
      'This official identity credential attestation confirms that record metadata matches an authorized filing in the Cameco Verification Registry.',
    scope_notice:
      'Official Attestation Notice: This credential attestation is certified by Cameco Document Verification Platform.',
  };

  return NextResponse.json({ success: true, data: sanitizedResult });
}

