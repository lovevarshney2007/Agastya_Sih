import React from 'react';
import { 
  BookOpen, 
  Code, 
  Terminal, 
  Layers, 
  FileCode, 
  CheckCircle2, 
  ExternalLink,
  Cpu
} from 'lucide-react';

interface DocumentationViewProps {
  theme: 'dark' | 'light';
}

export const DocumentationView: React.FC<DocumentationViewProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  return (
    <div className="space-y-10 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-cyan-500 text-xs font-mono mb-1">
          <BookOpen className="w-4 h-4" />
          <span>DEVELOPER & REGULATORY API DOCUMENTATION</span>
        </div>
        <h1 className={`text-2xl sm:text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          System Architecture, Schema & REST Endpoints
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Technical specifications for integrating Institution ERP systems, DigiLocker / ABC adapters, and AICTE National Hub microservices.
        </p>
      </div>

      {/* Core Endpoints List */}
      <div className={`rounded-2xl border p-6 space-y-4 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          REST API v1 Specification (OpenAPI 3.1)
        </h3>

        <div className="space-y-3 font-mono text-xs">
          <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">POST</span>
              <span className="font-semibold text-cyan-500">/api/v1/institutions/{'{id}'}/uploads</span>
            </div>
            <span className="text-slate-500">Ingest CSV/XLSX batch; return batch ID & validation issues</span>
          </div>

          <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">GET</span>
              <span className="font-semibold text-cyan-500">/api/v1/uploads/{'{batchId}'}</span>
            </div>
            <span className="text-slate-500">Fetch processing status and row-level rejection codes</span>
          </div>

          <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">POST</span>
              <span className="font-semibold text-cyan-500">/api/v1/verify</span>
            </div>
            <span className="text-slate-500">Consent-checked authorized verification for employers</span>
          </div>

          <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">GET</span>
              <span className="font-semibold text-cyan-500">/api/v1/verify/public/{'{token}'}</span>
            </div>
            <span className="text-slate-500">Public QR code instant validation endpoint (zero tracking)</span>
          </div>

          <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px]">POST</span>
              <span className="font-semibold text-cyan-500">/api/v1/students/{'{id}'}/consents</span>
            </div>
            <span className="text-slate-500">Student toggles employer verification consent grant/revoke</span>
          </div>
        </div>
      </div>

      {/* CSV Schema Specification */}
      <div className={`rounded-2xl border p-6 space-y-4 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Standard CSV / Excel File Header Requirements
        </h3>

        <div className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto ${
          isDark ? 'bg-slate-950 border-slate-800 text-cyan-400' : 'bg-slate-100 border-slate-300 text-slate-800'
        }`}>
          apaarId,name,dob,gender,program,branch,seatCategory,studentIdNo
        </div>

        <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 list-disc list-inside">
          <li><strong>apaarId</strong>: Exactly 12 numeric digits (e.g. <code>892019482019</code>). Validated via Luhn & APAAR Adapter.</li>
          <li><strong>seatCategory</strong>: General, OBC, SC, ST, EWS, TFW, or Supernumerary (NRI/FN).</li>
          <li><strong>Aadhaar columns</strong>: Prohibited. If detected, automatically dropped before processing.</li>
        </ul>
      </div>
    </div>
  );
};
