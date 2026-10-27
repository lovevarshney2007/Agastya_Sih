import React, { useState } from 'react';
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Lock
} from 'lucide-react';
import { StudentRecord } from '../types';

interface PublicVerifyProps {
  students: StudentRecord[];
}

export const PublicVerify: React.FC<PublicVerifyProps> = ({ students }) => {
  const [inputToken, setInputToken] = useState('892019482019');
  const [result, setResult] = useState<StudentRecord | null>(
    students.find(s => s.apaarId === '892019482019') || null
  );
  const [hasSearched, setHasSearched] = useState(true);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cleaned = inputToken.replace(/\s+/g, '');
    const found = students.find(s => s.apaarId === cleaned || s.digitalCredentialId === cleaned);
    setResult(found || null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-mono font-bold">
          <QrCode className="w-3.5 h-3.5" />
          <span>INSTANT PUBLIC CREDENTIAL ATTESTATION</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          AICTE APAAR Public QR Verifier
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Scan any QR code on an AICTE credential certificate or enter a 12-digit APAAR ID to check validity in real time.
        </p>
      </div>

      {/* Lookup Bar */}
      <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter 12-digit APAAR ID or Token (e.g. 892019482019)"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-xl text-sm dark:text-white text-slate-900 font-mono font-bold placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-2 cursor-pointer whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Validity</span>
          </button>
        </form>

        <div className="mt-3 flex items-center space-x-2 text-[11px] text-slate-500">
          <span className="font-bold">Quick test:</span>
          <button
            onClick={() => { setInputToken('892019482019'); setResult(students.find(s => s.apaarId === '892019482019') || null); }}
            className="text-blue-700 dark:text-blue-400 hover:underline font-mono font-bold cursor-pointer"
          >
            892019482019 (Valid)
          </button>
          <span>•</span>
          <button
            onClick={() => { setInputToken('472910482910'); setResult(students.find(s => s.apaarId === '472910482910') || null); }}
            className="text-amber-700 dark:text-amber-400 hover:underline font-mono font-bold cursor-pointer"
          >
            472910482910 (Disputed)
          </button>
          <span>•</span>
          <button
            onClick={() => { setInputToken('999999999999'); setResult(null); }}
            className="text-rose-700 dark:text-rose-400 hover:underline font-mono font-bold cursor-pointer"
          >
            999999999999 (Invalid)
          </button>
        </div>
      </div>

      {/* Verification Card Output */}
      {hasSearched && (
        <div>
          {result ? (
            <div className={`p-8 rounded-2xl border shadow-sm relative overflow-hidden ${
              result.enrolmentStatus === 'Active' && result.verificationStatus === 'Verified'
                ? 'dark:bg-slate-900 bg-white border-emerald-300 dark:border-emerald-800/60'
                : 'dark:bg-slate-900 bg-white border-amber-300 dark:border-amber-800/60'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b dark:border-slate-800 border-slate-200 gap-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    result.enrolmentStatus === 'Active' && result.verificationStatus === 'Verified'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                  }`}>
                    {result.enrolmentStatus === 'Active' && result.verificationStatus === 'Verified' ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <AlertTriangle className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full ${
                        result.enrolmentStatus === 'Active' && result.verificationStatus === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      }`}>
                        {result.enrolmentStatus === 'Active' && result.verificationStatus === 'Verified' ? 'VALID CREDENTIAL' : 'UNDER REVIEW / DISPUTED'}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">{result.name}</h3>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="text-slate-500 block">AICTE Token</span>
                  <span className="text-blue-700 dark:text-blue-400 font-bold">{result.digitalCredentialId || 'AICTE-CERT-VERIFIED'}</span>
                </div>
              </div>

              {/* Minimal Field Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 text-xs font-mono">
                <div className="p-3.5 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200">
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Institution</span>
                  <span className="text-slate-900 dark:text-slate-200 font-sans font-bold text-sm">{result.collegeName}</span>
                </div>

                <div className="p-3.5 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200">
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Academic Program</span>
                  <span className="text-slate-900 dark:text-slate-200 font-sans font-bold text-sm">{result.program}</span>
                </div>

                <div className="p-3.5 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200">
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Academic Year</span>
                  <span className="text-blue-700 dark:text-blue-400 font-bold">{result.academicYear}</span>
                </div>

                <div className="p-3.5 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200">
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Credential Integrity</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">12-Digit APAAR Authentic</span>
                </div>
              </div>

              <div className="p-3 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
                <div className="flex items-center space-x-2">
                  <Lock className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                  <span>Public Data Minimisation: Personal identity & Aadhaar masked.</span>
                </div>
                <span className="font-mono text-slate-400">TLS 1.3 Certified</span>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/20 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-300 dark:border-rose-800">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-rose-800 dark:text-rose-300">Invalid / Unrecognized Credential</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                No active verified enrolment matches token <span className="font-mono font-bold text-slate-900 dark:text-white">{inputToken}</span> in the AICTE national repository.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
