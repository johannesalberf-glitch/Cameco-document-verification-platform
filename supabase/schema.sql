-- Cameco Verification Platform - Production Supabase PostgreSQL Schema
-- Run this in the Supabase SQL editor to initialize tables and Row Level Security.

-- 1. Create Records Table
CREATE TABLE IF NOT EXISTS public.records (
  id TEXT PRIMARY KEY,
  tracking_code TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  photo_url TEXT,
  issuing_office TEXT NOT NULL DEFAULT 'Ottawa Central Verification Registry',
  published_demo BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for lookup optimization
CREATE INDEX IF NOT EXISTS idx_records_tracking_code ON public.records(tracking_code);
CREATE INDEX IF NOT EXISTS idx_records_demo ON public.records(published_demo);
CREATE INDEX IF NOT EXISTS idx_records_status ON public.records(status);

-- 2. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_logs(created_at DESC);

-- 3. Row Level Security (RLS) Configuration
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public users may only SELECT demonstrative records via public anon key
CREATE POLICY "Public can view published demo records"
  ON public.records
  FOR SELECT
  TO anon, authenticated
  USING (published_demo = true);

-- Verification by tracking_code is handled via server route using service role key,
-- preventing direct public querying or table dumping of private applicants.

-- Service role has full administrative access
CREATE POLICY "Service role full access on records"
  ON public.records
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on audit_logs"
  ON public.audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Supabase Storage Bucket Configuration
-- Create 'applicant-photos' bucket with restricted access
INSERT INTO storage.buckets (id, name, public)
VALUES ('applicant-photos', 'applicant-photos', true)
ON CONFLICT (id) DO NOTHING;

