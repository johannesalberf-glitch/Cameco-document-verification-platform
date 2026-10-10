'use client';

import React from 'react';
import Link from 'next/link';
import { CanadaFlag } from './CanadaFlag';
import { FileSearch } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-cameco-rule bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center space-x-3.5 group">
            <div className="flex items-center border border-slate-200/80 shadow-subtle rounded-sm overflow-hidden bg-white">
              <CanadaFlag className="h-6 w-12 object-cover" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-lg tracking-tight text-cameco-charcoal font-sans">
                  CAMECO
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded-sm bg-stone-100 text-stone-700 border border-stone-200">
                  Verification
                </span>
              </div>
              <span className="text-[11px] text-cameco-charcoal-subtle tracking-normal">
                Independent Visa Document Attestation
              </span>
            </div>
          </Link>

          <nav className="flex items-center space-x-2">
            <Link
              href="/"
              className="flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-sm text-cameco-red bg-cameco-red-surface border-b-2 border-cameco-red font-semibold transition-colors"
            >
              <FileSearch className="w-4 h-4" />
              <span>Document Verification</span>
            </Link>
          </nav>
        </div>
      </div>
      <div className="bg-stone-100 border-t border-b border-stone-200/70 px-4 py-1 text-center text-[11px] text-stone-600">
        <span className="font-medium">Notice:</span> Cameco is an independent verification platform. Records attest strictly to registered documentation in this database and do not substitute for official IRCC notifications.
      </div>
    </header>
  );
}

