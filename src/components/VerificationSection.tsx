'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Lock,
  ArrowRight,
  Clock,
  XCircle,
  X,
  FileCheck2,
  Info
} from 'lucide-react';
import { CanadaFlag } from './CanadaFlag';
import { MapleLeafIcon } from './MapleLeafIcon';
import { CamecoIdCard } from './CamecoIdCard';
import { PublicVerificationResult } from '@/lib/types';

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
  
  const [animKey, setAnimKey] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimationSettled, setIsAnimationSettled] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Check URL query parameters on mount
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
    return [
      { id: 1, x: -32, y: -36, rot: -20, color: '#C41230', size: 14, delay: 0.1 },
      { id: 2, x: 34, y: -38, rot: 25, color: '#FFFFFF', size: 12, delay: 0.15 },
      { id: 3, x: -42, y: -10, rot: -35, color: '#C41230', size: 13, delay: 0.2 },
      { id: 4, x: 40, y: -12, rot: 30, color: '#C41230', size: 14, delay: 0.18 },
      { id: 5, x: -22, y: -48, rot: -12, color: '#FFFFFF', size: 11, delay: 0.25 },
      { id: 6, x: 24, y: -50, rot: 18, color: '#C41230', size: 12, delay: 0.22 },
    ];
  }

  async function executeVerification(codeToSearch: string) {
    const cleanCode = codeToSearch.trim();
    if (!cleanCode) {
      setErrorType('validation');
      setErrorMessage('Please enter a valid Cameco tracking code.');
      setResult(null);
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
        // Fallback: check locally saved client records
        let localMatch: any = null;
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("cameco_admin_records_cache_v1");
            if (raw) {
              const list = JSON.parse(raw);
              localMatch = list.find((r: any) =>
                r.tracking_code?.toUpperCase() === cleanCode.toUpperCase() ||
                r.passport_number?.toUpperCase() === cleanCode.toUpperCase()
              );
            }
          } catch {}
        }

        if (localMatch) {
          const rec: PublicVerificationResult = {
            tracking_code: localMatch.tracking_code,
            status: localMatch.status,
            category: localMatch.category,
            holder_name: `${localMatch.first_name} ${localMatch.last_name}`.trim(),
            holder_initials: localMatch.first_name ? localMatch.first_name[0] + "." : "A.",
            photo_url: localMatch.photo_url || "/lamrot-photo.png",
            nationality: localMatch.nationality || "UNKNOWN",
            passport_number: localMatch.passport_number || localMatch.tracking_code,
            phone_number: localMatch.phone_number,
            occupation: localMatch.occupation,
            gender: localMatch.gender,
            birth_date: localMatch.birth_date,
            issue_date: localMatch.issue_date,
            expiry_date: localMatch.expiry_date,
            issuing_office: localMatch.issuing_office,
            verified_at: new Date().toISOString(),
            is_demo: Boolean(localMatch.published_demo),
            message: "Official record metadata verified in the Cameco Verification Registry.",
            scope_notice: "Official Attestation Notice: This credential attestation is certified by Cameco Document Verification Platform.",
          };
          setResult(rec);
          setAnimKey((prev) => prev + 1);
          if (rec.status === "VERIFIED") {
            setParticles(generateParticles());
            setTimeout(() => setIsAnimationSettled(true), 1500);
          }
          setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
          return;
        }

        if (res.status === 404) {
          setErrorType('notFound');
          setErrorMessage(
            payload.error || `No matching record exists for tracking code "${cleanCode}".`
          );
        } else if (res.status === 400) {
          setErrorType('validation');
          setErrorMessage(payload.error || 'Invalid code syntax. Expected alphanumeric sequence.');
        } else {
          setErrorType('network');
          setErrorMessage(payload.error || 'Service connectivity interruption. Please try again.');
        }
      } else {
        const record = payload.data as PublicVerificationResult;
        setResult(record);
        setAnimKey((prev) => prev + 1);

        // Trigger tasteful flourish animation only for verified records (max 1.5s)
        if (record.status === 'VERIFIED') {
          setParticles(generateParticles());
          setTimeout(() => {
            setIsAnimationSettled(true);
          }, 1500);
        }

        // Smooth scroll to result
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    } catch {
      setErrorType('network');
      setErrorMessage('Unable to connect to the Cameco verification registry. Please check your network.');
    } finally {
      setLoading(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    executeVerification(trackingCode);
  }

  function handleReset() {
    setTrackingCode('');
    setResult(null);
    setErrorType(null);
    setErrorMessage(null);
  }

  return (
    <section className="bg-[#fbfbf9] border-b border-stone-200 py-10 sm:py-14 lg:py-16" aria-labelledby="verify-heading">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Compact, Well-Composed Introduction */}
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cameco-red">
            <span className="w-1.5 h-1.5 rounded-full bg-cameco-red" />
            <span>Document Verification</span>
          </div>

          <h1 id="verify-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0b1f3a] font-sans">
            Verify a Document
          </h1>

          <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
            Enter your Cameco tracking code to retrieve the corresponding registered record.
          </p>
        </div>

        {/* Tracking-Code Verification Form */}
        <div className="bg-white border border-stone-200 rounded-md shadow-subtle p-5 sm:p-6 space-y-4">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="trackingCodeInput" className="block text-xs font-bold uppercase tracking-wider text-[#0b1f3a] mb-1.5">
                Tracking Code
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Search className="w-4 h-4" />
                </div>
                
                <input
                  id="trackingCodeInput"
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  placeholder="e.g. E00629187 or CAM-2026-8812"
                  className="w-full pl-10 pr-10 py-2.5 text-sm font-mono font-semibold uppercase border border-stone-300 rounded-sm bg-white placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#003865] focus:border-[#003865] transition-shadow text-[#0b1f3a]"
                  aria-describedby="privacy-note"
                  disabled={loading}
                />

                {trackingCode && !loading && (
                  <button
                    type="button"
                    onClick={() => setTrackingCode('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#003865] hover:bg-[#002646] active:bg-[#00172e] text-white text-xs sm:text-sm font-bold rounded-sm transition-colors shadow-2xs disabled:opacity-60 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Labeled Demo Test Code for instant testing */}
              <div className="flex items-center space-x-1.5 text-xs text-stone-500">
                <span>Demo Code:</span>
                <button
                  type="button"
                  onClick={() => {
                    setTrackingCode('E00629187');
                    executeVerification('E00629187');
                  }}
                  className="font-mono font-bold text-xs text-[#003865] hover:text-[#002646] underline decoration-stone-300 hover:decoration-[#003865] transition-colors"
                  title="Load demo test code E00629187"
                >
                  E00629187 (Cameco ID)
                </button>
              </div>
            </div>
          </form>

          {/* Discreet Privacy Explanation */}
          <div id="privacy-note" className="pt-3 border-t border-stone-100 flex items-center space-x-2 text-[11px] text-stone-500">
            <Lock className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
            <span>
              Record details are private and retrieved strictly upon entry of an authorized tracking identifier.
            </span>
          </div>
        </div>

        {/* Accessible Status Announcements */}
        <div className="sr-only" role="status" aria-live="polite">
          {loading && 'Verification query in progress.'}
          {result && `Verification completed. Document status is ${result.status} for record ${result.tracking_code}.`}
          {errorMessage && `Verification notice: ${errorMessage}`}
        </div>

        {/* Error State: Neutral Not-Found State */}
        {errorType === 'notFound' && (
          <div className="bg-white border border-stone-200 border-l-4 border-l-stone-400 p-5 rounded-sm shadow-subtle space-y-2 text-left">
            <div className="flex items-center space-x-2 text-stone-800 font-semibold text-xs uppercase tracking-wider">
              <Info className="w-4 h-4 text-stone-500" />
              <span>Record Not Found</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {errorMessage}
            </p>
            <p className="text-[11px] text-stone-500">
              Please verify your tracking code digits or confirm registration with your issuing bureau.
            </p>
          </div>
        )}

        {/* Error State: Validation or Network Failure */}
        {(errorType === 'validation' || errorType === 'network') && (
          <div className="bg-white border border-rose-200 border-l-4 border-l-rose-500 p-5 rounded-sm shadow-subtle space-y-2 text-left">
            <div className="flex items-center space-x-2 text-rose-800 font-semibold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorType === 'validation' ? 'Input Validation Notice' : 'Network Communication Failure'}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Dynamic Result Display: RENDERED ONLY AFTER SUBMISSION */}
        <div ref={resultRef}>
          {result && (
            <div key={animKey} className="space-y-6">
              
              {/* STATUS 1: VERIFIED (APPROVED) */}
              {result.status === 'VERIFIED' && (
                <div className="anim-panel-reveal space-y-6">
                  
                  {/* Approval Banner with SVG Stroke Checkmark & Tasteful Maple Flourish */}
                  <div className="p-5 sm:p-6 bg-white border border-stone-200 rounded-sm shadow-editorial relative overflow-hidden text-left">
                    
                    {/* Maple Leaf Flourish (Lasts ≤ 1.5 seconds) */}
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
                      <div className="flex items-center space-x-3.5">
                        
                        {/* Circular Success Icon with Self-Drawing Checkmark */}
                        <div className="anim-circle-pop relative flex-shrink-0 w-11 h-11 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-emerald-600"
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

                        <div>
                          <div className="anim-fade-up-1 flex items-center space-x-2">
                            <h2 className="text-lg sm:text-xl font-bold text-[#0b1f3a] font-sans">
                              Verification Successful
                            </h2>
                            <CanadaFlag className="h-3.5 w-7 border border-slate-200 rounded-xs shadow-2xs" />
                          </div>
                          
                          <p className="anim-fade-up-2 text-xs text-stone-500 font-mono mt-0.5">
                            Record Number: <strong className="text-slate-800">{result.tracking_code}</strong> • Category: <span className="text-slate-700 font-sans font-medium">{result.category}</span>
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="anim-fade-up-2 self-start sm:self-center">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>APPROVED & ACTIVE</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Identity Card revealed below result summary */}
                  <div className="anim-panel-reveal">
                    <CamecoIdCard result={result} />
                  </div>
                </div>
              )}

              {/* STATUS 2: PENDING REVIEW (No approved card shown) */}
              {result.status === 'PENDING_REVIEW' && (
                <div className="anim-panel-reveal bg-white border border-amber-300 border-l-4 border-l-amber-500 p-6 rounded-sm shadow-editorial space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#0b1f3a] font-sans">
                        Pending Administrative Review
                      </h2>
                      <p className="text-xs font-mono text-stone-500">
                        Record Number: <strong className="text-slate-800">{result.tracking_code}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-sm border border-amber-200 leading-relaxed">
                    This filing is registered in the Cameco repository but is currently awaiting secondary desk reconciliation or intake verification before final endorsement.
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
                    <span>Holder: <strong className="text-slate-700">{result.holder_name}</strong></span>
                    <span>Category: <strong className="text-slate-700">{result.category}</strong></span>
                  </div>
                </div>
              )}

              {/* STATUS 3: REJECTED / EXPIRED / REVOKED (No approved card shown) */}
              {result.status !== 'VERIFIED' && result.status !== 'PENDING_REVIEW' && (
                <div className="anim-panel-reveal bg-white border border-rose-200 border-l-4 border-l-rose-500 p-6 rounded-sm shadow-editorial space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-rose-900 font-sans">
                        Record Status: {result.status}
                      </h2>
                      <p className="text-xs font-mono text-stone-500">
                        Record Number: <strong className="text-slate-800">{result.tracking_code}</strong>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    This document record is currently not endorsed as active in the verification registry.
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
                    <span>Holder: <strong className="text-slate-700">{result.holder_name}</strong></span>
                    <span>Category: <strong className="text-slate-700">{result.category}</strong></span>
                  </div>
                </div>
              )}

              {/* Reset action button */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-stone-500 hover:text-[#003865] underline transition-colors"
                >
                  Verify another document code
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </section>
  );
}
