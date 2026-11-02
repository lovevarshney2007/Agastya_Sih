/**
 * verifierBatch.ts
 * Bulk verification utilities for Campus Recruitment Drives & Background Check Partners (e.g. TCS, Infosys, Wipro).
 * Conforms to AICTE Trust Framework & DPDP Consent Specifications.
 */

export interface BulkCandidateRecord {
  id: string;
  candidate_name: string;
  apaar_id: string;
  institution: string;
  programme: string;
  academic_year: string;
  status: 'VALID' | 'AWAITING_CONSENT' | 'REVOKED' | 'INVALID_CHECKSUM';
  proof_hash: string;
  verified_at: string;
  notes: string;
}

export const DEMO_CAMPUS_BATCH: BulkCandidateRecord[] = [
  {
    id: 'CAND-001',
    candidate_name: 'Priya Sharma',
    apaar_id: '663910284422',
    institution: 'Malaviya Institute of Technology, Jaipur',
    programme: 'B.Tech Computer Science & Engineering',
    academic_year: '2026-27',
    status: 'VALID',
    proof_hash: '0x9f83b2a14e56c78d01ef34a5b6c7d8e9f0123456789abcdef0123456789abcde',
    verified_at: '2026-11-02T14:30:00Z',
    notes: 'Autonomous AICTE Central Ledger Verified. Grade A+ enrolment.',
  },
  {
    id: 'CAND-002',
    candidate_name: 'Rohan Verma',
    apaar_id: '712345678901',
    institution: 'College of Engineering, Pune',
    programme: 'B.Tech Mechanical Engineering',
    academic_year: '2026-27',
    status: 'VALID',
    proof_hash: '0x8a71c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    verified_at: '2026-11-02T14:30:02Z',
    notes: 'Single active enrolment confirmed. Zero cross-institutional conflict.',
  },
  {
    id: 'CAND-003',
    candidate_name: 'Ananya Sen',
    apaar_id: '890123456782',
    institution: 'Delhi Technological University',
    programme: 'M.Tech Artificial Intelligence',
    academic_year: '2026-27',
    status: 'AWAITING_CONSENT',
    proof_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    verified_at: '2026-11-02T14:30:04Z',
    notes: 'SMS & DigiLocker consent notification dispatched to student. Awaiting approval.',
  },
  {
    id: 'CAND-004',
    candidate_name: 'Vikram Aditya',
    apaar_id: '901234567894',
    institution: 'National Institute of Technology, Tiruchirappalli',
    programme: 'B.Tech Electronics & Communication',
    academic_year: '2026-27',
    status: 'VALID',
    proof_hash: '0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    verified_at: '2026-11-02T14:30:05Z',
    notes: 'Autonomous AICTE Central Ledger Verified. Merit Supernumerary seat.',
  },
  {
    id: 'CAND-005',
    candidate_name: 'Rajesh Kumar (Flagged)',
    apaar_id: '123456789011',
    institution: 'Unknown / Unaffiliated Campus',
    programme: 'Diploma in Information Technology',
    academic_year: '2026-27',
    status: 'INVALID_CHECKSUM',
    proof_hash: '0xDEADBEEF00000000000000000000000000000000000000000000000000000000',
    verified_at: '2026-11-02T14:30:06Z',
    notes: 'Dihedral Group D5 Verhoeff checksum algorithm check failed. Bogus APAAR ID.',
  },
];

/**
 * Generates and triggers download of an official HR Attestation Dossier in CSV format.
 */
export function exportAttestationReportCsv(
  records: BulkCandidateRecord[],
  organisationName: string = 'Tata Consultancy Services'
): void {
  const timestamp = new Date().toISOString();
  const headers = [
    'Candidate ID',
    'Candidate Name',
    'APAAR ID',
    'Institution',
    'Programme',
    'Academic Year',
    'Verification Status',
    'Cryptographic Proof (SHA-256)',
    'Verified At',
    'Statutory Notes',
    'Authorised Verifier',
    'Regulatory Framework',
  ];

  const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;

  const rows = records.map((r) => [
    r.id,
    escapeCsv(r.candidate_name),
    `'${r.apaar_id}`, // quote to prevent Excel scientific notation
    escapeCsv(r.institution),
    escapeCsv(r.programme),
    r.academic_year,
    r.status,
    r.proof_hash,
    r.verified_at,
    escapeCsv(r.notes),
    escapeCsv(organisationName),
    'AICTE Statutory National Depository (APH 2024-27 §3.1)',
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AICTE_Attestation_Dossier_${organisationName.replace(/\s+/g, '_')}_${timestamp.slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
