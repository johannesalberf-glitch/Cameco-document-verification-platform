'use client';

import React from 'react';
import Link from 'next/link';
import { CanadaFlag } from './CanadaFlag';

export function Footer() {
  return (
    <footer className="bg-white border-t border-stone-200 text-stone-600 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-200/80">
          
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <CanadaFlag className="h-4 w-8 border border-slate-200 rounded-xs" />
              <span className="font-bold text-sm tracking-tight text-[#0b1f3a]">
                CAMECO Document Verification
              </span>
            </div>
            <p className="text-xs text-stone-500 max-w-md leading-relaxed">
              Independent document reference index and status attestation registry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-stone-600">
            <Link href="/" className="hover:text-cameco-red transition-colors">
              Verify a Document
            </Link>
            <a href="#faq" className="hover:text-cameco-red transition-colors">
              Frequently Asked Questions
            </a>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500">
              PIPEDA Privacy Alignment
            </span>
          </div>
        </div>

        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2">
          <div>
            © {new Date().getFullYear()} Cameco Document Verification. All rights reserved.
          </div>
          <div className="flex space-x-4 text-stone-400">
            <span>Independent Platform</span>
            <span>Terms of Registry</span>
            <span>Privacy Protection</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
