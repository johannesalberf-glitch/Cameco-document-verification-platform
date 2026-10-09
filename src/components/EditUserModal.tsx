'use client';

import React, { useState } from 'react';
import { ApplicantRecord, RecordCategory, RecordStatus } from '@/lib/types';
import { X, RefreshCw, AlertCircle, Save, Upload, User, Shield } from 'lucide-react';

interface EditUserModalProps {
  record: ApplicantRecord;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (updated: ApplicantRecord) => void;
}

export function EditUserModal({ record, isOpen, onClose, onSaveSuccess }: EditUserModalProps) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<ApplicantRecord>({ ...record });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError(data.error || 'Failed to upload photo.');
      } else {
        setFormData((prev) => ({ ...prev, photo_url: data.url }));
      }
    } catch {
      setError('Network communication failure during photo ingestion.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/records/${record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          category: formData.category,
          status: formData.status,
          issue_date: formData.issue_date,
          expiry_date: formData.expiry_date,
          issuing_office: formData.issuing_office,
          photo_url: formData.photo_url,
          published_demo: formData.published_demo,
          notes: formData.notes,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error || 'Failed to update applicant record.');
      } else {
        onSaveSuccess(payload.data);
        onClose();
      }
    } catch {
      setError('Network communication failure during update.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-cameco-rule rounded-sm shadow-editorial max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cameco-rule bg-stone-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-cameco-red-surface text-cameco-red rounded-sm border border-cameco-red-border">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-cameco-charcoal font-sans">
                Edit Applicant Profile & Filing
              </h2>
              <p className="text-[11px] font-mono text-stone-500">
                Identifier: <strong className="text-cameco-charcoal">{record.tracking_code}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-cameco-charcoal rounded-sm hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-sm flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 uppercase tracking-wider text-[10px]">
                First Name
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-sm text-xs focus:ring-1 focus:ring-cameco-red"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 uppercase tracking-wider text-[10px]">
                Last Name
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-sm text-xs focus:ring-1 focus:ring-cameco-red"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 uppercase tracking-wider text-[10px]">
                Filing Classification
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as RecordCategory })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-sm bg-white text-xs focus:ring-1 focus:ring-cameco-red"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 uppercase tracking-wider text-[10px]">
                Verification Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as RecordStatus })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-sm bg-white text-xs font-semibold focus:ring-1 focus:ring-cameco-red"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 uppercase tracking-wider text-[10px]">
                Issuance Date
              </label>
              <input
                type="date"
                required
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-sm text-xs focus:ring-1 focus:ring-cameco-red"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 uppercase tracking-wider text-[10px]">
                Expiry Date
              </label>
              <input
                type="date"
                required
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-sm text-xs focus:ring-1 focus:ring-cameco-red"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-stone-700 uppercase tracking-wider text-[10px]">
                Issuing Regional Desk
              </label>
              <input
                type="text"
                required
                value={formData.issuing_office}
                onChange={(e) => setFormData({ ...formData, issuing_office: e.target.value })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-sm text-xs focus:ring-1 focus:ring-cameco-red"
              />
            </div>

            <div className="space-y-2 sm:col-span-2 pt-2 border-t border-stone-100">
              <label className="font-semibold text-stone-700 uppercase tracking-wider text-[10px] block">
                Applicant Portrait (Optional)
              </label>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 border border-stone-300 rounded-sm bg-stone-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {formData.photo_url ? (
                    <img src={formData.photo_url} alt="Applicant preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-stone-400" />
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
                  {formData.photo_url && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photo_url: undefined })}
                      className="text-[10px] text-rose-600 hover:underline block"
                    >
                      Remove current photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-stone-700 uppercase tracking-wider text-[10px]">
                Verification Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-1.5 border border-stone-300 rounded-sm text-xs focus:ring-1 focus:ring-cameco-red"
              />
            </div>

            <div className="sm:col-span-2 p-2.5 bg-stone-50 border border-stone-200 rounded-sm flex items-start space-x-2">
              <input
                id="editPublishedDemo"
                type="checkbox"
                checked={formData.published_demo}
                onChange={(e) => setFormData({ ...formData, published_demo: e.target.checked })}
                className="mt-0.5 rounded text-cameco-red focus:ring-cameco-red"
              />
              <label htmlFor="editPublishedDemo" className="text-[11px] text-stone-700">
                <span className="font-semibold block">Demonstration Record (Visible in public gallery)</span>
                <span className="text-stone-500">
                  Enable only if using synthetic details or authorized demonstration consent.
                </span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-cameco-rule flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-stone-300 rounded-sm text-stone-700 hover:bg-stone-50 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-4 py-1.5 bg-cameco-red hover:bg-cameco-red-dark text-white rounded-sm font-semibold transition-colors shadow-subtle disabled:opacity-60 flex items-center space-x-1.5 text-xs"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Profile</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

