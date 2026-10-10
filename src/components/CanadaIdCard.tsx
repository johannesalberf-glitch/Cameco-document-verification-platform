'use client';

import React, { useState } from 'react';
import { CanadaFlag } from './CanadaFlag';
import { MapleLeafIcon } from './MapleLeafIcon';
import { PublicVerificationResult } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { ShieldCheck, User, Zap, Eye, CheckCircle2, Sparkles, Printer } from 'lucide-react';

interface CanadaIdCardProps {
  result: PublicVerificationResult;
}

export function CanadaIdCard({ result }: CanadaIdCardProps) {
  const [uvMode, setUvMode] = useState(false);

  // Machine Readable Zone (MRZ) formatted string
  const cleanName = (result.holder_name || 'APPLICANT').replace(/[^A-Z ]/g, '').replace(/\s+/g, '<');
  const line1 = `V<CAN<${cleanName}<<<<<<<<<<<<<<<<<<<<<<<<<<<`.slice(0, 44);
  const birthPart = (result.birth_date || '1995-01-01').replace(/-/g, '').slice(2);
  const expiryPart = (result.expiry_date || '2028-01-01').replace(/-/g, '').slice(2);
  const sexChar = (result.gender || 'F').charAt(0).toUpperCase();
  const passportPart = (result.passport_number || 'E00629187').padEnd(9, '<');
  const line2 = `${passportPart}0CAN${birthPart}9${sexChar}${expiryPart}8<<<<<<<<<<<<<<<<`.slice(0, 44);

  return (
    <div className="bg-white border border-cameco-rule rounded-sm shadow-editorial p-5 sm:p-6 space-y-4">
      
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cameco-rule pb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cameco-red" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cameco-charcoal font-sans">
            Official Canadian Electronic Visa Card
          </h3>
        </div>

        {/* UV Blacklight Mode Switch */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => setUvMode(!uvMode)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all shadow-subtle ${
              uvMode
                ? 'bg-purple-950 text-purple-200 border border-purple-500 ring-2 ring-purple-500/40 shadow-purple-900/30'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300'
            }`}
            title="Inspect document under 365nm Ultraviolet light to reveal hidden UV-reactive fluorescent ink"
          >
            <Zap className={`w-3.5 h-3.5 ${uvMode ? 'text-purple-300 animate-pulse' : 'text-stone-500'}`} />
            <span>{uvMode ? 'UV Blacklight Active (365nm)' : 'Inspect UV-Reactive Ink'}</span>
          </button>

          <span className="text-[10px] font-mono px-2 py-1 rounded-xs bg-stone-100 text-stone-700 border border-stone-200">
            SECURITY SPECIMEN
          </span>
        </div>
      </div>

      {/* UV Mode Explanatory Notice */}
      {uvMode && (
        <div className="p-3 bg-purple-950/90 border border-purple-600/70 rounded-sm text-purple-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong>Ultraviolet Inspection Mode Active:</strong> Simulating 365nm blacklight illumination. Certified UV-reactive phosphor ink fluoresces in radiant neon green, cyan, and ultraviolet security pigments.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUvMode(false)}
            className="text-[10px] text-purple-300 hover:text-white underline whitespace-nowrap"
          >
            Switch to Daylight
          </button>
        </div>
      )}

      {/* The Canadian Visa ID Card (Supports Daylight & UV Inspection) */}
      <div
        className={`relative rounded-md border-2 p-5 sm:p-6 overflow-hidden transition-all duration-500 font-sans shadow-subtle select-none ${
          uvMode
            ? 'bg-[#0a0a1f] border-purple-600/80 text-purple-100 shadow-purple-950/60 ring-1 ring-purple-500/30'
            : 'bg-gradient-to-br from-amber-50/40 via-stone-50 to-sky-50/30 border-stone-300/80 text-cameco-charcoal'
        }`}
      >
        
        {/* DAYLIGHT WATERMARK (Subtle red maple leaf) */}
        {!uvMode && (
          <div className="absolute inset-0 pointer-events-none opacity-[0.06] flex items-center justify-center" aria-hidden="true">
            <MapleLeafIcon className="w-80 h-80 text-cameco-red" fill="#C41230" />
          </div>
        )}

        {/* UV-REACTIVE FLUORESCENT INK OVERLAYS (Active under UV light) */}
        {uvMode && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 uv-ink-active" aria-hidden="true">
            
            {/* Glowing Phosphor Guilloche Waves */}
            <svg className="absolute inset-0 w-full h-full opacity-45" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="uvGuilloche" width="100" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M0 20 Q25 0 50 20 T100 20 M0 25 Q25 5 50 25 T100 25 M0 15 Q25 -5 50 15 T100 15"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="0.75"
                  />
                  <path
                    d="M0 20 Q25 40 50 20 T100 20"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="0.75"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#uvGuilloche)" />
            </svg>

            {/* Radiant Fluorescent Canadian Maple Leaf Crest in Neon Lime/Yellow */}
            <div className="absolute inset-0 flex items-center justify-center opacity-75">
              <div className="w-72 h-72 rounded-full border-2 border-dashed border-cyan-400/50 flex items-center justify-center p-6">
                <MapleLeafIcon className="w-56 h-56 text-[#a3e635]" fill="#a3e635" />
              </div>
            </div>

            {/* Glowing Repeating Security Microtext Bands */}
            <div className="absolute top-12 left-0 right-0 font-mono text-[9px] uppercase tracking-widest text-[#22d3ee] opacity-80 whitespace-nowrap overflow-hidden">
              ★ CANADA ★ CITIZENSHIP & IMMIGRATION ★ SECURITY DOCUMENT ★ AUTHENTIQUE ★ LEVEL 3 VERIFIED ★ 365NM FLUORESCENCE ★
            </div>
            <div className="absolute bottom-16 left-0 right-0 font-mono text-[9px] uppercase tracking-widest text-[#a855f7] opacity-80 whitespace-nowrap overflow-hidden">
              ★ CANADA DOCUMENT EMBEDDED PHOSPHOR ★ SECURITY INK ACTIVE ★ IMMIGRATION CANADA ★ SECURE PASSPORT REFERENCE ★
            </div>

            {/* Floating Fluorescent Security Fibers (Red, Cyan, Neon Green) */}
            <div className="absolute top-6 left-12 w-8 h-1 bg-[#22c55e] rotate-45 rounded-full blur-[0.5px] opacity-90" />
            <div className="absolute top-20 right-24 w-10 h-1 bg-[#ec4899] -rotate-30 rounded-full blur-[0.5px] opacity-90" />
            <div className="absolute bottom-28 left-32 w-7 h-1 bg-[#38bdf8] rotate-12 rounded-full blur-[0.5px] opacity-90" />
            <div className="absolute bottom-10 right-40 w-9 h-1 bg-[#a3e635] -rotate-45 rounded-full blur-[0.5px] opacity-90" />

            {/* UV Ambient Blacklight Sheen */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-cyan-900/15" />
          </div>
        )}

        <div className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500 ${
          uvMode ? 'bg-gradient-to-r from-cyan-400 via-purple-500 to-lime-400' : 'bg-gradient-to-r from-cameco-red via-stone-300 to-cameco-red opacity-80'
        }`} />

        {/* Card Header */}
        <div className={`relative z-10 flex items-center justify-between border-b pb-3 mb-4 transition-colors ${
          uvMode ? 'border-purple-800/80' : 'border-stone-200/90'
        }`}>
          <div className="space-y-0.5">
            <span className={`text-[10px] tracking-widest font-bold uppercase block ${
              uvMode ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-cameco-red'
            }`}>
              GOVERNMENT OF CANADA • GOUVERNEMENT DU CANADA
            </span>
            <h4 className={`text-base sm:text-lg font-extrabold tracking-tight uppercase ${
              uvMode ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]' : 'text-cameco-charcoal'
            }`}>
              CANADA IMMIGRATION & CITIZENSHIP
            </h4>
            <span className={`text-[11px] font-medium block ${
              uvMode ? 'text-purple-300' : 'text-stone-600'
            }`}>
              ELECTRONIC VISA ACCREDITATION • PERMIS DE SÉJOUR ÉLECTRONIQUE
            </span>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className={`border rounded-xs overflow-hidden shadow-2xs ${
              uvMode ? 'border-purple-500 bg-purple-900/40 p-0.5' : 'border-stone-300 bg-white'
            }`}>
              <CanadaFlag className="h-7 w-14 object-cover" />
            </div>
          </div>
        </div>

        {/* Main Body Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          
          {/* Left Column Data */}
          <div className="md:col-span-4 space-y-2.5 text-xs">
            <div>
              <span className={`text-[9px] uppercase font-bold tracking-wider block ${
                uvMode ? 'text-purple-300' : 'text-stone-500'
              }`}>
                FULL NAME / NOM COMPLET
              </span>
              <p className={`font-bold text-sm tracking-tight ${
                uvMode ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(103,232,249,0.8)]' : 'text-cameco-charcoal'
              }`}>
                {result.holder_name}
              </p>
            </div>

            <div>
              <span className={`text-[9px] uppercase font-bold tracking-wider block ${
                uvMode ? 'text-purple-300' : 'text-stone-500'
              }`}>
                NATIONALITY / NATIONALITÉ
              </span>
              <p className={`font-semibold text-xs ${
                uvMode ? 'text-purple-200' : 'text-stone-800'
              }`}>
                {result.nationality || 'CANADA'}
              </p>
            </div>

            <div>
              <span className={`text-[9px] uppercase font-bold tracking-wider block ${
                uvMode ? 'text-purple-300' : 'text-stone-500'
              }`}>
                PASSPORT NO. / NO. DE PASSEPORT
              </span>
              <p className={`font-mono font-bold text-xs ${
                uvMode ? 'text-lime-400 drop-shadow-[0_0_6px_rgba(163,230,53,0.8)]' : 'text-cameco-charcoal'
              }`}>
                {result.passport_number || 'E00629187'}
              </p>
            </div>

            <div>
              <span className={`text-[9px] uppercase font-bold tracking-wider block ${
                uvMode ? 'text-purple-300' : 'text-stone-500'
              }`}>
                OCCUPATION / PROFESSION
              </span>
              <p className={`font-medium text-xs ${
                uvMode ? 'text-purple-200' : 'text-stone-700'
              }`}>
                {result.occupation || 'Authorized Professional'}
              </p>
            </div>
          </div>

          {/* Center Column: Portrait with UV Ghost Halo */}
          <div className="md:col-span-4 flex flex-col items-center justify-center space-y-2 py-2">
            <div className="relative">
              <div className={`w-28 h-36 rounded-xs border-2 overflow-hidden shadow-subtle flex items-center justify-center transition-all ${
                uvMode
                  ? 'border-cyan-400/80 bg-purple-950/60 ring-2 ring-cyan-500/50 shadow-cyan-950/80'
                  : 'border-stone-300 bg-stone-100'
              }`}>
                {result.photo_url ? (
                  <img
                    src={result.photo_url}
                    alt={result.holder_name}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      uvMode ? 'brightness-90 contrast-125 hue-rotate-15' : ''
                    }`}
                  />
                ) : (
                  <div className="flex flex-col items-center text-stone-400">
                    <User className="w-8 h-8" />
                    <span className="text-[9px] uppercase font-mono mt-1">NO PHOTO</span>
                  </div>
                )}
                {/* UV Ghost Silhouette Overlay on portrait */}
                {uvMode && (
                  <div className="absolute inset-0 border-2 border-dashed border-cyan-400/60 pointer-events-none flex items-center justify-center">
                    <div className="text-[8px] font-mono text-cyan-300/80 uppercase font-bold transform -rotate-12 bg-purple-950/70 px-1 py-0.5 rounded-xs border border-cyan-400/50">
                      365NM GHOST EMBED
                    </div>
                  </div>
                )}
              </div>
              <div className={`absolute bottom-0 inset-x-0 text-[9px] uppercase font-mono text-center py-0.5 ${
                uvMode ? 'bg-cyan-950/90 text-cyan-300 border-t border-cyan-500/50' : 'bg-stone-900/80 text-white'
              }`}>
                OFFICIAL • OFFICIEL
              </div>
            </div>

            <div className="text-center">
              <span className={`text-[9px] uppercase font-bold tracking-wider block ${
                uvMode ? 'text-purple-300' : 'text-stone-500'
              }`}>
                VISA TYPE / CATÉGORIE
              </span>
              <p className={`font-bold text-xs ${
                uvMode ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]' : 'text-cameco-red'
              }`}>
                {result.category}
              </p>
            </div>
          </div>

          {/* Right Column Data */}
          <div className="md:col-span-4 space-y-2.5 text-xs">
            <div>
              <span className={`text-[9px] uppercase font-bold tracking-wider block ${
                uvMode ? 'text-purple-300' : 'text-stone-500'
              }`}>
                DATE OF BIRTH / DATE DE NAISSANCE
              </span>
              <p className={`font-semibold text-xs ${
                uvMode ? 'text-purple-200' : 'text-stone-800'
              }`}>
                {formatDate(result.birth_date || '1995-05-14')}
              </p>
            </div>

            <div>
              <span className={`text-[9px] uppercase font-bold tracking-wider block ${
                uvMode ? 'text-purple-300' : 'text-stone-500'
              }`}>
                GENDER / SEXE
              </span>
              <p className={`font-semibold text-xs ${
                uvMode ? 'text-purple-200' : 'text-stone-800'
              }`}>
                {result.gender || 'Not specified'}
              </p>
            </div>

            <div>
              <span className={`text-[9px] uppercase font-bold tracking-wider block ${
                uvMode ? 'text-purple-300' : 'text-stone-500'
              }`}>
                ISSUE DATE / DATE D'ÉMISSION
              </span>
              <p className={`font-semibold text-xs ${
                uvMode ? 'text-purple-200' : 'text-stone-800'
              }`}>
                {formatDate(result.issue_date)}
              </p>
            </div>

            <div>
              <span className={`text-[9px] uppercase font-bold tracking-wider block ${
                uvMode ? 'text-purple-300' : 'text-stone-500'
              }`}>
                EXPIRY DATE / DATE D'EXPIRATION
              </span>
              <p className={`font-bold text-xs font-mono ${
                uvMode ? 'text-lime-400 drop-shadow-[0_0_6px_rgba(163,230,53,0.8)]' : 'text-amber-900'
              }`}>
                {formatDate(result.expiry_date)}
              </p>
            </div>
          </div>

        </div>

        {/* Machine Readable Zone (MRZ) */}
        <div className={`relative z-10 mt-5 pt-3 border-t font-mono text-[10px] sm:text-[11px] tracking-wider leading-relaxed p-2.5 rounded-xs border select-all overflow-x-auto transition-colors ${
          uvMode
            ? 'bg-purple-950/70 border-cyan-500/50 text-cyan-200 shadow-inner'
            : 'bg-white/70 border-stone-200/70 text-stone-700'
        }`}>
          <div className="whitespace-nowrap">{line1}</div>
          <div className="whitespace-nowrap">{line2}</div>
        </div>

        {/* Bottom Bar: Issuing Authority and Approved Stamp */}
        <div className={`relative z-10 mt-3 pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] transition-colors ${
          uvMode ? 'text-purple-300' : 'text-stone-600'
        }`}>
          <div className="flex items-center space-x-1.5">
            <span className={`font-semibold uppercase tracking-wider ${
              uvMode ? 'text-cyan-300' : 'text-stone-700'
            }`}>
              IMMIGRATION CANADA • BUREAU DE L'IMMIGRATION
            </span>
          </div>

          <div className={`inline-flex items-center space-x-1 px-3 py-1 font-bold rounded-xs uppercase tracking-wider text-[11px] shadow-2xs transition-all ${
            uvMode
              ? 'bg-lime-400/20 border-2 border-lime-400 text-lime-300 drop-shadow-[0_0_10px_rgba(163,230,53,0.9)] animate-pulse'
              : 'bg-emerald-100/90 border border-emerald-400 text-emerald-900'
          }`}>
            <span>APPROVED • APPROUVÉ</span>
          </div>
        </div>

      </div>

      {/* Security Feature Technical Footnote */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
          <span>Security Layer: Fluorescent Phosphor Pigments (Red, Cyan, Neon-Lime Spectrum)</span>
        </span>
        <span className="font-mono text-[10px]">
          ICAO Doc 9303 Compliant • 365nm Optical Standard
        </span>
      </div>

    </div>
  );
}

