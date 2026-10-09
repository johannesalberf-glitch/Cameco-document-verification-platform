import React from 'react';
import { CanadaFlag } from './CanadaFlag';
import { ShieldCheck, Award, FileText, CheckCircle } from 'lucide-react';

export function IntroSection() {
  return (
    <section className="bg-white border-b border-cameco-rule py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cameco-red">
              <span className="w-2 h-2 rounded-full bg-cameco-red" />
              <span>Independent Accreditation Infrastructure</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-cameco-charcoal font-sans">
              Precision Document Verification for Canadian Visa Instruments
            </h2>
            <p className="text-sm sm:text-base text-cameco-charcoal-muted leading-relaxed max-w-3xl">
              Cameco maintains an authoritative reference index for visa endorsements, educational accreditations, and work permit validation records. By combining cryptographic serial indexing with zero-knowledge verification boundaries, institutions can audit document validity while preserving applicant privacy.
            </p>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-start space-x-2.5">
                <CheckCircle className="w-4 h-4 text-cameco-red flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-cameco-charcoal font-semibold">Deterministic Records</strong>
                  <span className="text-stone-500">Every serial corresponds to an immutable registry entry.</span>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle className="w-4 h-4 text-cameco-red flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-cameco-charcoal font-semibold">Privacy by Design</strong>
                  <span className="text-stone-500">No passport or sensitive PII exposed in public audits.</span>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle className="w-4 h-4 text-cameco-red flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-cameco-charcoal font-semibold">Standardized Classification</strong>
                  <span className="text-stone-500">Structured categories for study, work, and residency instruments.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="p-4 bg-stone-50 border border-cameco-rule rounded-sm shadow-subtle max-w-xs text-center space-y-3">
              <div className="flex justify-center">
                <CanadaFlag className="h-16 w-32 border border-slate-200 shadow-subtle rounded-sm" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-cameco-charcoal block">
                  Canadian Document Registry Standard
                </span>
                <span className="text-[11px] text-cameco-charcoal-subtle block leading-relaxed">
                  Engineered in compliance with Canadian data handling standards for credential authenticity checks.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

