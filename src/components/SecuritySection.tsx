import React from 'react';
import { Lock, EyeOff, ShieldCheck, History } from 'lucide-react';

export function SecuritySection() {
  const securityFeatures = [
    {
      title: 'Zero-Knowledge Public Boundary',
      desc: 'Public verification endpoints strictly emit non-sensitive operational parameters: document category, validity dates, issuing office, and status. Passports, contact numbers, and personal identifiers are cryptographically withheld from public responses.',
      icon: EyeOff,
    },
    {
      title: 'Row Level Security (RLS)',
      desc: 'All PostgreSQL tables enforce Row Level Security. Unauthenticated queries are barred from reading private columns, while service-role authorizations remain exclusively confined to server-side administrative handlers.',
      icon: Lock,
    },
    {
      title: 'Comprehensive Action Auditing',
      desc: 'Every administrative transaction—including status transitions, record updates, and photo ingestion—is chronologically committed to an immutable audit ledger with operator email attribution.',
      icon: History,
    },
    {
      title: 'Data Residency Alignment',
      desc: 'Storage architecture and database schemas are structured to comply with Canadian federal PIPEDA standards for privacy protection and institutional document stewardship.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-12 lg:py-16 bg-cameco-canvas border-b border-cameco-rule">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-cameco-red">
            Security & Compliance
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-cameco-charcoal font-sans">
            Guaranteed Privacy and Data Integrity
          </h2>
          <p className="text-xs sm:text-sm text-cameco-charcoal-muted leading-relaxed">
            Engineered from inception with the security rigor expected by immigration consultants, educational institutions, and corporate legal departments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {securityFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-6 bg-white border border-cameco-rule rounded-sm shadow-editorial space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-sm bg-cameco-red-surface text-cameco-red border border-cameco-red-border">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-cameco-charcoal">
                    {f.title}
                  </h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed pl-9">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

