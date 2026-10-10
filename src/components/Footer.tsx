import React from 'react';
import Link from 'next/link';
import { CanadaFlag } from './CanadaFlag';

export function Footer() {
  return (
    <footer className="bg-white border-t border-cameco-rule text-cameco-charcoal-muted mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-3">
              <CanadaFlag className="h-5 w-10 border border-slate-200/80 rounded-sm" />
              <span className="font-semibold text-base text-cameco-charcoal">
                CAMECO Document Verification Services
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-cameco-charcoal-subtle max-w-lg">
              Cameco provides cryptographic and serial-referenced document validation services for authorized visa instruments, study permits, and labor accreditations issued across Canadian jurisdictions.
            </p>
            <div className="text-xs text-stone-500 font-mono">
              Registry Server: CA-EAST-OTT-01 • Engine v2.4.1
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-cameco-charcoal uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-stone-700 hover:text-cameco-red">
                  Verify Document
                </Link>
              </li>
              <li>
                <a href="#faq" className="text-stone-700 hover:text-cameco-red">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <span className="text-stone-500">
                  PIPEDA Compliance Verified
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cameco-rule pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-cameco-charcoal-subtle space-y-3 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} Cameco Document Verification. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <span>Confidentiality & Privacy</span>
            <span>Terms of Registry</span>
            <span>Independent Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

