import fs from 'node:fs';
import path from 'node:path';
import { supabase, isSupabaseConfigured } from './supabase';
import { ApplicantRecord, AuditLog, RecordStatus, RecordCategory } from './types';
import { normalizeTrackingCode } from './utils';

const BACKUP_FILE = '/tmp/cameco_records.json';
const AUDIT_FILE = '/tmp/cameco_audit.json';

const SEED_RECORDS: ApplicantRecord[] = [
  {
    id: 'rec_101',
    tracking_code: 'CAM-2026-8812',
    first_name: 'Sarah',
    last_name: 'Jenkins',
    category: 'Temporary Resident Visa',
    status: 'VERIFIED',
    issue_date: '2026-03-15',
    expiry_date: '2028-03-15',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    issuing_office: 'Ottawa Central Verification Registry',
    published_demo: true,
    notes: 'Biometrics matched; employer compliance verified under Section 203.',
    created_at: '2026-03-15T09:30:00Z',
    updated_at: '2026-03-15T09:30:00Z',
  },
  {
    id: 'rec_102',
    tracking_code: 'CAM-2026-4401',
    first_name: 'David',
    last_name: 'Chen',
    category: 'Study Permit Accreditation',
    status: 'VERIFIED',
    issue_date: '2026-01-10',
    expiry_date: '2027-08-31',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    issuing_office: 'Vancouver Regional Intake Unit',
    published_demo: true,
    notes: 'Designated Learning Institution (DLI) enrollment attested.',
    created_at: '2026-01-10T14:15:00Z',
    updated_at: '2026-01-10T14:15:00Z',
  },
  {
    id: 'rec_103',
    tracking_code: 'CAM-2026-1934',
    first_name: 'Amara',
    last_name: 'Okafor',
    category: 'Work Authorization Certificate',
    status: 'PENDING_REVIEW',
    issue_date: '2026-09-01',
    expiry_date: '2027-09-01',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    issuing_office: 'Toronto Operational Gateway',
    published_demo: true,
    notes: 'Labour market confirmation under secondary validation.',
    created_at: '2026-09-01T11:00:00Z',
    updated_at: '2026-10-02T16:20:00Z',
  },
  {
    id: 'rec_104',
    tracking_code: 'CAM-2025-9920',
    first_name: 'Liam',
    last_name: 'Smith',
    category: 'Visitor Record Validation',
    status: 'EXPIRED',
    issue_date: '2024-08-15',
    expiry_date: '2025-08-15',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    issuing_office: 'Calgary Field Examination Desk',
    published_demo: true,
    notes: 'Authorization expired. Re-application required for extension.',
    created_at: '2024-08-15T08:00:00Z',
    updated_at: '2025-08-16T00:01:00Z',
  },
  {
    id: 'rec_105',
    tracking_code: 'CAM-2026-7731',
    first_name: 'Elena',
    last_name: 'Rostova',
    category: 'Express Entry Verification',
    status: 'REJECTED',
    issue_date: '2026-02-04',
    expiry_date: '2026-02-04',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    issuing_office: 'Montreal Documentation Hub',
    published_demo: false,
    notes: 'Discrepancy in credential evaluation certificate serial.',
    created_at: '2026-02-04T10:45:00Z',
    updated_at: '2026-02-08T13:10:00Z',
  },
  {
    id: 'rec_106',
    tracking_code: 'CAM-2026-5529',
    first_name: 'Mateo',
    last_name: 'Silva',
    category: 'Provincial Nominee Verification',
    status: 'VERIFIED',
    issue_date: '2026-04-18',
    expiry_date: '2028-04-18',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    issuing_office: 'Halifax Atlantic Pilot Bureau',
    published_demo: true,
    notes: 'Nova Scotia provincial nominee confirmation active.',
    created_at: '2026-04-18T15:00:00Z',
    updated_at: '2026-04-18T15:00:00Z',
  }
];

const SEED_AUDIT: AuditLog[] = [
  {
    id: 'aud_1',
    record_id: 'rec_101',
    action: 'CREATE',
    performed_by: 'admin@cameco.ca',
    details: 'Initial record registration and metadata ingestion.',
    created_at: '2026-03-15T09:30:00Z',
  },
  {
    id: 'aud_2',
    record_id: 'rec_101',
    action: 'STATUS_CHANGE',
    performed_by: 'senior_auditor@cameco.ca',
    details: 'Status transitioned from PENDING_REVIEW to VERIFIED.',
    created_at: '2026-03-15T10:15:00Z',
  },
  {
    id: 'aud_3',
    record_id: 'rec_103',
    action: 'STATUS_CHANGE',
    performed_by: 'compliance@cameco.ca',
    details: 'Flagged for secondary labor review.',
    created_at: '2026-10-02T16:20:00Z',
  }
];

function readLocalRecords(): ApplicantRecord[] {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const data = fs.readFileSync(BACKUP_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch {
    // Falls back to seed records on read error.
  }
  return SEED_RECORDS;
}

function writeLocalRecords(records: ApplicantRecord[]) {
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(records, null, 2), 'utf8');
  } catch {
    // Ignores write errors in read-only environments.
  }
}

