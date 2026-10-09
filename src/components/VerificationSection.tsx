'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  XCircle, 
  ShieldAlert, 
  Info, 
  Calendar, 
  Building2, 
  UserCheck, 
  ArrowRight,
  RefreshCw,
  Printer,
  RotateCcw,
  FileSearch,
  Check
} from 'lucide-react';
import { CanadaFlag } from './CanadaFlag';
import { MapleLeafIcon } from './MapleLeafIcon';
import { PublicVerificationResult, RecordStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface Particle {
  id: number;
  x: number;
  y: number;
  rot: number;
  color: string;
  size: number;
  delay: number;
}

export function VerificationSection() {
  const [trackingCode, setTrackingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicVerificationResult | null>(null);
  const [errorType, setErrorType] = useState<'notFound' | 'network' | 'validation' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Controls fresh animation triggers without re-mutating database.
  const [animKey, setAnimKey] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimationSettled, setIsAnimationSettled] = useState(false);

  const sampleCodes = [
    { code: 'CAM-2026-8812', label: 'Approved (Verified)' },
    { code: 'CAM-2026-1934', label: 'Pending Review' },
    { code: 'CAM-2026-7731', label: 'Not Approved' },
    { code: 'CAM-2025-9920', label: 'Expired' },
  ];

  // Auto-loads code from URL parameter if present on client mount.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('code');
      if (urlCode) {
        setTrackingCode(urlCode);
        executeVerification(urlCode);
      }
    }
  }, []);

  function generateParticles(): Particle[] {
    const items: Particle[] = [
      { id: 1, x: -36, y: -42, rot: -25, color: '#C41230', size: 14, delay: 0.1 },
      { id: 2, x: 38, y: -45, rot: 30, color: '#FFFFFF', size: 12, delay: 0.15 },
      { id: 3, x: -48, y: -10, rot: -45, color: '#C41230', size: 13, delay: 0.2 },
      { id: 4, x: 46, y: -12, rot: 40, color: '#C41230', size: 15, delay: 0.18 },
      { id: 5, x: -25, y: -55, rot: -15, color: '#FFFFFF', size: 11, delay: 0.25 },
      { id: 6, x: 26, y: -58, rot: 20, color: '#C41230', size: 13, delay: 0.22 },
    ];
    return items;
  }

  async function executeVerification(codeToSearch: string) {
    const cleanCode = codeToSearch.trim();
    if (!cleanCode) {
      setErrorType('validation');
      setErrorMessage('Please provide a valid document tracking code.');
      return;
    }

    setLoading(true);
    setErrorType(null);
    setErrorMessage(null);
    setResult(null);
    setIsAnimationSettled(false);

    try {
      const res = await fetch(`/api/verify?code=${encodeURIComponent(cleanCode)}`);
      const payload = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setErrorType('notFound');
          setErrorMessage(
            payload.error || 'No document record was located for this tracking code in the Cameco registry.'
          );
        } else if (res.status === 400) {
          setErrorType('validation');
          setErrorMessage(payload.error || 'Invalid tracking code syntax. Expected format: CAM-XXXX-XXXX.');
        } else {
          setErrorType('network');
          setErrorMessage(payload.error || 'The registry service returned an operational error.');
        }
      } else {
        const record = payload.data as PublicVerificationResult;
        setResult(record);
        setAnimKey((prev) => prev + 1);

        if (record.status === 'VERIFIED') {
          setParticles(generateParticles());
          // Settles animation after particle duration.
          setTimeout(() => {
            setIsAnimationSettled(true);
          }, 1600);
        }
      }
    } catch {
      setErrorType('network');
      setErrorMessage('Unable to reach the Cameco verification network. Please check connectivity and re-attempt.');
    } finally {
      setLoading(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    executeVerification(trackingCode);
  }

  function handleReplay() {
    if (result && result.status === 'VERIFIED') {
      setAnimKey((prev) => prev + 1);
      setIsAnimationSettled(false);
      setParticles(generateParticles());
      setTimeout(() => {
        setIsAnimationSettled(true);
      }, 1600);
    }
  }

  return (
    <section className="py-12 lg:py-16 bg-cameco-canvas" aria-labelledby="verify-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Form & Explanations */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-sm bg-cameco-red-surface border border-cameco-red-border text-cameco-red text-xs font-medium">
              <CanadaFlag className="h-3.5 w-7" />
              <span>Federal & Provincial Record Reference</span>
            </div>

            <div className="space-y-3">
              <h1 id="verify-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-cameco-charcoal font-sans">
                Verify a Document
              </h1>
              <p className="text-sm sm:text-base text-cameco-charcoal-muted leading-relaxed">
                Query the Cameco repository to validate temporary resident endorsements, work authorization instruments, and academic visa accreditations issued across Canadian jurisdictions.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 bg-white p-5 sm:p-6 border border-cameco-rule shadow-editorial rounded-sm">
              <div className="space-y-1.5">
                <label htmlFor="trackingCode" className="block text-xs font-semibold uppercase tracking-wider text-cameco-charcoal">
                  Document Tracking Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    id="trackingCode"
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CAM-2026-8812"
                    aria-describedby="code-helper"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm font-mono border border-stone-300 rounded-sm bg-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-cameco-red focus:border-cameco-red transition-shadow uppercase"
                  />
                </div>
                <p id="code-helper" className="text-[11px] text-stone-500">
                  Format: Standard 10-to-14 character Cameco registry identifier.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                <span className="text-stone-500 text-[11px] mr-1">Sample records:</span>
                {sampleCodes.map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => {
                      setTrackingCode(s.code);
                      executeVerification(s.code);
                    }}
                    className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono text-[11px] rounded-sm border border-stone-200 transition-colors"
                  >
                    {s.code}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-white bg-cameco-red hover:bg-cameco-red-dark rounded-sm transition-colors shadow-subtle disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Querying Supabase Registry...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Record</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-stone-100 flex items-start space-x-2 text-[11px] text-stone-500">
                <ShieldAlert className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                <p>
                  Zero-Knowledge Disclosure: Public verification queries reveal only cryptographic validity and non-confidential status metadata. Personal identifying numbers are never exposed.
                </p>
              </div>
            </form>
          </div>

          {/* Right Column: Dynamic Results / Other States */}
          <div className="lg:col-span-7">
            {/* Screen Reader Live Region */}
            <div className="sr-only" role="status" aria-live="polite">
              {loading && 'Querying document verification registry.'}
              {result && `Verification completed. Document status is ${result.status} for tracking code ${result.tracking_code}.`}
              {errorMessage && `Verification error: ${errorMessage}`}
            </div>

            {/* Error State: Network Failure */}
            {errorType === 'network' && (
              <div className="bg-white p-6 border-l-4 border-amber-500 border border-stone-200 shadow-subtle rounded-sm space-y-4">
                <div className="flex items-center space-x-2 text-amber-800 font-semibold text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                  <span>Network Communication Failure</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {errorMessage}
                </p>
                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => executeVerification(trackingCode)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium rounded-sm transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Verification</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error State: Not Found (Neutral State) */}
            {errorType === 'notFound' && (
              <div className="bg-white p-6 border-l-4 border-stone-400 border border-stone-200 shadow-subtle rounded-sm space-y-3">
                <div className="flex items-center space-x-2 text-stone-800 font-semibold text-sm">
                  <Info className="w-5 h-5 flex-shrink-0 text-stone-500" />
                  <span>No Registry Record Located</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {errorMessage}
                </p>
                <div className="text-xs text-stone-500 bg-stone-50 p-3 rounded-sm border border-stone-100 space-y-1">
                  <p className="font-medium text-stone-700">Security Information:</p>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    This registry returns non-identifying results. The absence of a public record does not confirm or disclose whether private immigration filings exist with federal departments.
                  </p>
                </div>
              </div>
            )}

            {/* Error State: Syntax Validation */}
            {errorType === 'validation' && (
              <div className="bg-white p-6 border-l-4 border-rose-500 border border-stone-200 shadow-subtle rounded-sm space-y-3">
                <div className="flex items-center space-x-2 text-rose-700 font-semibold text-sm">
                  <XCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                  <span>Invalid Identifier Format</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Awaiting Input State */}
            {!result && !errorType && (
              <div className="bg-white p-8 border border-cameco-rule shadow-subtle rounded-sm text-center space-y-4">
                <div className="inline-flex p-3 rounded-full bg-stone-100 text-stone-500">
                  <Search className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h2 className="text-base font-semibold text-cameco-charcoal">
                    Awaiting Record Identifier
                  </h2>
                  <p className="text-xs sm:text-sm text-cameco-charcoal-subtle leading-relaxed">
                    Enter a tracking code on the left or select one of the sample references to view authenticated filing status, issuance office, and authorized scope.
                  </p>
                </div>
                <div className="pt-4 border-t border-stone-100 flex flex-wrap justify-center items-center gap-6 text-xs text-stone-500">
                  <span className="flex items-center space-x-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                    <span>Sanitized Holder Initials</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-stone-400" />
                    <span>Issuing Bureau Verification</span>
                  </span>
                </div>
              </div>
            )}

            {/* Result: APPROVED (VERIFIED) - PREMIUM APPROVAL SUCCESS ANIMATION */}
            {result && result.status === 'VERIFIED' && (
              <div
                key={animKey}
                className="anim-panel-reveal bg-white border border-cameco-rule shadow-editorial rounded-sm overflow-hidden"
              >
                {/* Success Header with Maple Particles & SVG Stroke Checkmark */}
                <div className="p-6 sm:p-7 border-b border-cameco-rule bg-stone-50/70 relative overflow-hidden">
                  
                  {/* Subtle Red & White Canadian Maple Leaf Particles */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center" aria-hidden="true">
                    {!isAnimationSettled && particles.map((p) => (
                      <div
                        key={p.id}
                        className="anim-maple-particle absolute"
                        style={{
                          '--tw-particle-x': `${p.x}px`,
                          '--tw-particle-y': `${p.y}px`,
                          '--tw-particle-rot': `${p.rot}deg`,
                          animationDelay: `${p.delay}s`,
                        } as React.CSSProperties}
                      >
                        <MapleLeafIcon
                          className="drop-shadow-xs"
                          fill={p.color}
                          style={{ width: p.size, height: p.size }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center space-x-4">
                      
                      {/* Animated Circular Success Badge with SVG Checkmark Stroke */}
                      <div className="anim-circle-pop relative flex-shrink-0 w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-500/80 flex items-center justify-center shadow-subtle">
                        <svg
                          className="w-6 h-6 text-emerald-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline
                            className="anim-checkmark-stroke"
                            points="20 6 9 17 4 12"
                          />
                        </svg>
                      </div>

                      <div className="space-y-0.5">
                        <div className="anim-fade-up-1 flex items-center space-x-2">
                          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-cameco-charcoal font-sans">
                            Verification Successful
                          </h2>
                          <div className="border border-slate-200 rounded-xs overflow-hidden shadow-2xs">
                            <CanadaFlag className="h-3 w-6" />
                          </div>
                        </div>
                        <p className="anim-fade-up-2 text-xs font-mono text-stone-500">
                          Record Identifier: <strong className="text-cameco-charcoal">{result.tracking_code}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="anim-fade-up-2 flex items-center space-x-2 self-start sm:self-center">
                      {result.is_demo && (
                        <span className="px-2 py-0.5 rounded-sm bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-semibold uppercase">
                          Demonstration Record
                        </span>
                      )}
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-sm text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>AUTHENTICATED & ACTIVE</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Staggered Record Details Panel */}
                <div className="anim-fade-up-3 p-5 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-stone-50 rounded-sm border border-stone-200/60 space-y-1">
                      <span className="text-stone-500 flex items-center space-x-1.5 font-medium">
                        <FileSearch className="w-3.5 h-3.5" />
                        <span>Document Category</span>
                      </span>
                      <p className="font-semibold text-cameco-charcoal text-sm">
                        {result.category}
                      </p>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-sm border border-stone-200/60 space-y-1">
                      <span className="text-stone-500 flex items-center space-x-1.5 font-medium">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Holder Identification</span>
                      </span>
                      <p className="font-semibold text-cameco-charcoal text-sm">
                        {result.holder_initials} (Protected Identifier)
                      </p>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-sm border border-stone-200/60 space-y-1">
                      <span className="text-stone-500 flex items-center space-x-1.5 font-medium">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Issuing Regional Bureau</span>
                      </span>
                      <p className="font-semibold text-cameco-charcoal text-sm">
                        {result.issuing_office}
                      </p>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-sm border border-stone-200/60 space-y-1">
                      <span className="text-stone-500 flex items-center space-x-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Validity Period</span>
                      </span>
                      <p className="font-semibold text-cameco-charcoal text-sm">
                        {formatDate(result.issue_date)} — {formatDate(result.expiry_date)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-stone-100">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>What this verification establishes</span>
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed pl-5">
                        {result.message}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800 flex items-center space-x-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-600" />
                        <span>Scope Limitations & Disclaimers</span>
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed pl-5 bg-amber-50/60 p-2.5 rounded-sm border border-amber-200/50">
                        {result.scope_notice}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-cameco-rule flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-500">
                    <span>
                      Attestation timestamp: <strong className="font-mono text-cameco-charcoal">{formatDate(result.verified_at)}</strong>
                    </span>
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={handleReplay}
                        className="inline-flex items-center space-x-1 text-stone-600 hover:text-cameco-charcoal transition-colors"
                        title="Replay approval animation"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Replay Animation</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center space-x-1 text-stone-600 hover:text-cameco-charcoal transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Summary</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Result: PENDING REVIEW */}
            {result && result.status === 'PENDING_REVIEW' && (
              <div className="anim-panel-reveal bg-white border border-cameco-rule shadow-editorial rounded-sm overflow-hidden">
                <div className="p-6 border-b border-cameco-rule bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-cameco-charcoal font-sans">
                        Pending Administrative Review
                      </h2>
                      <p className="text-xs font-mono text-stone-500">
                        Tracking Code: <strong className="text-cameco-charcoal">{result.tracking_code}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-sm text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                    UNDER ADMINISTRATIVE REVIEW
                  </span>
                </div>

                <div className="p-5 sm:p-6 space-y-5 text-xs">
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-sm text-amber-900 leading-relaxed">
                    This filing is actively registered in the Cameco repository but is currently awaiting secondary issuing desk reconciliation, biometrics confirmation, or institutional labor audit before final validation endorsement.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-stone-50 rounded-sm border border-stone-200/60 space-y-1">
                      <span className="text-stone-500 font-medium">Category</span>
                      <p className="font-semibold text-cameco-charcoal">{result.category}</p>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-sm border border-stone-200/60 space-y-1">
                      <span className="text-stone-500 font-medium">Issuing Bureau</span>
                      <p className="font-semibold text-cameco-charcoal">{result.issuing_office}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Result: REJECTED / NOT APPROVED */}
            {result && result.status === 'REJECTED' && (
              <div className="anim-panel-reveal bg-white border border-cameco-rule shadow-editorial rounded-sm overflow-hidden">
                <div className="p-6 border-b border-cameco-rule bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-cameco-charcoal font-sans">
                        Document Not Approved
                      </h2>
                      <p className="text-xs font-mono text-stone-500">
                        Tracking Code: <strong className="text-cameco-charcoal">{result.tracking_code}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-sm text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300">
                    NOT APPROVED
                  </span>
                </div>

                <div className="p-5 sm:p-6 space-y-5 text-xs">
                  <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-sm text-rose-900 leading-relaxed">
                    This document reference was rejected by the registering bureau or flagged for credential discrepancy. It does not possess active accreditation in the Cameco registry.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-stone-50 rounded-sm border border-stone-200/60 space-y-1">
                      <span className="text-stone-500 font-medium">Category</span>
                      <p className="font-semibold text-cameco-charcoal">{result.category}</p>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-sm border border-stone-200/60 space-y-1">
                      <span className="text-stone-500 font-medium">Filing Bureau</span>
                      <p className="font-semibold text-cameco-charcoal">{result.issuing_office}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Result: EXPIRED / REVOKED */}
            {result && (result.status === 'EXPIRED' || result.status === 'REVOKED') && (
              <div className="anim-panel-reveal bg-white border border-cameco-rule shadow-editorial rounded-sm overflow-hidden">
                <div className="p-6 border-b border-cameco-rule bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-cameco-charcoal font-sans">
                        Record Validity Expired
                      </h2>
                      <p className="text-xs font-mono text-stone-500">
                        Tracking Code: <strong className="text-cameco-charcoal">{result.tracking_code}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-sm text-xs font-semibold bg-slate-200 text-slate-900 border border-slate-300">
                    EXPIRED / INACTIVE
                  </span>
                </div>

                <div className="p-5 sm:p-6 space-y-5 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm text-slate-700 leading-relaxed">
                    This certificate accreditation has passed its designated expiry date ({formatDate(result.expiry_date)}). Renewal or extension filing with the issuing bureau is required for valid attestation.
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
}

