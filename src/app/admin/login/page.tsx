'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CanadaFlag } from '@/components/CanadaFlag';
import { Lock, ShieldCheck, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@cameco.ca');
  const [password, setPassword] = useState('CamecoAdmin2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication rejected. Verify credentials.');
      } else {
        router.push('/admin');
      }
    } catch {
      setError('Connection failure while reaching authentication gateway.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-14 sm:py-20 bg-cameco-canvas min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="bg-white border border-cameco-rule rounded-sm shadow-editorial p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2 border-b border-cameco-rule pb-6">
            <div className="flex justify-center mb-3">
              <CanadaFlag className="h-6 w-12 border border-slate-200 rounded-sm shadow-subtle" />
            </div>
            <div className="inline-flex items-center space-x-1.5 text-[11px] font-mono uppercase tracking-wider text-cameco-red bg-cameco-red-surface px-2 py-0.5 rounded-sm">
              <Lock className="w-3 h-3" />
              <span>Restricted Access Control</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-cameco-charcoal font-sans">
              Administrative Intake Portal
            </h1>
            <p className="text-xs text-cameco-charcoal-subtle">
              Authorized personnel only. Sessions are monitored and logged.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-sm text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-semibold uppercase tracking-wider text-cameco-charcoal">
                Administrator Identifier
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-cameco-red text-sm font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold uppercase tracking-wider text-cameco-charcoal">
                Security Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-cameco-red text-sm"
              />
            </div>

            <div className="bg-stone-50 p-2.5 rounded-sm border border-stone-200/60 text-[11px] text-stone-600 space-y-1">
              <span className="font-semibold text-stone-700 block">Default Demo Credentials:</span>
              <p>Email: <code className="font-mono text-cameco-charcoal">admin@cameco.ca</code></p>
              <p>Password: <code className="font-mono text-cameco-charcoal">CamecoAdmin2026!</code></p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-white bg-cameco-red hover:bg-cameco-red-dark rounded-sm transition-colors shadow-subtle disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validating Key...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

