import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeTrackingCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, '-');
}

export function isValidTrackingCode(input: string): boolean {
  if (!input) return false;
  const clean = input.trim();
  return clean.length >= 1;
}

export function generateTrackingCode(): string {
  const digits = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `E00${digits.slice(0, 6)}`;
}

export function getInitials(firstName: string, lastName: string): string {
  const f = firstName.trim().charAt(0).toUpperCase();
  const l = lastName.trim().charAt(0).toUpperCase();
  return f && l ? `${f}. ${l}.` : f ? `${f}.` : 'Verified';
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatDateDMY(dateStr?: string): string {
  if (!dateStr) return '29/09/2026';
  // If already in DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr.trim())) {
    return dateStr.trim();
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function generateMRZ(
  fullName: string,
  passportNo: string,
  nationality: string,
  dob: string,
  gender: string,
  expiry: string
): { line1: string; line2: string } {
  const cleanName = (fullName || 'APPLICANT')
    .toUpperCase()
    .replace(/[^A-Z ]/g, '')
    .trim()
    .replace(/\s+/g, '<');
  
  // Format line 1: V<MLS<NAME<<<<<<<<<<<<<<<<<< (length 44)
  const line1 = `V<MLS<${cleanName}<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`.slice(0, 44);

  // Line 2: Passport + Check + Nat3 + DOB(YYMMDD) + Check + Sex + EXP(YYMMDD) + Check + <<<<
  const pass = (passportNo || 'E00629187').toUpperCase().replace(/[^A-Z0-9]/g, '').padEnd(9, '<').slice(0, 9);
  const nat = (nationality || 'ETH').toUpperCase().replace(/[^A-Z]/g, '').padEnd(3, '<').slice(0, 3);
  
  // Parse DOB to YYMMDD
  let dobPart = '020721';
  if (dob) {
    const d = new Date(dob);
    if (!isNaN(d.getTime())) {
      const yy = String(d.getFullYear()).slice(-2);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dobPart = `${yy}${mm}${dd}`;
    }
  }

  // Parse Expiry to YYMMDD
  let expPart = '291115';
  if (expiry) {
    const d = new Date(expiry);
    if (!isNaN(d.getTime())) {
      const yy = String(d.getFullYear()).slice(-2);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      expPart = `${yy}${mm}${dd}`;
    }
  }

  const sex = (gender || 'F').toUpperCase().startsWith('M') ? 'M' : 'F';
  const line2 = `${pass}0${nat}${dobPart}0${sex}${expPart}0<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`.slice(0, 44);

  return { line1, line2 };
}


