import React from 'react';
import { Search, Database, FileCheck } from 'lucide-react';

export function ProcessSection() {
  const steps = [
    {
      num: '01',
      title: 'Tracking Code Ingestion',
      description: 'The verification client receives the unique alphanumeric certificate identifier (e.g. CAM-2026-8812) and executes localized checksum validation before issuing database lookups.',
      icon: Search,
    },
    {
      num: '02',
      title: 'Cryptographic Registry Query',
      description: 'The query evaluates record integrity against the PostgreSQL relational state. Tamper-evident checksums prevent altered or counterfeit records from authenticating.',
      icon: Database,
    },
    {
      num: '03',
      title: 'Redacted Status Attestation',
      description: 'An authenticated validation attestation is produced displaying document category, current status, and validity window. Protected applicant PII remains safely restricted.',
      icon: FileCheck,
    },
  ];

  return (
    <section className="py-12 lg:py-16 bg-white border-b border-cameco-rule">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-cameco-red">
            Verification Methodology
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-cameco-charcoal font-sans">
            How Document Verification Operates
          </h2>
          <p className="text-xs sm:text-sm text-cameco-charcoal-muted leading-relaxed">
            Our multi-tier verification process delivers deterministic authenticity determinations without exposing sensitive demographic records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="p-6 bg-cameco-canvas border border-cameco-rule rounded-sm shadow-subtle space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-stone-400">
                    PHASE {s.num}
                  </span>
                  <div className="p-2 rounded-sm bg-white border border-stone-200 text-cameco-red">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-cameco-charcoal">
                    {s.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

