'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FaqSection() {
  const faqs = [
    {
      q: 'What types of documents can be verified through the Cameco platform?',
      a: 'Cameco verifies accredited Canadian visa instruments including Temporary Resident Visas (TRV), Study Permit Accreditations, Work Authorization Certificates, Express Entry credential filings, and Provincial Nominee documentation registered within our institutional ledger.',
    },
    {
      q: 'Does a Cameco verification attestation replace official IRCC determinations?',
      a: 'No. Cameco operates as an independent document verification and attestation index. A verified status certifies that document serial and metadata match the active registered filing. It does not replace, grant, or modify formal statutory decisions issued by Immigration, Refugees and Citizenship Canada (IRCC) or the Canada Border Services Agency (CBSA).',
    },
    {
      q: 'Why does the public verification output display only applicant initials?',
      a: 'In compliance with Canadian privacy legislation (PIPEDA) and strict zero-knowledge disclosure principles, public verification lookups redact all identifying particulars (e.g. passport numbers, residential addresses, and full names) to prevent unauthorized enumeration or scraping.',
    },
    {
      q: 'What does the "Under Administrative Review" status indicate?',
      a: 'An "Under Administrative Review" status indicates that the filing is registered in the database but currently awaiting routine biometrics reconciliation, labor market validation, or secondary issuing-office audit prior to final endorsement.',
    },
    {
      q: 'How are demonstration gallery records generated and managed?',
      a: 'Records displayed in the Public Demonstration Archive represent synthetic, fictional records generated strictly for system demonstration and training purposes, or records where explicit public disclosure consent was granted by the originating bureau.',
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  function toggle(idx: number) {
    setOpenIdx(openIdx === idx ? null : idx);
  }

  return (
    <section id="faq" className="py-12 lg:py-16 bg-white border-b border-cameco-rule">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-cameco-red">
            Guidance & Documentation
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-cameco-charcoal font-sans">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-cameco-charcoal-muted leading-relaxed">
            Essential information regarding verification scope, legal boundaries, and record processing workflows.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="border border-cameco-rule rounded-sm overflow-hidden bg-white shadow-subtle"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between space-x-4 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-semibold text-cameco-charcoal">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-500 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'transform rotate-180 text-cameco-red' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 py-4 border-t border-cameco-rule text-xs sm:text-sm text-stone-600 leading-relaxed bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

