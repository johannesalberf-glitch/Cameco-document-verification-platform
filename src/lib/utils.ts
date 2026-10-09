import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeTrackingCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, '-');
}

export function isValidTrackingCode(input: string): boolean {
  const normalized = normalizeTrackingCode(input);
  return /^CAM-[A-Z0-9]{3,6}-[A-Z0-9]{3,6}$/.test(normalized) || /^CAM-[A-Z0-9]{6,12}$/.test(normalized);
}

export function generateTrackingCode(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const numPart = Math.floor(1000 + Math.random() * 9000);
  return `CAM-${year}-${randomPart}${numPart}`;
}

export function getInitials(firstName: string, lastName: string): string {
  const f = firstName.trim().charAt(0).toUpperCase();
  const l = lastName.trim().charAt(0).toUpperCase();
  return f && l ? `${f}. ${l}.` : f ? `${f}.` : 'Confidential';
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

