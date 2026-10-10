'use client';

import React from 'react';
import { ApplicantRecord, PublicVerificationResult } from '@/lib/types';
import { CamecoIdCard } from './CamecoIdCard';
import { X, CreditCard, ExternalLink } from 'lucide-react';

interface PreviewCardModalProps {
  record: ApplicantRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewCardModal({ record, isOpen, onClose }: PreviewCardModalProps) {
  if (!isOpen || !record) return null;

  const publicResult: PublicVerificationResult = {
    tracking_code: record.tracking_code,
    status: record.status,
    category: record.category,
    holder_name: `${record.first_name} ${record.last_name}`.toUpperCase(),
    holder_initials: `${record.first_name.charAt(0)}. ${record.last_name.charAt(0)}.`,
    photo_url: record.photo_url || '',
    nationality: record.nationality || 'CANADA',
    passport_number: record.passport_number || record.tracking_code,
    phone_number: record.phone_number || '+1 306 956 6200',
    occupation: record.occupation || 'Sell officer',
    gender: (record.gender || 'Female').replace(/ \/ .*$/, ''),
    birth_date: record.birth_date || '2002-07-21',
    issuing_office: record.issuing_office || 'Cameco Central Verification Registry',
    issue_date: record.issue_date,
    expiry_date: record.expiry_date,
    verified_at: new Date().toISOString(),
    is_demo: record.published_demo,
    message: 'Official Cameco identity record registered in Central Registry.',
    scope_notice: 'Official Attestation Notice: Certified under Cameco verification framework.',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-300 rounded-md shadow-2xl max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#003865] text-white rounded">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 font-sans">
                  Generated Identity Card Preview
                </h2>
                <span className="px-2 py-0.5 rounded-xs text-[10px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">
                  cameco Id
                </span>
              </div>
              <p className="text-[11px] font-mono text-stone-500 mt-0.5">
                Tracking Code: <strong className="text-slate-800">{record.tracking_code}</strong> • Passport: <strong className="text-slate-800">{record.passport_number || 'N/A'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={`/?code=${record.tracking_code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-stone-50 border border-stone-300 rounded flex items-center space-x-1.5 transition-colors"
            >
              <span>Open in User Tracker</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 p-1.5 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body with Cameco ID Card */}
        <div className="p-5 sm:p-8 bg-slate-100 overflow-y-auto max-h-[80vh]">
          <CamecoIdCard result={publicResult} />
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center justify-between text-xs">
          <span className="text-stone-500">
            Applicant: <strong className="text-stone-800">{record.first_name} {record.last_name}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-stone-700 hover:text-stone-900 border border-stone-300 rounded bg-white hover:bg-stone-50"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}
