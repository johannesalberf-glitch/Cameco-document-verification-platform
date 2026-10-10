'use client';

import React from 'react';
import { Search, Database, FileCheck2 } from 'lucide-react';

export function ProcessSection() {
  const steps = [
    {
      step: '01',
      title: 'Code Submission',
      description: 'Enter your assigned tracking code into the secure verification form. The system checks input format before querying the repository.',
      icon: Search,
    },
    {
      step: '02',
      title: 'Repository Lookup',
      description: 'The server retrieves the corresponding entry from the database, confirming whether the filing is active, pending review, or archived.',
      icon: Database,
    },
    {
      step: '03',
      title: 'Attestation & ID Card',
      description: 'When verified, a standardized attestation is generated displaying authorized document category and validity window while protecting sensitive personal data.',
      icon: FileCheck2,
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cameco-red">
            Workflow Overview
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0b1f3a] font-sans">
            How Verification Works
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Our streamlined process confirms document registration status directly against active repository entries.
          </p>
        </div>

        {/* Distinct Step Progression Layout (Horizontal flow with distinct styling) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-5 sm:p-6 bg-[#fbfbf9] border border-stone-200 rounded-sm space-y-3 relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-stone-400">
                      STEP {item.step}
                    </span>
                    <div className="w-8 h-8 rounded-sm bg-white border border-stone-200 text-[#003865] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#0b1f3a] font-sans">
                    {item.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-400 font-mono">
                  {idx === 0 ? 'Input Verification' : idx === 1 ? 'Server Query' : 'Status Display'}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
