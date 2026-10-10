'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { CanadaFlag } from './CanadaFlag';
import { PublicVerificationResult } from '@/lib/types';
import { formatDateDMY, generateMRZ } from '@/lib/utils';
import { 
  Printer, 
  ShieldCheck, 
  Check, 
  Copy, 
  QrCode,
  User,
  ExternalLink
} from 'lucide-react';

interface CamecoIdCardProps {
  result: PublicVerificationResult;
}

export function CamecoIdCard({ result }: CamecoIdCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mask sensitive demographic identifiers by default to preserve privacy
  const maskedPassport = result.passport_number
    ? `•••• ${result.passport_number.slice(-4)}`
    : 'Not Disclosed';

  const maskedPhone = result.phone_number
    ? `•••• ${result.phone_number.slice(-4)}`
    : null;

  // Clean gender format
  const rawGender = (result.gender || 'Female').toLowerCase();
  const cleanGender = rawGender.includes('female')
    ? 'Female'
    : rawGender.includes('male')
    ? 'Male'
    : 'Not Specified';

  // Format dates
  const formattedDob = formatDateDMY(result.birth_date || '2002-07-21');
  const formattedIssue = formatDateDMY(result.issue_date || '2026-09-29');
  const formattedExpiry = formatDateDMY(result.expiry_date || '2029-11-15');

  // MRZ Line Generation
  const mrz = generateMRZ(
    result.holder_name,
    result.passport_number || result.tracking_code,
    result.nationality || 'CAN',
    result.birth_date || '2002-07-21',
    cleanGender,
    result.expiry_date || '2029-11-15'
  );

  // Generate QR Code data resolving to secure verification endpoint
  useEffect(() => {
    async function makeQr() {
      try {
        const verifyUrl = typeof window !== 'undefined' 
          ? `${window.location.origin}/?code=${encodeURIComponent(result.tracking_code)}`
          : `https://verification.cameco.com/?code=${result.tracking_code}`;
        
        const url = await QRCode.toDataURL(verifyUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: '#0f2942',
            light: '#ffffff',
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Failed to generate verification QR code', err);
      }
    }
    makeQr();
  }, [result]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/?code=${encodeURIComponent(result.tracking_code)}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isVerified = result.status === 'VERIFIED';
  const isPending = result.status === 'PENDING_REVIEW';

  return (
    <div className="space-y-4 font-sans max-w-3xl mx-auto">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#003865]" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Registered Cameco Identity Record
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-medium transition-colors shadow-2xs"
            title="Copy verification link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-sm bg-[#003865] hover:bg-[#002646] text-white text-xs font-semibold transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Record</span>
          </button>
        </div>
      </div>

      {/* MODERN IDENTITY CARD CONTAINER */}
      <div
        ref={cardRef}
        id="cameco-id-card"
        className="rounded-xl border border-slate-300 overflow-hidden shadow-md bg-white text-slate-900 select-none transition-all"
      >
        {/* Compact Navy Header with Canadian Flag & CAMECO wordmark */}
        <div className="bg-[#0b1f3a] text-white px-5 sm:px-6 py-3 flex items-center justify-between border-b-2 border-emerald-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center border border-white/20 rounded-xs overflow-hidden shadow-2xs flex-shrink-0">
              <CanadaFlag className="h-4 w-8 object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm sm:text-base font-extrabold tracking-wider uppercase text-white font-sans">
                  CAMECO
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.2 rounded-xs bg-white/10 text-white/90 border border-white/20">
                  cameco Id
                </span>
              </div>
              <p className="text-[10px] text-white/70 tracking-wide font-sans">
                Document Verification & Attestation Registry
              </p>
            </div>
          </div>

          {/* Truthful Record Status Indicator */}
          <div className="flex items-center">
            {isVerified ? (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-sm bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>VERIFIED • ACTIVE</span>
              </span>
            ) : isPending ? (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-sm bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>PENDING REVIEW</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-sm bg-rose-500/20 border border-rose-400/50 text-rose-300 text-[11px] font-bold uppercase tracking-wider">
                <span>NOT APPROVED</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 bg-[#fbfbf9]">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Authorized Photo & QR Code */}
            <div className="sm:col-span-4 flex flex-col items-center space-y-3">
              {result.photo_url ? (
                <div className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-md border-2 border-slate-300 overflow-hidden bg-slate-100 shadow-xs flex-shrink-0">
                  <img
                    src={result.photo_url}
                    alt={result.holder_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-[#0b1f3a] text-white text-[9px] font-bold uppercase text-center py-0.5 tracking-wider">
                    DOCUMENT HOLDER
                  </div>
                </div>
              ) : (
                <div className="w-28 h-36 sm:w-32 sm:h-40 rounded-md border-2 border-stone-300 bg-stone-100 flex flex-col items-center justify-center text-stone-400">
                  <User className="w-10 h-10" />
                  <span className="text-[10px] uppercase font-mono mt-1 text-stone-500">PHOTO RESTRICTED</span>
                </div>
              )}

              {/* Scannable Verification QR Code */}
              <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-md border border-stone-200 p-1 bg-white shadow-2xs flex items-center justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Scan to verify document"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode className="w-12 h-12 text-[#0b1f3a]" />
                )}
              </div>
              <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider text-center">
                SCAN TO VERIFY
              </span>
            </div>

            {/* Right Column: Clean Two-Column Details Layout on Desktop, Single-Column on Mobile */}
            <div className="sm:col-span-8 space-y-4">
              
              {/* Holder Name */}
              <div className="border-b border-stone-200 pb-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  DOCUMENT HOLDER NAME
                </span>
                <p className="font-sans font-black text-base sm:text-lg text-[#0b1f3a] uppercase tracking-tight mt-0.5">
                  {result.holder_name}
                </p>
              </div>

              {/* Two-Column Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
                
                {/* Tracking / Record Code */}
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    RECORD IDENTIFIER
                  </span>
                  <p className="font-mono font-bold text-sm text-[#003865] mt-0.5">
                    {result.tracking_code}
                  </p>
                </div>

                {/* Document Category */}
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    DOCUMENT CATEGORY
                  </span>
                  <p className="font-sans font-semibold text-xs text-slate-800 mt-0.5">
                    {result.category}
                  </p>
                </div>

                {/* Issuing Office */}
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    ISSUING REGISTRY
                  </span>
                  <p className="font-sans font-medium text-xs text-slate-700 mt-0.5">
                    {result.issuing_office || 'Cameco Central Verification Registry'}
                  </p>
                </div>

                {/* Nationality */}
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    NATIONALITY / JURISDICTION
                  </span>
                  <p className="font-sans font-medium text-xs text-slate-700 uppercase mt-0.5">
                    {result.nationality || 'CANADA'}
                  </p>
                </div>

                {/* Issue Date */}
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    REGISTRATION DATE
                  </span>
                  <p className="font-sans font-medium text-xs text-slate-700 mt-0.5">
                    {formattedIssue}
                  </p>
                </div>

                {/* Expiry Date */}
                <div>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    VALIDITY WINDOW
                  </span>
                  <p className="font-sans font-bold text-xs text-amber-800 mt-0.5">
                    {formattedExpiry}
                  </p>
                </div>

                {/* Masked Passport (Privacy-preservation) */}
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    PASSPORT REFERENCE
                  </span>
                  <p className="font-mono text-xs text-stone-600 mt-0.5">
                    {maskedPassport}
                  </p>
                </div>

                {/* Optional Masked Phone */}
                {maskedPhone && (
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      CONTACT TELEPHONE
                    </span>
                    <p className="font-mono text-xs text-stone-600 mt-0.5">
                      {maskedPhone}
                    </p>
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* Machine Readable Zone (MRZ) Strip */}
          <div className="mt-5 p-2.5 rounded-md bg-stone-100 border border-stone-200">
            <div className="font-mono text-[10px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.18em] text-[#0b1f3a] overflow-x-auto whitespace-nowrap leading-relaxed select-all">
              <div>{mrz.line1}</div>
              <div>{mrz.line2}</div>
            </div>
          </div>
        </div>

        {/* Card Footer: Truthful, restrained attestation notice */}
        <div className="px-5 sm:px-6 py-2.5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-stone-500">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-slate-800">CAMECO ATTESTATION</span>
            <span>• Verified against active record repository</span>
          </div>

          <span className="text-stone-400 text-[10px]">
            Independent platform verification notice
          </span>
        </div>
      </div>
    </div>
  );
}

// Backward compatibility alias
export const KuwaitIdCard = CamecoIdCard;
