'use client';

import React from 'react';
import { Lock, EyeOff, ShieldCheck, History } from 'lucide-react';
import { CanadaFlag } from './CanadaFlag';

export function SecuritySection() {
  const points = [
    {
      title: 'Private Query Boundary',
      desc: 'Public verification lookups require a valid matching tracking code. The system does not support public user browsing, scraping, or open directory enumeration.',
      icon: EyeOff,
    },
    {
      title: 'Restricted Demographic Display',
      desc: 'Sensitive identifiers such as passport numbers and phone numbers are masked or restricted by default, preventing unnecessary exposure during status audits.',
      icon: Lock,
    },
    {
      title: 'Audited Administrative Access',
      desc: 'Record creation, status modifications, and document updates require authenticated operator credentials and are recorded in an internal audit trail.',
      icon: History,
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#fbfbf9] border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Heading and Context */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cameco-red">
              <span className="w-1.5 h-1.5 rounded-full bg-cameco-red" />
              <span>Data Protection</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0b1f3a] font-sans">
              Privacy & Security Controls
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Cameco document verification is engineered with privacy-by-design principles to ensure that personal records remain protected while providing reliable status validation.
            </p>

            <div className="p-4 bg-white border border-stone-200 rounded-sm shadow-subtle space-y-2">
              <div className="flex items-center space-x-2">
                <CanadaFlag className="h-4 w-8 border border-slate-200 rounded-xs" />
                <span className="text-xs font-bold text-slate-800">
                  Canadian Data Handling Standard
                </span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Database architectures and query endpoints are structured to respect Canadian federal privacy principles regarding document verification and personal data minimization.
              </p>
            </div>
          </div>

          {/* Right Column: Key Commitments in Vertical List (Distinct from 3-card layout) */}
          <div className="lg:col-span-7 space-y-3.5">
            {points.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="p-4 sm:p-5 bg-white border border-stone-200 rounded-sm shadow-subtle flex items-start space-x-4"
                >
                  <div className="w-8 h-8 rounded-sm bg-stone-100 border border-stone-200 text-[#003865] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#0b1f3a] font-sans">
                      {p.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
