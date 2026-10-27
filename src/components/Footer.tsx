import React from 'react';
import { MainNavPage, UserRole } from '../types';
import { Language } from '../data/translations';

interface FooterProps {
  onSelectNavPage: (page: MainNavPage) => void;
  onSelectRole: (role: UserRole) => void;
  theme?: 'dark' | 'light';
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectNavPage,
  onSelectRole,
  language: _language
}) => {
  return (
    <footer className="border-t py-10 transition-colors dark:border-slate-800 dark:bg-[#070D19] bg-white border-slate-200 font-sans mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top 4-Column Directory Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-xs">
          {/* Column 1: Platform Overview */}
          <div className="space-y-3 col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span className="font-black text-slate-900 dark:text-white text-sm">
                APAAR PLATFORM
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Automated Student Data Management & Verification Platform for technical higher education institutions across India.
            </p>
            <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
              <div>Regulation Bureau • AICTE</div>
              <div>Nelson Mandela Marg, New Delhi 110070</div>
            </div>
          </div>

          {/* Column 2: Portal Access */}
          <div className="space-y-2">
            <span className="font-bold font-mono text-[11px] uppercase tracking-wider text-slate-900 dark:text-slate-100 block">
              Portal Access
            </span>
            <ul className="space-y-1.5 text-slate-500 font-medium text-[11px]">
              <li>
                <button 
                  onClick={() => { onSelectRole('STUDENT'); onSelectNavPage('LOGIN'); }} 
                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  Student Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectRole('INSTITUTION'); onSelectNavPage('LOGIN'); }} 
                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  Institution Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectRole('VERIFIER'); onSelectNavPage('LOGIN'); }} 
                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  Authorized Verifier Desk
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectRole('PUBLIC_VERIFY'); onSelectNavPage('PORTALS'); }} 
                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  Public Verification Tool
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Regulations & Governance */}
          <div className="space-y-2">
            <span className="font-bold font-mono text-[11px] uppercase tracking-wider text-slate-900 dark:text-slate-100 block">
              Compliance & Specs
            </span>
            <ul className="space-y-1.5 text-slate-500 font-medium text-[11px]">
              <li>
                <button 
                  onClick={() => onSelectNavPage('COMPLIANCE_STANDARDS')} 
                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  Approval Process Handbook (APH)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectNavPage('COMPLIANCE_STANDARDS')} 
                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  DPDP Act 2023 Guidelines
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectNavPage('DOCUMENTATION')} 
                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  CSV Batch Schema Specification
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectNavPage('ANALYTICS')} 
                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  National Progress Telemetry
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Helpdesk & Grievance */}
          <div className="space-y-2">
            <span className="font-bold font-mono text-[11px] uppercase tracking-wider text-slate-900 dark:text-slate-100 block">
              Technical Support
            </span>
            <ul className="space-y-1.5 text-slate-500 font-medium text-[11px]">
              <li className="font-mono text-[10px] text-blue-700 dark:text-blue-400">
                apaar.support@aicte-india.org
              </li>
              <li>
                <button 
                  onClick={() => onSelectNavPage('DOCUMENTATION')} 
                  className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  Error Code Index
                </button>
              </li>
              <li>
                <span className="text-slate-400">Helpdesk: 011-29581000</span>
              </li>
              <li>
                <span className="text-slate-400">Hours: Mon-Fri 09:30-18:00 IST</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Middle Meta Strip */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t dark:border-slate-800 border-slate-200 text-xs text-slate-500">
          <div className="flex items-center space-x-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              One Nation, One Student ID (APAAR Verification System)
            </span>
            <span className="text-slate-400">•</span>
            <span>All India Council for Technical Education</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-mono">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">SHA-256 Ledger Active</span>
            <span>•</span>
            <span className="text-blue-700 dark:text-blue-400 font-bold">Zero-Aadhaar Leakage Standard</span>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between border-t pt-4 dark:border-slate-800 border-slate-100 gap-2">
          <span>
            © 2026 Department of Higher Education, Ministry of Education, Government of India. Prototype built for Smart India Hackathon.
          </span>
          <span className="font-mono text-[10px]">
            TLS 1.3 • AES-256 GCM • ISO 27001 Aligned
          </span>
        </div>
      </div>
    </footer>
  );
};
