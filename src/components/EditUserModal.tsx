'use client';

import React, { useState } from 'react';
import { ApplicantRecord, RecordCategory, RecordStatus } from '@/lib/types';
import { X, RefreshCw, AlertCircle, Save, Upload, User, Shield, CreditCard, Globe, Briefcase, Calendar } from 'lucide-react';

interface EditUserModalProps {
  record: ApplicantRecord;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (updated: ApplicantRecord) => void;
}

export function EditUserModal({ record, isOpen, onClose, onSaveSuccess }: EditUserModalProps) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<ApplicantRecord>({ 
    ...record,
    phone_number: record.phone_number || '',
    nationality: record.nationality || 'ETHIOPIA',
    passport_number: record.passport_number || record.tracking_code,
    occupation: record.occupation || 'Sell officer',
    gender: (record.gender || 'Female').replace(/ \/ .*$/, ''),
    birth_date: record.birth_date || '2002-07-21',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories: string[] = [
    'Work Authorization Certificate',
    'Temporary Resident Visa',
    'Study Permit Accreditation',
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

    if (file.size > 2 * 1024 * 1024) {
      setError("File exceeds maximum size threshold of 2 megabytes.");
      return;
    }

    setUploading(true);
    setError(null);

    // Read client-side preview immediately using FileReader so photo displays instantly
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormData((prev) => ({ ...prev, photo_url: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, photo_url: data.url }));
      }
    } catch (err) {
      console.warn("Server upload warning, using client-side image data:", err);
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
          tracking_code: formData.tracking_code,
          first_name: formData.first_name,
          last_name: formData.last_name,
          category: formData.category,
          status: formData.status,
          issue_date: formData.issue_date,
          expiry_date: formData.expiry_date,
          issuing_office: formData.issuing_office,
          photo_url: formData.photo_url,
          published_demo: formData.published_demo,
          nationality: formData.nationality,
          passport_number: formData.passport_number,
          phone_number: formData.phone_number,
          occupation: formData.occupation,
          gender: formData.gender,
          birth_date: formData.birth_date,
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
      <div className="bg-white border border-stone-300 rounded-md shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 font-sans">
                Edit User & Visa Filing
              </h2>
              <p className="text-[11px] font-mono text-stone-500">
                Identifier: <strong className="text-slate-800">{record.tracking_code}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Tracking Code & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Tracking Code / Any Digits
              </label>
              <input
                type="text"
                value={formData.tracking_code}
                onChange={(e) => setFormData({ ...formData, tracking_code: e.target.value.toUpperCase() })}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. E00629187 or any digits"
              />
              <p className="text-[10px] text-stone-500 mt-0.5">Used by users to track and verify their card</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Verification Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as RecordStatus })}
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                First Name / Given Names
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. LAMROT GETACHEW"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Last Name / Surname
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. ZEMEDAGEGNEHU"
              />
            </div>
          </div>

          {/* Passport & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Passport Number
              </label>
              <input
                type="text"
                value={formData.passport_number || ''}
                onChange={(e) => setFormData({ ...formData, passport_number: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. E00629187"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number || ''}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. +1 306 956 6200"
              />
            </div>
          </div>

          {/* Nationality & Occupation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Nationality
              </label>
              <input
                type="text"
                value={formData.nationality || ''}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs uppercase focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. ETHIOPIA"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Occupation
              </label>
              <input
                type="text"
                value={formData.occupation || ''}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. Sell officer"
              />
            </div>
          </div>

          {/* Gender & Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender || 'Female'}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.birth_date ? formData.birth_date.split('T')[0] : '2002-07-21'}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* ID Category */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              Document / ID Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as RecordCategory })}
              className="w-full px-3 py-2 border border-stone-300 rounded text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Issue & Expiry Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={formData.issue_date.split('T')[0]}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiry_date.split('T')[0]}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Issuing Office */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              Issuing Authority / Regional Office
            </label>
            <input
              type="text"
              value={formData.issuing_office}
              onChange={(e) => setFormData({ ...formData, issuing_office: e.target.value })}
              required
              className="w-full px-3 py-2 border border-stone-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. Cameco Central Verification Registry"
            />
          </div>

          {/* Photo URL & Upload */}
          <div className="space-y-2 p-3 bg-stone-50 rounded border border-stone-200">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-700">
              Applicant Photo
            </span>

            <div className="flex items-center gap-4">
              {/* Photo Preview */}
              <div className="w-16 h-20 rounded border border-stone-300 overflow-hidden bg-stone-200 flex-shrink-0">
                {formData.photo_url ? (
                  <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <User className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={formData.photo_url || ''}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="Photo image URL or /lamrot-photo.png"
                  className="w-full px-3 py-1.5 border border-stone-300 rounded text-xs"
                />

                <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 cursor-pointer font-medium text-[11px]">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Uploading...' : 'Upload Image File'}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              Internal Registry Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. Official Cameco Identity Card verified and active under Central Verification Registry."
            />
          </div>

          {/* Published Demo Toggle */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="published_demo"
              checked={formData.published_demo}
              onChange={(e) => setFormData({ ...formData, published_demo: e.target.checked })}
              className="h-4 w-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
            />
            <label htmlFor="published_demo" className="text-xs font-semibold text-stone-700">
              Display in public sample gallery / quick-select list
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 border border-stone-300 rounded bg-white hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-sm disabled:opacity-60 flex items-center space-x-1.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
