import fs from 'node:fs';
import path from 'node:path';
import { supabase, isSupabaseConfigured } from './supabase';
import { ApplicantRecord, AuditLog, RecordStatus, RecordCategory } from './types';
import { normalizeTrackingCode } from './utils';

const BACKUP_FILE = '/tmp/cameco_records.json';
const LOCAL_DATA_FILE = path.join(process.cwd(), 'data', 'records.json');
const AUDIT_FILE = '/tmp/cameco_audit.json';
const LOCAL_AUDIT_FILE = path.join(process.cwd(), 'data', 'audit.json');

const SEED_RECORDS: ApplicantRecord[] = [];

const SEED_AUDIT: AuditLog[] = [];

function ensureDataDir() {
  try {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {
    // Ignore directory creation error
  }
}

function sanitizeRecord(r: ApplicantRecord): ApplicantRecord {
  const cleanGender = (r.gender || 'Female').replace(/ \/ .*$/, '');
  const cleanOffice = r.issuing_office?.includes('Kuwait') 
    ? 'Cameco Central Verification Registry' 
    : r.issuing_office || 'Cameco Central Verification Registry';
  const cleanNotes = r.notes?.replace(/Kuwait Electronic Visa/gi, 'Cameco Identity Record') || r.notes;

  return {
    ...r,
    gender: cleanGender,
    issuing_office: cleanOffice,
    notes: cleanNotes,
  };
}

function readLocalRecords(): ApplicantRecord[] {
  try {
    ensureDataDir();
    let fileToRead = null;
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      fileToRead = LOCAL_DATA_FILE;
    } else if (fs.existsSync(BACKUP_FILE)) {
      fileToRead = BACKUP_FILE;
    }

    if (fileToRead) {
      const data = fs.readFileSync(fileToRead, 'utf8');
      const parsed: ApplicantRecord[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.map(sanitizeRecord) : [];
    }
  } catch {
    // Return empty on error
  }
  return [];
}

function writeLocalRecords(records: ApplicantRecord[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(records, null, 2), "utf8");
  } catch {}
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(records, null, 2), "utf8");
  } catch {}
}

function readLocalAudit(): AuditLog[] {
  try {
    ensureDataDir();
    let fileToRead = null;
    if (fs.existsSync(LOCAL_AUDIT_FILE)) {
      fileToRead = LOCAL_AUDIT_FILE;
    } else if (fs.existsSync(AUDIT_FILE)) {
      fileToRead = AUDIT_FILE;
    }

    if (fileToRead) {
      const data = fs.readFileSync(fileToRead, 'utf8');
      return JSON.parse(data);
    }
  } catch {
    // Falls back to seed audit logs on read error.
  }
  return [];
}

function writeLocalAudit(logs: AuditLog[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf8');
    fs.writeFileSync(LOCAL_AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf8');
  } catch {
    // Ignores write errors in read-only environments.
  }
}

export async function getRecordByTrackingCode(code: string): Promise<ApplicantRecord | null> {
  const raw = (code || '').trim();
  if (!raw) return null;
  const normalized = normalizeTrackingCode(raw);
  const digitsOnly = raw.replace(/\D/g, '');

  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from('records')
      .select('*')
      .or(`tracking_code.eq.${normalized},passport_number.eq.${raw.toUpperCase()},tracking_code.ilike.%${raw}%`)
      .limit(1)
      .maybeSingle();

    if (data) return data as ApplicantRecord;
  }

  const local = readLocalRecords();

  // 1. Exact match by tracking_code
  let match = local.find(
    (r) => r.tracking_code.toUpperCase() === normalized || r.tracking_code.toUpperCase() === raw.toUpperCase()
  );
  if (match) return match;

  // 2. Exact match by passport_number
  match = local.find(
    (r) => r.passport_number && r.passport_number.toUpperCase() === raw.toUpperCase()
  );
  if (match) return match;

  // 3. Exact match by id
  match = local.find((r) => r.id.toLowerCase() === raw.toLowerCase());
  if (match) return match;

  // 4. Substring match on tracking_code or passport_number
  match = local.find(
    (r) =>
      r.tracking_code.toUpperCase().includes(raw.toUpperCase()) ||
      (r.passport_number && r.passport_number.toUpperCase().includes(raw.toUpperCase()))
  );
  if (match) return match;

  // 5. Digits-only match (if input has digits)
  if (digitsOnly.length >= 2) {
    match = local.find((r) => {
      const recDigits = r.tracking_code.replace(/\D/g, '');
      const passDigits = (r.passport_number || '').replace(/\D/g, '');
      return (
        recDigits.includes(digitsOnly) ||
        passDigits.includes(digitsOnly) ||
        (digitsOnly.length >= 4 && (digitsOnly.includes(recDigits) || digitsOnly.includes(passDigits)))
      );
    });
    if (match) return match;
  }

  // 6. Name match
  match = local.find((r) => {
    const fullName = `${r.first_name} ${r.last_name}`.toUpperCase();
    return fullName.includes(raw.toUpperCase());
  });
  if (match) return match;

  return null;
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

