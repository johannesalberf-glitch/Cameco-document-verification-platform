'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CanadaFlag } from '@/components/CanadaFlag';
import { ApplicantRecord, RecordStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  ShieldAlert, 
  ArrowRight,
  RefreshCw,
  Building2,
  Calendar
} from 'lucide-react';

export default function GalleryPage() {
  const [records, setRecords] = useState<ApplicantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const categories = [
    'ALL',
    'Temporary Resident Visa',
    'Study Permit Accreditation',
    'Work Authorization Certificate',
    'Express Entry Verification',
    'Provincial Nominee Verification',
    'Visitor Record Validation',
  ];

  const statuses = ['ALL', 'VERIFIED', 'PENDING_REVIEW', 'EXPIRED'];

  useEffect(() => {
    loadGallery(page, category, status, search);
  }, [page, category, status]);

  async function loadGallery(p: number, cat: string, stat: string, s: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', '6');
      if (cat !== 'ALL') params.set('category', cat);
      if (stat !== 'ALL') params.set('status', stat);
      if (s.trim()) params.set('search', s.trim());

      const res = await fetch(`/api/gallery?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
        setPage(data.pagination.page);
        setPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch {
      // Retains existing records on fetch failure.
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadGallery(1, category, status, search);
  }

  function getStatusBadge(st: RecordStatus) {
    switch (st) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>VERIFIED</span>
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>PENDING</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            <AlertCircle className="w-3 h-3 text-slate-600" />
            <span>EXPIRED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>INVALID</span>
          </span>
        );
    }
  }

  return (
    <div className="py-10 lg:py-14 bg-cameco-canvas min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="border-b border-cameco-rule pb-6 space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-cameco-red uppercase tracking-wider">
            <CanadaFlag className="h-3.5 w-7" />
            <span>Authorized Demonstration Index</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-cameco-charcoal font-sans">
            Demonstration Verification Registry
          </h1>
          <p className="text-xs sm:text-sm text-cameco-charcoal-muted max-w-3xl leading-relaxed">
            This public gallery contains synthetic, fictional applicant records and sanitized demonstrative entries used for training, accreditation trials, and API testing. Real non-consensual applicant records are never published publicly.
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 border border-cameco-rule rounded-sm shadow-subtle space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search demo name or code (e.g. CAM-2026-8812)..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-cameco-red font-mono"
              />
            </div>

            <div className="md:col-span-4">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-cameco-red"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Document Categories' : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-cameco-red"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s === 'ALL' ? 'All Statuses' : s}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cameco-red" />
            <span className="text-xs text-stone-500 font-medium">Filtering demonstration records...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white p-12 border border-cameco-rule text-center space-y-3 rounded-sm">
            <ShieldAlert className="w-8 h-8 mx-auto text-stone-400" />
            <h3 className="text-sm font-semibold text-cameco-charcoal">No Sample Records Match Filter</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              No fictional demonstrative filings match your selected criteria. Reset filters to view all entries.
            </p>
            <button
              onClick={() => {
                setCategory('ALL');
                setStatus('ALL');
                setSearch('');
                setPage(1);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-sm transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-white border border-cameco-rule rounded-sm shadow-editorial overflow-hidden flex flex-col"
              >
                <div className="p-4 border-b border-cameco-rule bg-stone-50/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-stone-500 uppercase block">
                      Sample Serial
                    </span>
                    <span className="text-xs font-bold font-mono text-cameco-charcoal">
                      {record.tracking_code}
                    </span>
                  </div>
                  {getStatusBadge(record.status)}
                </div>

                <div className="p-4 space-y-4 flex-1">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-sm border border-stone-200 overflow-hidden bg-stone-100 flex-shrink-0">
                      {record.photo_url ? (
                        <img
                          src={record.photo_url}
                          alt="Synthetic Applicant Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 font-mono text-xs">
                          SYNTH
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider block">
                        Demonstration Subject
                      </span>
                      <h3 className="text-sm font-bold text-cameco-charcoal truncate">
                        {record.first_name} {record.last_name}
                      </h3>
                      <p className="text-xs text-cameco-red font-medium">
                        {record.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] space-y-1.5 pt-2 border-t border-stone-100 text-stone-600">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 flex items-center space-x-1">
                        <Building2 className="w-3 h-3 text-stone-400" />
                        <span>Bureau:</span>
                      </span>
                      <span className="font-medium text-cameco-charcoal truncate max-w-[180px]">
                        {record.issuing_office}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>Validity:</span>
                      </span>
                      <span className="font-medium text-cameco-charcoal">
                        {formatDate(record.issue_date)} — {formatDate(record.expiry_date)}
                      </span>
                    </div>
                  </div>

                  {record.notes && (
                    <p className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-sm border border-stone-100">
                      &quot;{record.notes}&quot;
                    </p>
                  )}
                </div>

                <div className="p-3 bg-stone-50 border-t border-cameco-rule text-right">
                  <Link
                    href={`/?code=${record.tracking_code}`}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-cameco-red hover:text-cameco-red-dark"
                  >
                    <span>Run Verification Query</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-cameco-rule pt-4 text-xs text-stone-600">
          <div>
            Showing {records.length} of {total} demo entries (Page {page} of {totalPages})
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-stone-300 rounded-sm disabled:opacity-40 hover:bg-stone-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-stone-300 rounded-sm disabled:opacity-40 hover:bg-stone-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

