'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FaqSection() {
  const faqs = [
    {
      q: 'What documents can be verified through the Cameco platform?',
      a: 'The Cameco verification system authenticates registered document instruments including Work Authorization Certificates, Educational and Study Permits, Permanent and Temporary Residency verifications, and corporate credential filings registered in our repository.',
    },
    {
      q: 'Does a Cameco verification attestation replace official government notices?',
      a: 'No. Cameco operates as an independent document attestation platform. A verified record confirms that the tracking identifier and document metadata match active registered entries in this database. It does not replace statutory decisions issued by government immigration or border agencies.',
    },
    {
      q: 'Why are personal demographic details masked in verification results?',
      a: 'To safeguard applicant privacy and prevent unauthorized enumeration or scraping, sensitive details such as full passport numbers and contact telephone numbers are masked by default during verification audits.',
    },
    {
      q: 'What does the "Pending Administrative Review" status indicate?',
      a: 'A pending review status indicates that the filing exists in the repository but is currently awaiting secondary desk reconciliation, intake validation, or documentary audit before final verification is issued.',
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  function toggle(idx: number) {
    setOpenIdx(openIdx === idx ? null : idx);
  }

  return (
    <section id="faq" className="py-12 sm:py-16 bg-white border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cameco-red">
            Guidance
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0b1f3a] font-sans">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Key information regarding verification scope, data privacy, and record processing.
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="border border-stone-200 rounded-sm overflow-hidden bg-white shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-5 py-3.5 text-left flex items-center justify-between space-x-4 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-semibold text-[#0b1f3a]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'transform rotate-180 text-cameco-red' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 py-3.5 border-t border-stone-100 text-xs sm:text-sm text-stone-600 leading-relaxed bg-white">
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
