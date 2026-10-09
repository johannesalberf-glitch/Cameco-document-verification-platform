export type RecordCategory =
  | 'Temporary Resident Visa'
  | 'Study Permit Accreditation'
  | 'Work Authorization Certificate'
  | 'Express Entry Verification'
  | 'Provincial Nominee Verification'
  | 'Visitor Record Validation';

export type RecordStatus =
  | 'VERIFIED'
  | 'PENDING_REVIEW'
  | 'REJECTED'
  | 'EXPIRED'
  | 'REVOKED';

export interface ApplicantRecord {
  id: string;
  tracking_code: string;
  first_name: string;
  last_name: string;
  category: RecordCategory;
  status: RecordStatus;
  issue_date: string;
  expiry_date: string;
  photo_url?: string;
  issuing_office: string;
  published_demo: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PublicVerificationResult {
  tracking_code: string;
  status: RecordStatus;
  category: RecordCategory;
  holder_initials: string;
  issuing_office: string;
  issue_date: string;
  expiry_date: string;
  verified_at: string;
  is_demo: boolean;
  message: string;
  scope_notice: string;
}

export interface AuditLog {
  id: string;
  record_id: string;
  action: 'CREATE' | 'STATUS_CHANGE' | 'PHOTO_UPLOAD' | 'EDIT' | 'DELETE';
  performed_by: string;
  details: string;
  created_at: string;
}

