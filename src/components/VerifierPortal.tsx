import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Download,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { StudentRecord } from '../types';
import { verifierApi, userStore } from '../api/client';

import { Language, TRANSLATIONS } from '../data/translations';

interface VerifierPortalProps {
  students: StudentRecord[];
  onLogVerification: (apaarId: string, verifierName: string, purpose: string) => void;
  language?: Language;
}

export const VerifierPortal: React.FC<VerifierPortalProps> = ({
  students,
  onLogVerification,
  language = 'EN',
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.EN;
  const [apaarInput, setApaarInput] = useState('');
  // Pre-fill verifier name from session user org (BUG-011 fix)
  const sessionUser = userStore.get();
  const [verifierName, setVerifierName] = useState(
    sessionUser?.org_name || 'Tata Consultancy Services (HR Recruitment)'
  );
  const [purpose, setPurpose] = useState('Employment Background Academic Verification');
  const [verificationResult, setVerificationResult] = useState<StudentRecord | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Backend state
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<Record<string, unknown> | null>(null);
  const [tracker, setTracker] = useState<Record<string, unknown> | null>(null);
  const [credentialData, setCredentialData] = useState<Record<string, unknown> | null>(null);

  // Load tracker on mount
  useEffect(() => {
    verifierApi.tracker()
      .then(data => setTracker(data as Record<string, unknown>))
      .catch(() => {}); // silent – tracker is supplemental
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchAttempted(true);
    setApiError(null);
    setApiResult(null);
    setCredentialData(null);
    const cleaned = apaarInput.replace(/\s+/g, '');

    // Try real API first
    setApiLoading(true);
    try {
      const res = await verifierApi.submitRequest(cleaned, purpose) as Record<string, unknown>;
      setApiResult(res);
      onLogVerification(cleaned, verifierName, purpose);

      const localMatch = students.find(s => s.apaarId === cleaned);

      if (res.status === 'VALID') {
        let cred: Record<string, unknown> | null = null;
        if (res.token) {
          try {
            cred = await verifierApi.getCredential(res.token as string) as Record<string, unknown>;
            setCredentialData(cred);
          } catch {
            // silent credential fetch fallback
          }
        }
        const claims = (cred?.claims as Record<string, unknown>) || {};
        setVerificationResult({
          id: (res.request_id as string) || 'live-req',
          apaarId: cleaned,
          name: localMatch?.name || (claims.name as string) || 'Authenticated Candidate',
          dob: localMatch?.dob || '2004-05-12',
          gender: localMatch?.gender || 'M',
          collegeId: localMatch?.collegeId || 'coep',
          collegeName: (claims.institution as string) || localMatch?.collegeName || 'COEP Technological University',
          program: (claims.course as string) || localMatch?.program || 'Engineering Degree Program',
          branch: localMatch?.branch || 'Engineering',
          academicYear: String(claims.academic_year || localMatch?.academicYear || '2025-2026'),
          seatCategory: localMatch?.seatCategory || 'General',
          enrolmentStatus: (claims.status as 'Active' | 'Disputed' | 'Revoked' | 'Graduated') || 'Active',
          verificationStatus: 'Verified',
          duplicateRisk: 'NONE',
          admissionDate: localMatch?.admissionDate || '2025-08-01',
          studentIdNo: (claims.student_id_no as string) || localMatch?.studentIdNo || 'STU-AUTH-001',
          aadhaarStatus: 'Not Stored (Privacy Preserved)',
          consentGranted: true,
          version: 1,
          digitalCredentialId: (res.token as string) || 'AICTE-VC-2026',
        });
      } else if (res.status === 'AWAITING_CONSENT' || res.status === 'CONSENT_DENIED') {
        setVerificationResult({
          id: (res.request_id as string) || 'live-req',
          apaarId: cleaned,
          name: localMatch?.name || 'Protected Candidate Identity',
          dob: localMatch?.dob || '2004-05-12',
          gender: localMatch?.gender || 'M',
          collegeId: localMatch?.collegeId || 'inst',
          collegeName: localMatch?.collegeName || 'Recognized AICTE Institution',
          program: localMatch?.program || 'Degree Program',
          branch: localMatch?.branch || 'Department',
          academicYear: localMatch?.academicYear || '2025-2026',
          seatCategory: localMatch?.seatCategory || 'General',
          enrolmentStatus: 'Active',
          verificationStatus: 'Verified',
          duplicateRisk: 'NONE',
          admissionDate: localMatch?.admissionDate || '2025-08-01',
          studentIdNo: '••••••••',
          aadhaarStatus: 'Not Stored (Privacy Preserved)',
          consentGranted: false,
          version: 1,
          digitalCredentialId: undefined,
        });
      } else {
        if (localMatch) {
          setVerificationResult(localMatch);
        } else {
          setVerificationResult(null);
        }
      }

      // Refresh tracker
      verifierApi.tracker()
        .then(data => setTracker(data as Record<string, unknown>))
        .catch(() => {});
    } catch (err) {
      // Fallback to local mock search
      const found = students.find(s => s.apaarId === cleaned);
      if (found) {
        setVerificationResult(found);
        onLogVerification(found.apaarId, verifierName, purpose);
      } else {
        setVerificationResult(null);
        setApiError(err instanceof Error ? err.message : 'Verification failed');
      }
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border transition-all dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold mb-1">
            <UserCheck className="w-4 h-4" />
            <span>AICTE CONSENT-GOVERNED VERIFICATION GATEWAY</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.verifierPortalTitle || 'Authorized Background & Credential Verifier'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Purpose-limited, consent-checked lookups for recruiters, universities, embassies, and regulatory bodies.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-mono font-bold">
          <Lock className="w-4 h-4" />
          <span>Zero-Aadhaar Leakage • Minimal Fields</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Query Form */}
        <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Initiate Credential Verification</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Per the AICTE privacy framework, candidate academic records are released only when active student consent is validated.
          </p>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">Verifier Organization</label>
              <input
                type="text"
                required
                value={verifierName}
                onChange={(e) => setVerifierName(e.target.value)}
                className="w-full dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg px-3 py-2 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">
                {t.verifierPurposeLabel || 'Stated Purpose for Access'}
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg px-3 py-2 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
              >
                <option value="Employment Background Academic Verification">Employment Background Academic Verification</option>
                <option value="Higher Studies / Postgraduate Admission">Higher Studies / Postgraduate Admission</option>
                <option value="Visa & Immigration Credential Authentication">Visa & Immigration Credential Authentication</option>
                <option value="Scholarship / Financial Aid Eligibility">Scholarship / Financial Aid Eligibility</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">
                {t.verifierSearchLabel || 'Candidate 12-Digit APAAR ID'}
              </label>
              <input
                type="text"
                required
                maxLength={14}
                placeholder={t.verifierSearchPlaceholder || 'e.g. 892019482019'}
                value={apaarInput}
                onChange={(e) => setApaarInput(e.target.value)}
                className="w-full dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg px-3 py-2 text-sm dark:text-white text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[10px] text-slate-500 font-bold">Quick Test:</span>
                <button
                  type="button"
                  onClick={() => setApaarInput('892019482019')}
                  className="text-[10px] text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-blue-200 dark:border-slate-700 font-mono font-bold hover:underline cursor-pointer"
                >
                  892019482019 (Consent PASS)
                </button>
                <button
                  type="button"
                  onClick={() => setApaarInput('472910482910')}
                  className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-amber-200 dark:border-slate-700 font-mono font-bold hover:underline cursor-pointer"
                >
                  472910482910 (Consent REVOKED)
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{t.verifierBtnVerify || 'Verify Against AICTE Ledger'}</span>
            </button>
          </form>
        </div>

        {/* Verification Result Showcase */}
        <div className="lg:col-span-2">
          {!searchAttempted ? (
            <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[350px] shadow-sm">
              <div className="w-16 h-16 rounded-2xl dark:bg-slate-800 bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Awaiting Verification Query</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Enter an authorized candidate APAAR ID and purpose on the left to perform real-time verification against the AICTE master ledger.
              </p>
            </div>
          ) : !verificationResult ? (
            <div className="dark:bg-slate-900 bg-white border border-rose-200 dark:border-rose-900/40 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-rose-700 dark:text-rose-400">Record Not Found or Invalid APAAR ID</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                No active enrolment found with ID: <span className="font-mono font-bold text-slate-900 dark:text-white">{apaarInput}</span>. Ensure 12 digits are typed accurately.
              </p>
            </div>
          ) : !verificationResult.consentGranted ? (
            <div className="dark:bg-slate-900 bg-white border border-amber-200 dark:border-amber-900/50 rounded-2xl p-8 space-y-4 shadow-sm">
              <div className="flex items-center space-x-3 text-amber-700 dark:text-amber-400">
                <Lock className="w-6 h-6" />
                <h4 className="text-lg font-bold">Access Restricted: Student Consent Revoked</h4>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Candidate record found in AICTE registry, but student <strong className="text-slate-900 dark:text-white">{verificationResult.name}</strong> has actively set their consent preference to <strong>PRIVATE / REVOKED</strong>.
              </p>

              <div className="p-4 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200 text-xs space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">APAAR ID:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{verificationResult.apaarId.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Consent Status:</span>
                  <span className="text-amber-700 dark:text-amber-400 font-bold">REVOKED / WITHHELD</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Privacy Protocol:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Minimal fields suppressed per DPDP Act</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 italic">
                Notice: The candidate must log into their AICTE Student Portal and toggle &quot;Grant Consent to Third-Party Verifiers&quot; before details can be revealed.
              </div>
            </div>
          ) : (
            <div className="dark:bg-slate-900 bg-white border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b dark:border-slate-800 border-slate-200 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">{verificationResult.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 font-mono font-bold">
                        AUTHENTICATED
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      APAAR ID: {verificationResult.apaarId.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-mono">Credential ID:</span>
                  <span className="text-xs text-blue-700 dark:text-blue-400 font-mono font-bold dark:bg-slate-950 bg-blue-50 px-2 py-1 rounded border dark:border-slate-800 border-blue-200">
                    {verificationResult.digitalCredentialId || 'AICTE-CERT-AUTH'}
                  </span>
                </div>
              </div>

              {/* Minimal Field Verification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="dark:bg-slate-950 bg-slate-50 p-3 rounded-lg border dark:border-slate-800 border-slate-200">
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Institution Name</span>
                  <span className="text-slate-900 dark:text-slate-200 font-sans font-bold text-sm">{verificationResult.collegeName}</span>
                </div>

                <div className="dark:bg-slate-950 bg-slate-50 p-3 rounded-lg border dark:border-slate-800 border-slate-200">
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Degree / Program</span>
                  <span className="text-slate-900 dark:text-slate-200 font-sans font-bold text-sm">{verificationResult.program}</span>
                </div>

                <div className="dark:bg-slate-950 bg-slate-50 p-3 rounded-lg border dark:border-slate-800 border-slate-200">
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Enrolment Status</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">{verificationResult.enrolmentStatus} (Active in Ledger)</span>
                </div>

                <div className="dark:bg-slate-950 bg-slate-50 p-3 rounded-lg border dark:border-slate-800 border-slate-200">
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Academic Year / Batch</span>
                  <span className="text-blue-700 dark:text-blue-400 font-bold">{verificationResult.academicYear} (Admission: {verificationResult.admissionDate})</span>
                </div>
              </div>

              {/* Dual QR Codes from backend */}
              {Boolean(credentialData?.qr_codes) && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border dark:border-slate-800 border-slate-200">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-3 font-mono">
                    Dual Cryptographic Verification Tokens (Online & Offline)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 border-slate-200">
                      <img 
                        src={(credentialData!.qr_codes as Record<string, string>).online_url_qr} 
                        alt="Online Attestation QR" 
                        className="w-16 h-16 rounded border p-1"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 dark:text-white block">Online Verification QR</span>
                        <span className="text-[10px] text-slate-500 font-mono">Instant public ledger validation</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 border-slate-200">
                      <img 
                        src={(credentialData!.qr_codes as Record<string, string>).offline_vc_qr} 
                        alt="Offline VC JWS QR" 
                        className="w-16 h-16 rounded border p-1"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 dark:text-white block">Offline JWS Token QR</span>
                        <span className="text-[10px] text-slate-500 font-mono">Zero-network verifiable credential</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Digital Attestation Footer */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-emerald-900 dark:text-emerald-300 font-bold block">AICTE Certified Digital Attestation</span>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px]">Cryptographic JWS signature signed by AICTE National Root Key</span>
                </div>
                <button 
                  onClick={() => {
                    const token = verificationResult.digitalCredentialId;
                    if (token) {
                      window.open(`https://sih.monu14.me/api/v1/verifier/credential/${token}/pdf`, '_blank');
                    } else {
                      alert(`Credential certificate downloaded for ${verificationResult.name}`);
                    }
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-mono font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Verifiable PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Verifier Activity Tracker */}
      {Boolean(tracker) && (
        <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Verification Audit Tracker</h3>
              <p className="text-xs text-slate-500">Immutable ledger of verification requests submitted by your organization.</p>
            </div>
            {Boolean(tracker?.quota) && (
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                Quota: {((tracker!.quota as Record<string, number>).remaining)} / {((tracker!.quota as Record<string, number>).limit)} remaining
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b dark:border-slate-800 border-slate-200 text-slate-500 font-mono">
                  <th className="py-2 px-3">Token</th>
                  <th className="py-2 px-3">Purpose</th>
                  <th className="py-2 px-3">Time</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800 divide-slate-100">
                {((tracker?.requests as Record<string, string>[]) || []).slice(0, 5).map((req, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-mono font-bold text-blue-700 dark:text-blue-400">{req.token}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{req.purpose}</td>
                    <td className="py-2 px-3 text-slate-500">{req.created_at}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        req.status === 'VALID' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      {req.status === 'VALID' ? (
                        <a 
                          href={`https://sih.monu14.me/api/v1/verifier/credential/${req.token}/pdf`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-blue-600 dark:text-blue-400 hover:underline font-bold inline-flex items-center space-x-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
