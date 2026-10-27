import React, { useState } from 'react';
import { 
  GraduationCap, 
  Download, 
  Lock, 
  CheckCircle2, 
  History, 
  ToggleLeft, 
  ToggleRight, 
  QrCode 
} from 'lucide-react';
import { StudentRecord } from '../types';

interface StudentPortalProps {
  students: StudentRecord[];
  onToggleConsent: (studentId: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  students,
  onToggleConsent
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std-101');
  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border transition-all dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 text-xs font-mono font-bold mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>AICTE STUDENT SOVEREIGN DATA PASSPORT</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">My Academic Identity & Consent Management</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            View your verified academic enrolments, download QR-backed credentials, and control who can verify your record.
          </p>
        </div>

        {/* Switch Student */}
        <div className="flex items-center space-x-2 dark:bg-slate-800 bg-slate-50 p-2 rounded-xl border dark:border-slate-700 border-slate-200">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">Switch Student:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="dark:bg-slate-900 bg-white dark:text-white text-slate-900 text-xs font-semibold rounded-lg px-2.5 py-1 border dark:border-slate-700 border-slate-300 focus:outline-none"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.branch} - {s.collegeName.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Card */}
        <div className="space-y-6 lg:col-span-1">
          <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-blue-700 dark:text-blue-400 font-bold">
                Government of India • AICTE
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                {currentStudent.verificationStatus}
              </span>
            </div>

            <div className="space-y-1 mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{currentStudent.name}</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{currentStudent.program}</p>
              <p className="text-xs text-slate-500">{currentStudent.collegeName}</p>
            </div>

            <div className="p-3.5 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200 space-y-2 font-mono text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">APAAR ID:</span>
                <span className="text-blue-700 dark:text-blue-400 font-bold">
                  {currentStudent.apaarId.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Roll No:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{currentStudent.studentIdNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admission Year:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{currentStudent.academicYear}</span>
              </div>
            </div>

            {/* Consent Toggle Button */}
            <div className="p-4 dark:bg-slate-950 bg-blue-50/50 rounded-xl border dark:border-slate-800 border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Employer Verification Consent</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">Allow recruiters to check credentials</span>
                </div>
                <button
                  onClick={() => onToggleConsent(currentStudent.id)}
                  className="cursor-pointer focus:outline-none"
                >
                  {currentStudent.consentGranted ? (
                    <ToggleRight className="w-8 h-8 text-emerald-600 dark:text-emerald-400 transition-colors" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400 dark:text-slate-600 transition-colors" />
                  )}
                </button>
              </div>

              <div className="text-[10px] font-mono text-slate-500">
                Current State: <strong className={currentStudent.consentGranted ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-amber-700 dark:text-amber-400 font-bold'}>
                  {currentStudent.consentGranted ? 'AUTHORIZED (Active)' : 'WITHHELD / REVOKED'}
                </strong>
              </div>
            </div>
          </div>

          <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-400 space-y-2 shadow-xs">
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 font-bold">
              <Lock className="w-4 h-4" />
              <span>Zero-Knowledge Academic Trust</span>
            </div>
            <p className="leading-relaxed">
              Your 12-digit Aadhaar number is <strong>never stored</strong> in the AICTE platform. Only your APAAR academic identity and degree records are registered.
            </p>
          </div>
        </div>

        {/* Digital Certificate Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b dark:border-slate-800 border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Signed Digital Academic Credential</h3>
                <p className="text-xs text-slate-500">Tamper-proof verifiable enrolment certificate with cryptographically signed QR code.</p>
              </div>
              <button
                onClick={() => alert(`Downloaded signed AICTE Digital Certificate for ${currentStudent.name}`)}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>

            {/* Certificate Canvas */}
            <div className="dark:bg-slate-950 bg-white border-2 dark:border-blue-900/40 border-blue-200 rounded-2xl p-8 relative shadow-sm">
              <div className="border dark:border-blue-950 border-blue-100 rounded-xl p-6 relative">
                <div className="text-center space-y-1 mb-8">
                  <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-full text-[10px] font-mono uppercase tracking-widest text-blue-800 dark:text-blue-300 font-bold mb-2">
                    ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    Certificate of Enrolment & Academic Registration
                  </h2>
                  <p className="text-xs text-slate-500 font-mono font-semibold">
                    ISSUED UNDER APAAR STUDENT REGISTRY (APH 2025-26)
                  </p>
                </div>

                <div className="space-y-4 text-center max-w-xl mx-auto">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">This is to officially certify that</p>
                  <p className="text-2xl font-black text-blue-700 dark:text-blue-400 font-serif tracking-wide">{currentStudent.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    bearing APAAR ID <span className="font-mono text-blue-700 dark:text-blue-400 font-bold">{currentStudent.apaarId.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}</span> is bonafide registered and admitted in
                  </p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{currentStudent.program}</p>
                  <p className="text-xs text-slate-500 font-medium">{currentStudent.collegeName}</p>
                </div>

                <div className="mt-8 pt-6 border-t dark:border-slate-800 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2 rounded-xl flex items-center justify-center shadow-md">
                      <QrCode className="w-16 h-16" />
                    </div>
                    <div className="text-left space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Scan to Verify</span>
                      <span className="text-xs font-mono text-blue-700 dark:text-blue-400 font-bold block">
                        TOKEN: {currentStudent.digitalCredentialId || 'AICTE-APAAR-2025'}
                      </span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Public Check: /verify/public</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[11px] text-slate-500 space-y-1">
                    <div>AICTE Signature: <span className="text-emerald-700 dark:text-emerald-400 font-bold">JWS RSA-SHA256</span></div>
                    <div>Admission Date: <span className="font-bold text-slate-800 dark:text-slate-200">{currentStudent.admissionDate}</span></div>
                    <div>Status: <span className="text-blue-700 dark:text-blue-400 font-bold">APPROVED & SECURED</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Activity Trail */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center space-x-2">
                <History className="w-3.5 h-3.5" />
                <span>Recent Authorized Lookups For My ID</span>
              </h4>

              <div className="space-y-2">
                <div className="p-3 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-900 dark:text-white font-bold">Tata Consultancy Services HR</span>
                    <span className="text-slate-500 text-[11px] block">Purpose: Background Employment Check</span>
                  </div>
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold">Consent PASS • 2 hours ago</span>
                </div>

                <div className="p-3 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-900 dark:text-white font-bold">AICTE National Portal Audit</span>
                    <span className="text-slate-500 text-[11px] block">Purpose: Periodic Duplicate Check</span>
                  </div>
                  <span className="text-blue-700 dark:text-blue-400 font-mono text-xs font-bold">VALID • Oct 26, 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
