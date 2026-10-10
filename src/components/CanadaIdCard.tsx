'use client';

import React from 'react';
import { CanadaFlag } from './CanadaFlag';
import { MapleLeafIcon } from './MapleLeafIcon';
import { PublicVerificationResult } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { ShieldCheck, User } from 'lucide-react';

interface CanadaIdCardProps {
  result: PublicVerificationResult;
}

export function CanadaIdCard({ result }: CanadaIdCardProps) {
  // Format Machine Readable Zone (MRZ) style string on bottom of card
  const cleanName = (result.holder_name || 'APPLICANT').replace(/[^A-Z ]/g, '').replace(/\s+/g, '<');
  const line1 = `V<CAN<${cleanName}<<<<<<<<<<<<<<<<<<<<<<<<<<<`.slice(0, 44);
  const birthPart = (result.birth_date || '1995-01-01').replace(/-/g, '').slice(2);
  const expiryPart = (result.expiry_date || '2028-01-01').replace(/-/g, '').slice(2);
  const sexChar = (result.gender || 'F').charAt(0).toUpperCase();
  const passportPart = (result.passport_number || 'E00629187').padEnd(9, '<');
  const line2 = `${passportPart}0CAN${birthPart}9${sexChar}${expiryPart}8<<<<<<<<<<<<<<<<`.slice(0, 44);

  return (
    <div className="bg-white border border-cameco-rule rounded-sm shadow-editorial p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-cameco-rule pb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cameco-red" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cameco-charcoal font-sans">
            Official Canadian Electronic Visa Card
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-stone-100 text-stone-700 border border-stone-200">
          DOCUMENT SPECIMEN
        </span>
      </div>

      {/* The Styled Canadian Visa ID Card */}
      <div className="relative rounded-md border-2 border-stone-300/80 bg-gradient-to-br from-amber-50/40 via-stone-50 to-sky-50/30 p-5 sm:p-6 overflow-hidden shadow-subtle font-sans text-cameco-charcoal">
        
        {/* Security Guilloche Watermark Pattern & Maple Leaf Emblems */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] flex items-center justify-center" aria-hidden="true">
          <MapleLeafIcon className="w-80 h-80 text-cameco-red" fill="#C41230" />
        </div>
        
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cameco-red via-stone-300 to-cameco-red opacity-80" />

        {/* Card Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-stone-200/90 pb-3 mb-4">
          <div className="space-y-0.5">
            <span className="text-[10px] tracking-widest font-bold uppercase text-cameco-red block">
              GOVERNMENT OF CANADA
            </span>
            <h4 className="text-base sm:text-lg font-extrabold tracking-tight text-cameco-charcoal uppercase">
              CANADA IMMIGRATION & CITIZENSHIP
            </h4>
            <span className="text-[11px] font-medium text-stone-600 block">
              ELECTRONIC VISA ACCREDITATION • PERMIS DE SÉJOUR ÉLECTRONIQUE
            </span>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="border border-stone-300 rounded-xs overflow-hidden shadow-2xs bg-white">
              <CanadaFlag className="h-7 w-14 object-cover" />
            </div>
          </div>
        </div>

        {/* Main Body Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          
          {/* Left Column Data */}
          <div className="md:col-span-4 space-y-2.5 text-xs">
            <div>
              <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider block">
                FULL NAME / NOM COMPLET
              </span>
              <p className="font-bold text-sm text-cameco-charcoal tracking-tight">
                {result.holder_name}
              </p>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider block">
                NATIONALITY / NATIONALITÉ
              </span>
              <p className="font-semibold text-xs text-stone-800">
                {result.nationality || 'CANADA'}
              </p>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider block">
                PASSPORT NO. / NO. DE PASSEPORT
              </span>
              <p className="font-mono font-bold text-xs text-cameco-charcoal">
                {result.passport_number || 'E00629187'}
              </p>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider block">
                OCCUPATION / PROFESSION
              </span>
              <p className="font-medium text-xs text-stone-700">
                {result.occupation || 'Authorized Professional'}
              </p>
            </div>
          </div>

          {/* Center Column: Portrait & QR Authenticator */}
          <div className="md:col-span-4 flex flex-col items-center justify-center space-y-2 py-2">
            <div className="relative">
              <div className="w-28 h-36 rounded-xs border-2 border-stone-300 overflow-hidden bg-stone-100 shadow-subtle flex items-center justify-center">
                {result.photo_url ? (
                  <img
                    src={result.photo_url}
                    alt={result.holder_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-stone-400">
                    <User className="w-8 h-8" />
                    <span className="text-[9px] uppercase font-mono mt-1">NO PHOTO</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-stone-900/80 text-white text-[9px] uppercase font-mono text-center py-0.5">
                OFFICIAL • OFFICIEL
              </div>
            </div>

            <div className="text-center">
              <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider block">
                VISA TYPE / CATÉGORIE
              </span>
              <p className="font-bold text-xs text-cameco-red">
                {result.category}
              </p>
            </div>
          </div>

          {/* Right Column Data */}
          <div className="md:col-span-4 space-y-2.5 text-xs">
            <div>
              <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider block">
                DATE OF BIRTH / DATE DE NAISSANCE
              </span>
              <p className="font-semibold text-xs text-stone-800">
                {formatDate(result.birth_date || '1995-05-14')}
              </p>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider block">
                GENDER / SEXE
              </span>
              <p className="font-semibold text-xs text-stone-800">
                {result.gender || 'Not specified'}
              </p>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider block">
                ISSUE DATE / DATE D'ÉMISSION
              </span>
              <p className="font-semibold text-xs text-stone-800">
                {formatDate(result.issue_date)}
              </p>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider block">
                EXPIRY DATE / DATE D'EXPIRATION
              </span>
              <p className="font-bold text-xs text-amber-900 font-mono">
                {formatDate(result.expiry_date)}
              </p>
            </div>
          </div>

        </div>

        {/* Machine Readable Zone (MRZ) */}
        <div className="relative z-10 mt-5 pt-3 border-t border-stone-200/90 font-mono text-[10px] sm:text-[11px] text-stone-700 tracking-wider leading-relaxed bg-white/70 p-2.5 rounded-xs border border-stone-200/70 select-all overflow-x-auto">
          <div className="whitespace-nowrap">{line1}</div>
          <div className="whitespace-nowrap">{line2}</div>
        </div>

        {/* Bottom Bar: Issuing Authority and Approved Stamp */}
        <div className="relative z-10 mt-3 pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-stone-600">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold uppercase tracking-wider text-stone-700">
              IMMIGRATION CANADA • BUREAU DE L'IMMIGRATION
            </span>
          </div>

          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-100/90 border border-emerald-400 text-emerald-900 font-bold rounded-xs uppercase tracking-wider text-[11px] shadow-2xs">
            <span>APPROVED • APPROUVÉ</span>
          </div>
        </div>

      </div>
    </div>
  );
}