function readLocalAudit(): AuditLog[] {
  try {
    if (fs.existsSync(AUDIT_FILE)) {
      const data = fs.readFileSync(AUDIT_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch {
    // Falls back to seed audit logs on read error.
  }
  return SEED_AUDIT;
}

function writeLocalAudit(logs: AuditLog[]) {
  try {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf8');
  } catch {
    // Ignores write errors in read-only environments.
  }
}

export async function getRecordByTrackingCode(code: string): Promise<ApplicantRecord | null> {
  const normalized = normalizeTrackingCode(code);

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('tracking_code', normalized)
      .maybeSingle();

    if (!error && data) return data as ApplicantRecord;
  }

  const local = readLocalRecords();
  return local.find((r) => r.tracking_code === normalized) || null;
}

export async function listRecords(options: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
  demoOnly?: boolean;
} = {}): Promise<{ records: ApplicantRecord[]; total: number; page: number; totalPages: number }> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, options.limit || 10);

  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('records').select('*', { count: 'exact' });

    if (options.demoOnly) {
      query = query.eq('published_demo', true);
    }
    if (options.status && options.status !== 'ALL') {
      query = query.eq('status', options.status);
    }
    if (options.category && options.category !== 'ALL') {
      query = query.eq('category', options.category);
    }
    if (options.search) {
      query = query.or(`first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,tracking_code.ilike.%${options.search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);

    if (!error && data) {
      const total = count || 0;
      return {
        records: data as ApplicantRecord[],
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }
  }

  let list = readLocalRecords();

  if (options.demoOnly) {
    list = list.filter((r) => r.published_demo);
  }
  if (options.status && options.status !== 'ALL') {
    list = list.filter((r) => r.status === options.status);
  }
  if (options.category && options.category !== 'ALL') {
    list = list.filter((r) => r.category === options.category);
  }
  if (options.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.first_name.toLowerCase().includes(q) ||
        r.last_name.toLowerCase().includes(q) ||
        r.tracking_code.toLowerCase().includes(q)
    );
  }

  const total = list.length;
  const from = (page - 1) * limit;
  const paginated = list.slice(from, from + limit);

  return {
    records: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function createRecord(
  data: Omit<ApplicantRecord, 'id' | 'created_at' | 'updated_at'>,
  performedBy: string = 'admin@cameco.ca'
): Promise<ApplicantRecord> {
  const now = new Date().toISOString();
  const id = 'rec_' + Math.random().toString(36).substring(2, 9);
  const newRecord: ApplicantRecord = {
    ...data,
    id,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured && supabase) {
    const { data: inserted, error } = await supabase
      .from('records')
      .insert([newRecord])
      .select()
      .single();

    if (!error && inserted) {
      await addAuditLog({
        record_id: inserted.id,
        action: 'CREATE',
        performed_by: performedBy,
        details: `Created record ${inserted.tracking_code} for ${inserted.first_name} ${inserted.last_name}`,
      });
      return inserted as ApplicantRecord;
    }
  }

  const records = readLocalRecords();
  records.unshift(newRecord);
  writeLocalRecords(records);

  await addAuditLog({
    record_id: id,
    action: 'CREATE',
    performed_by: performedBy,
    details: `Created record ${newRecord.tracking_code} for ${newRecord.first_name} ${newRecord.last_name}`,
  });

  return newRecord;
}

export async function updateRecord(
  id: string,
  patch: Partial<ApplicantRecord>,
  performedBy: string = 'admin@cameco.ca'
): Promise<ApplicantRecord | null> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('records')
      .update({ ...patch, updated_at: now })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      await addAuditLog({
        record_id: id,
        action: patch.status ? 'STATUS_CHANGE' : 'EDIT',
        performed_by: performedBy,
        details: patch.status
          ? `Status changed to ${patch.status}`
          : `Updated record properties: ${Object.keys(patch).join(', ')}`,
      });
      return data as ApplicantRecord;
    }
  }

  const records = readLocalRecords();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const current = records[index];
  const updated: ApplicantRecord = {
    ...current,
    ...patch,
    updated_at: now,
  };

  records[index] = updated;
  writeLocalRecords(records);

  await addAuditLog({
    record_id: id,
    action: patch.status ? 'STATUS_CHANGE' : 'EDIT',
    performed_by: performedBy,
    details: patch.status
      ? `Status changed to ${patch.status}`
      : `Updated record properties: ${Object.keys(patch).join(', ')}`,
  });

  return updated;
}

export async function deleteRecord(id: string, performedBy: string = 'admin@cameco.ca'): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('records').delete().eq('id', id);
    if (!error) {
      await addAuditLog({
        record_id: id,
        action: 'DELETE',
        performed_by: performedBy,
        details: `Deleted record ID ${id}`,
      });
      return true;
    }
  }

  const records = readLocalRecords();
  const filtered = records.filter((r) => r.id !== id);
  if (filtered.length === records.length) return false;

  writeLocalRecords(filtered);
  await addAuditLog({
    record_id: id,
    action: 'DELETE',
    performed_by: performedBy,
    details: `Deleted record ID ${id}`,
  });

  return true;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) return data as AuditLog[];
  }

  return readLocalAudit();
}

export async function addAuditLog(
  log: Omit<AuditLog, 'id' | 'created_at'>
): Promise<AuditLog> {
  const entry: AuditLog = {
    ...log,
    id: 'aud_' + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    await supabase.from('audit_logs').insert([entry]);
  }

  const current = readLocalAudit();
  current.unshift(entry);
  writeLocalAudit(current.slice(0, 100));

  return entry;
}


export async function getRecordById(id: string): Promise<ApplicantRecord | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) return data as ApplicantRecord;
  }

  const local = readLocalRecords();
  return local.find((r) => r.id === id) || null;
}

