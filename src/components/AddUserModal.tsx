'use client';

import React, { useState } from 'react';
import { ApplicantRecord, RecordCategory, RecordStatus } from '@/lib/types';
import { generateTrackingCode } from '@/lib/utils';
import { X, RefreshCw, AlertCircle, Plus, Upload, User, Sparkles } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSuccess: (created: ApplicantRecord) => void;
}

export function AddUserModal({ isOpen, onClose, onAddSuccess }: AddUserModalProps) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    tracking_code: generateTrackingCode(),
    first_name: '',
    last_name: '',
    phone_number: '',
    passport_number: '',
    nationality: 'ETHIOPIA',
    occupation: 'Sell officer',
    gender: 'Female',
    birth_date: '2002-07-21',
    category: 'Work Authorization Certificate' as RecordCategory,
    status: 'VERIFIED' as RecordStatus,
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    issuing_office: 'Cameco Central Verification Registry',
    photo_url: '/lamrot-photo.png',
    published_demo: true,
    notes: 'Official Cameco Identity Record verified and active under registry registration.',
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

  function handleFillCamecoSample() {
    setFormData({
      tracking_code: 'E00629187',
      first_name: 'LAMROT GETACHEW',
      last_name: 'ZEMEDAGEGNEHU',
      phone_number: '+251 91 123 4567',
      passport_number: 'E00629187',
      nationality: 'ETHIOPIA',
      occupation: 'Sell officer',
      gender: 'Female',
      birth_date: '2002-07-21',
      category: 'Work Authorization Certificate',
      status: 'VERIFIED',
      issue_date: '2026-09-29',
      expiry_date: '2029-11-15',
      issuing_office: 'Cameco Central Verification Registry',
      photo_url: '/lamrot-photo.png',
      published_demo: true,
      notes: 'Official Cameco Identity Record verified and active under registry registration.',
    });
  }

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

      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error || 'Failed to create applicant record.');
      } else {
        onAddSuccess(payload.data);
        onClose();
      }
    } catch {
      setError('Network communication failure during registration.');
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
            <div className="p-2 bg-slate-900 text-white rounded">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 font-sans">
                Add New User / Electronic Visa Record
              </h2>
              <p className="text-[11px] text-stone-500">
                Register a new applicant filing and generate their official identity card
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleFillCamecoSample}
              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded flex items-center space-x-1"
              title="Autofill fields with sample from Cameco registry"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Fill Cameco Sample</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="m-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Add Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Tracking Code & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Tracking Code / Any Digits *
              </label>
              <input
                type="text"
                value={formData.tracking_code}
                onChange={(e) => setFormData({ ...formData, tracking_code: e.target.value.toUpperCase() })}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. E00629187 or any digits"
              />
              <p className="text-[10px] text-stone-500 mt-0.5">Custom digits or auto-generated</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Verification Status *
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
                First Name / Given Names *
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
                Last Name / Surname *
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

          {/* Phone Number & Passport */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Phone Number (Contact Tel)
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. +1 (613) 555-0199 or +251 91 123 4567"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Passport Number
              </label>
              <input
                type="text"
                value={formData.passport_number}
                onChange={(e) => setFormData({ ...formData, passport_number: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g. E00629187"
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
                value={formData.nationality}
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
                value={formData.occupation}
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
                value={formData.gender}
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
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Document Category */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
              Document Category / Type *
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
                Issue Date *
              </label>
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                value={formData.expiry_date}
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
                  value={formData.photo_url}
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
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. Official Cameco Identity Record verified and active."
            />
          </div>

          {/* Published Demo Toggle */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="new_published_demo"
              checked={formData.published_demo}
              onChange={(e) => setFormData({ ...formData, published_demo: e.target.checked })}
              className="h-4 w-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
            />
            <label htmlFor="new_published_demo" className="text-xs font-semibold text-stone-700">
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
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-sm disabled:opacity-60 flex items-center space-x-1.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create User & Visa</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
