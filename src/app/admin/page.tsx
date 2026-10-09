'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CanadaFlag } from '@/components/CanadaFlag';
import { EditUserModal } from '@/components/EditUserModal';
import { ApplicantRecord, AuditLog, RecordStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Trash2, 
  LogOut, 
  History, 
  RefreshCw,
  Eye,
  FileText,
  Edit,
  Download,
  BarChart3,
  CheckSquare,
  Square,
  Sparkles,
  Users
} from 'lucide-react';

interface RegistryStats {
  totalRecords: number;
  verifiedCount: number;
  pendingCount: number;
  rejectedCount: number;
  expiredCount: number;
  demoCount: number;
  totalAuditLogs: number;
  lastAuditTime: string | null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [records, setRecords] = useState<ApplicantRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<RegistryStats | null>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'audit'>('records');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Edit user profile modal state
  const [editingRecord, setEditingRecord] = useState<ApplicantRecord | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);

  useEffect(() => {
    checkAuthAndLoad();
  }, [statusFilter]);

  async function checkAuthAndLoad() {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth');
      if (!authRes.ok) {
        router.push('/admin/login');
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);

      await Promise.all([loadRecords(), loadAuditLogs(), loadStats()]);
    } catch {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }

  async function loadRecords() {
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (search.trim()) params.set('search', search.trim());
    params.set('limit', '100');

    const res = await fetch(`/api/records?${params.toString()}`);
    const data = await res.json();
    if (data.success) {
      setRecords(data.data);
    }
  }

  async function loadAuditLogs() {
    const res = await fetch('/api/audit-logs');
    const data = await res.json();
    if (data.success) {
      setAuditLogs(data.data);
    }
  }

  async function loadStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch {
      // Retains existing stats on fetch error.
    }
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin/login');
  }

  async function handleStatusChange(id: string, newStatus: RecordStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await Promise.all([loadRecords(), loadAuditLogs(), loadStats()]);
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string, trackingCode: string) {
    if (!confirm(`Confirm permanent revocation of registry record ${trackingCode}?`)) {
      return;
    }
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await Promise.all([loadRecords(), loadAuditLogs(), loadStats()]);
        setSelectedIds((prev) => prev.filter((item) => item !== id));
      }
    } finally {
      setUpdatingId(null);
    }
  }

  function handleOpenEdit(record: ApplicantRecord) {
    setEditingRecord(record);
    setIsEditOpen(true);
  }

  function handleSaveSuccess(updated: ApplicantRecord) {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    loadAuditLogs();
    loadStats();
  }

  // Batch actions
  function toggleSelectAll() {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map((r) => r.id));
    }
  }

  function toggleSelectRecord(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleBatchStatus(status: RecordStatus) {
    if (selectedIds.length === 0) return;
    setBatchLoading(true);
    try {
      const res = await fetch('/api/records/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordIds: selectedIds, status }),
      });
      if (res.ok) {
        setSelectedIds([]);
        await Promise.all([loadRecords(), loadAuditLogs(), loadStats()]);
      }
    } finally {
      setBatchLoading(false);
    }
  }

  return (
    <div className="py-8 bg-cameco-canvas min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white border border-cameco-rule p-5 rounded-sm shadow-editorial flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <CanadaFlag className="h-6 w-12 border border-slate-200 rounded-sm" />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-cameco-charcoal font-sans">
                  Cameco Administrative Registry Management
                </h1>
                <span className="px-2 py-0.5 rounded-sm bg-stone-100 text-stone-700 font-mono text-[10px] border border-stone-200">
                  SECURE TIER-1
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Logged in as: <strong className="font-mono text-cameco-charcoal">{user?.email}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 border-r border-cameco-rule pr-2 mr-1">
              <a
                href="/api/export?format=csv"
                download="cameco_registry_export.csv"
                className="px-2.5 py-1.5 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-sm text-xs font-medium flex items-center space-x-1 transition-colors"
                title="Export complete database to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>
              <a
                href="/api/export?format=json"
                download="cameco_registry_export.json"
                className="px-2.5 py-1.5 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-sm text-xs font-medium flex items-center space-x-1 transition-colors"
                title="Export complete database to JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </a>
            </div>

            <Link
              href="/admin/new"
              className="px-3.5 py-1.5 bg-cameco-red hover:bg-cameco-red-dark text-white rounded-sm text-xs font-semibold flex items-center space-x-1.5 shadow-subtle transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Intake Document</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-sm text-xs font-medium flex items-center space-x-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-white border border-cameco-rule rounded-sm shadow-subtle space-y-1">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Total Filings</span>
              <p className="text-xl font-bold font-mono text-cameco-charcoal">{stats.totalRecords}</p>
            </div>
            <div className="p-3 bg-white border border-cameco-rule rounded-sm shadow-subtle space-y-1 border-t-2 border-t-emerald-500">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Authenticated</span>
              <p className="text-xl font-bold font-mono text-emerald-700">{stats.verifiedCount}</p>
            </div>
            <div className="p-3 bg-white border border-cameco-rule rounded-sm shadow-subtle space-y-1 border-t-2 border-t-amber-500">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Pending Review</span>
              <p className="text-xl font-bold font-mono text-amber-700">{stats.pendingCount}</p>
            </div>
            <div className="p-3 bg-white border border-cameco-rule rounded-sm shadow-subtle space-y-1 border-t-2 border-t-rose-500">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Rejected / Revoked</span>
              <p className="text-xl font-bold font-mono text-rose-700">{stats.rejectedCount}</p>
            </div>
            <div className="p-3 bg-white border border-cameco-rule rounded-sm shadow-subtle space-y-1 border-t-2 border-t-slate-400">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Validity Expired</span>
              <p className="text-xl font-bold font-mono text-slate-700">{stats.expiredCount}</p>
            </div>
            <div className="p-3 bg-white border border-cameco-rule rounded-sm shadow-subtle space-y-1 border-t-2 border-t-sky-500">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">Audit Logs</span>
              <p className="text-xl font-bold font-mono text-sky-700">{stats.totalAuditLogs}</p>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-cameco-rule space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('records')}
            className={`pb-2.5 flex items-center space-x-2 ${
              activeTab === 'records'
                ? 'border-b-2 border-cameco-red text-cameco-red'
                : 'text-stone-500 hover:text-cameco-charcoal'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Active Record Catalog ({records.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2.5 flex items-center space-x-2 ${
              activeTab === 'audit'
                ? 'border-b-2 border-cameco-red text-cameco-red'
                : 'text-stone-500 hover:text-cameco-charcoal'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Action Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {activeTab === 'records' && (
          <div className="space-y-4">
            
            {/* Filter & Batch Actions Toolbar */}
            <div className="bg-white p-3.5 border border-cameco-rule rounded-sm shadow-subtle flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center space-x-1.5 text-xs text-stone-600 hover:text-cameco-charcoal border border-stone-200 px-2 py-1.5 rounded-sm bg-stone-50"
                >
                  {selectedIds.length === records.length && records.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-cameco-red" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-stone-400" />
                  )}
                  <span>Select All ({selectedIds.length})</span>
                </button>

                {selectedIds.length > 0 && (
                  <div className="flex items-center space-x-1.5 text-xs">
                    <span className="text-stone-400">|</span>
                    <button
                      disabled={batchLoading}
                      onClick={() => handleBatchStatus('VERIFIED')}
                      className="px-2 py-1 rounded-sm bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-semibold"
                    >
                      Set Verified
                    </button>
                    <button
                      disabled={batchLoading}
                      onClick={() => handleBatchStatus('PENDING_REVIEW')}
                      className="px-2 py-1 rounded-sm bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 font-semibold"
                    >
                      Set Pending
                    </button>
                    <button
                      disabled={batchLoading}
                      onClick={() => handleBatchStatus('REJECTED')}
                      className="px-2 py-1 rounded-sm bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 font-semibold"
                    >
                      Set Rejected
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                <div className="w-full sm:w-64 relative">
                  <Search className="w-4 h-4 absolute left-3 top-2 text-stone-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadRecords()}
                    placeholder="Search name or code..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-300 rounded-sm focus:ring-1 focus:ring-cameco-red font-mono"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-stone-300 rounded-sm bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="EXPIRED">Expired</option>
                </select>

                <button
                  onClick={loadRecords}
                  className="p-1.5 border border-stone-300 hover:bg-stone-50 rounded-sm text-stone-600"
                  title="Refresh list"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-cameco-rule rounded-sm shadow-editorial overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-cameco-rule text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 w-8">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="py-3 px-3">Tracking Code</th>
                    <th className="py-3 px-4">Applicant Profile</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Validity</th>
                    <th className="py-3 px-4">Demo Flag</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {records.map((r) => {
                    const isSelected = selectedIds.includes(r.id);
                    return (
                      <tr
                        key={r.id}
                        className={`transition-colors ${isSelected ? 'bg-amber-50/30' : 'hover:bg-stone-50/60'}`}
                      >
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRecord(r.id)}
                            className="rounded text-cameco-red focus:ring-cameco-red"
                          />
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-cameco-charcoal">
                          {r.tracking_code}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-sm border border-stone-200 overflow-hidden bg-stone-100 flex items-center justify-center flex-shrink-0">
                              {r.photo_url ? (
                                <img src={r.photo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Users className="w-3.5 h-3.5 text-stone-400" />
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-cameco-charcoal block">
                                {r.first_name} {r.last_name}
                              </span>
                              <span className="text-[10px] text-stone-500">
                                {r.issuing_office}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-stone-600">
                          {r.category}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            disabled={updatingId === r.id}
                            value={r.status}
                            onChange={(e) => handleStatusChange(r.id, e.target.value as RecordStatus)}
                            className={`px-2 py-1 rounded-sm text-[11px] font-semibold border ${
                              r.status === 'VERIFIED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : r.status === 'PENDING_REVIEW'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            <option value="VERIFIED">VERIFIED</option>
                            <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="EXPIRED">EXPIRED</option>
                            <option value="REVOKED">REVOKED</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                          {formatDate(r.issue_date)} — {formatDate(r.expiry_date)}
                        </td>
                        <td className="py-3 px-4">
                          {r.published_demo ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                              DEMO
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-stone-100 text-stone-600">
                              PRIVATE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* Edit User Profile Action */}
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="inline-flex p-1.5 text-stone-600 hover:text-cameco-charcoal border border-stone-200 rounded-sm hover:bg-stone-100 transition-colors"
                            title="Edit applicant profile and details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/?code=${r.tracking_code}`}
                            className="inline-flex p-1.5 text-stone-500 hover:text-cameco-charcoal border border-stone-200 rounded-sm hover:bg-stone-100 transition-colors"
                            title="View public verification"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            disabled={updatingId === r.id}
                            onClick={() => handleDelete(r.id, r.tracking_code)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 border border-rose-200 rounded-sm hover:bg-rose-50 disabled:opacity-40 transition-colors"
                            title="Delete / Revoke Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-cameco-rule rounded-sm shadow-editorial overflow-hidden">
            <div className="p-4 border-b border-cameco-rule bg-stone-50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-cameco-charcoal">
                  Immutable Registry Audit Ledger
                </h3>
                <p className="text-[11px] text-stone-500">
                  Log of cryptographic modifications, admissions, and status updates committed across system accounts.
                </p>
              </div>
              <button
                onClick={loadAuditLogs}
                className="p-1.5 border border-stone-300 hover:bg-white rounded-sm text-stone-600"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-stone-100">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-start justify-between text-xs hover:bg-stone-50/50">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-1.5 py-0.5 font-mono text-[10px] font-bold rounded-sm ${
                        log.action === 'CREATE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action === 'STATUS_CHANGE'
                          ? 'bg-amber-100 text-amber-800'
                          : log.action === 'EDIT'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.action}
                      </span>
                      <span className="font-semibold text-cameco-charcoal">
                        Operator: {log.performed_by}
                      </span>
                    </div>
                    <p className="text-stone-600 text-xs">
                      {log.details}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-stone-400 whitespace-nowrap pl-4">
                    {formatDate(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit User Profile Modal */}
        {editingRecord && (
          <EditUserModal
            record={editingRecord}
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onSaveSuccess={handleSaveSuccess}
          />
        )}

      </div>
    </div>
  );
}

