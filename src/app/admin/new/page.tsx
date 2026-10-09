'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CanadaFlag } from '@/components/CanadaFlag';
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  FileText
} from 'lucide-react';
import { RecordCategory, RecordStatus } from '@/lib/types';
import { generateTrackingCode } from '@/lib/utils';

export default function NewRecordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tracking_code: generateTrackingCode(),
    first_name: '',
    last_name: '',
    category: 'Temporary Resident Visa' as RecordCategory,
    status: 'VERIFIED' as RecordStatus,
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    issuing_office: 'Ottawa Central Verification Registry',
    photo_url: '',
    published_demo: false,
    notes: '',
  });

  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to process document photo.');
      } else {
        setFormData((prev) => ({ ...prev, photo_url: data.url }));
      }
    } catch {
      setError('Network communication failure during photo ingestion.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to register record in database.');
      } else {
        router.push('/admin');
      }
    } catch {
      setError('Network transmission failure.');
    } finally {
      setLoading(false);
    }
  }

  const categories: RecordCategory[] = [
    'Temporary Resident Visa',
    'Study Permit Accreditation',
    'Work Authorization Certificate',
    'Express Entry Verification',
    'Provincial Nominee Verification',
    'Visitor Record Validation',
  ];

  const statuses: RecordStatus[] = [
    'VERIFIED',
    'PENDING_REVIEW',
    'REJECTED',
    'EXPIRED',
    'REVOKED',
  ];

  return (
    <div className="py-10 bg-cameco-canvas min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        <div className="flex items-center justify-between border-b border-cameco-rule pb-4">
          <Link
            href="/admin"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-cameco-charcoal hover:text-cameco-red transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Record Index</span>
          </Link>
          <div className="inline-flex items-center space-x-2 text-xs font-medium text-stone-500">
            <CanadaFlag className="h-3.5 w-7" />
            <span>Registry Intake Protocol</span>
          </div>
        </div>

        <div className="bg-white border border-cameco-rule rounded-sm shadow-editorial p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-cameco-charcoal font-sans">
              Register New Document Record
            </h1>
            <p className="text-xs text-stone-500">
              Submit accredited certificate particulars into the Cameco verified repository.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-sm text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold uppercase tracking-wider text-cameco-charcoal">
                    Tracking Code (Unique Identifier)
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, tracking_code: generateTrackingCode() }))}
                    className="text-[11px] text-cameco-red hover:underline flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Regenerate Random Code</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.tracking_code}
                  onChange={(e) => setFormData({ ...formData, tracking_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-sm font-mono text-sm uppercase focus:ring-1 focus:ring-cameco-red"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-cameco-charcoal">
                  Applicant First Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="e.g. Gabriel"
                  className="w-full px-3 py-2 border border-stone-300 rounded-sm text-sm focus:ring-1 focus:ring-cameco-red"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-cameco-charcoal">
                  Applicant Family Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="e.g. Tremblay"
                  className="w-full px-3 py-2 border border-stone-300 rounded-sm text-sm focus:ring-1 focus:ring-cameco-red"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-cameco-charcoal">
                  Document Classification Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as RecordCategory })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-sm bg-white text-sm focus:ring-1 focus:ring-cameco-red"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-cameco-charcoal">
                  Initial Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as RecordStatus })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-sm bg-white text-sm focus:ring-1 focus:ring-cameco-red"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-cameco-charcoal">
                  Issuance Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-sm text-sm focus:ring-1 focus:ring-cameco-red"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-cameco-charcoal">
                  Validity Expiry Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-sm text-sm focus:ring-1 focus:ring-cameco-red"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold uppercase tracking-wider text-cameco-charcoal">
                  Issuing Regional Bureau / Desk
                </label>
                <input
                  type="text"
                  required
                  value={formData.issuing_office}
                  onChange={(e) => setFormData({ ...formData, issuing_office: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-sm text-sm focus:ring-1 focus:ring-cameco-red"
                />
              </div>

              <div className="space-y-2 sm:col-span-2 pt-2 border-t border-stone-100">
                <label className="font-semibold uppercase tracking-wider text-cameco-charcoal block">
                  Document Applicant Portrait (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 border border-stone-300 rounded-sm bg-stone-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {formData.photo_url ? (
                      <img src={formData.photo_url} alt="Uploaded portrait" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-5 h-5 text-stone-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="text-xs text-stone-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-sm file:border file:border-stone-200 file:text-xs file:font-medium file:bg-stone-100 hover:file:bg-stone-200"
                    />
                    <p className="text-[11px] text-stone-400">
                      JPEG, PNG or WebP up to 2MB. Uploaded to secure private storage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold uppercase tracking-wider text-cameco-charcoal">
                  Internal Verification / Regulatory Audit Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Record compliance details, institution references, or special considerations..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-sm text-sm focus:ring-1 focus:ring-cameco-red"
                />
              </div>

              <div className="sm:col-span-2 p-3 bg-stone-50 border border-stone-200 rounded-sm flex items-start space-x-2">
                <input
                  id="publishedDemo"
                  type="checkbox"
                  checked={formData.published_demo}
                  onChange={(e) => setFormData({ ...formData, published_demo: e.target.checked })}
                  className="mt-0.5 rounded text-cameco-red focus:ring-cameco-red"
                />
                <label htmlFor="publishedDemo" className="text-xs text-stone-700">
                  <span className="font-semibold block">Publish to Public Demonstration Archive</span>
                  <span className="text-stone-500">
                    Check ONLY if this record uses synthetic data or has explicit public disclosure authorization for training and system trials.
                  </span>
                </label>
              </div>

            </div>

            <div className="pt-4 border-t border-cameco-rule flex items-center justify-end space-x-3">
              <Link
                href="/admin"
                className="px-4 py-2 border border-stone-300 rounded-sm text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-5 py-2 bg-cameco-red hover:bg-cameco-red-dark text-white rounded-sm font-medium transition-colors shadow-subtle disabled:opacity-60 flex items-center space-x-1.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Committing Record...</span>
                  </>
                ) : (
                  <span>Commit Record to Registry</span>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

