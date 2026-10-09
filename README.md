# Cameco — Professional Visa Document Verification Platform

Cameco is a document verification platform for accredited Canadian visa instruments, study permits, and work accreditations.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database & Storage**: Supabase PostgreSQL & Supabase Storage (with local fallback)
- **Security**: Row Level Security (RLS), HMAC session cookies, zero-knowledge public verification boundary

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Build & start production server
npm run build
npm run start
```

## Configuration
Copy `.env.example` to `.env.local` and configure your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
ADMIN_EMAIL=admin@cameco.ca
ADMIN_PASSWORD=CamecoAdmin2026!
SESSION_SECRET=cameco_secure_jwt_session_secret_hmac_2026
```

Run `supabase/schema.sql` in your Supabase SQL editor to create the schema, tables, and RLS policies.

