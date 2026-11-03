import { useState, useEffect } from 'react';
import { ShieldCheck, Copy, Check, ExternalLink, Activity, Server, X, Lock, CheckCircle2 } from 'lucide-react';
import { useRouter } from '../lib/router';
import { useI18n } from '../lib/i18n';

interface NationalLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NationalLedgerModal({ isOpen, onClose }: NationalLedgerModalProps) {
  const { navigate } = useRouter();
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [blockHeight, setBlockHeight] = useState(14298);
  const [latency] = useState(18);

  // Gentle live increment to simulate immutable block addition
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setBlockHeight(prev => prev + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const merkleRootHash = 'f7a28e9d41b5907ce018a38cb619f5e27a90dc143891492bda631481e18a9b18';

  const handleCopy = () => {
    navigator.clipboard.writeText(merkleRootHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0e2448]/60 no-print"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl border border-line w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto text-ink pb-[env(safe-area-inset-bottom)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ledger-title"
      >
        {/* Mobile bottom sheet drag indicator */}
        <div className="sm:hidden flex justify-center pt-2 pb-1 bg-navy" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-white/30" />
        </div>
        {/* Tricolour Accent */}
        <div className="tricolour h-1" aria-hidden="true" />

        {/* Modal Header */}
        <div className="bg-navy text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-saffron shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="ledger-title" className="text-sm font-bold text-white tracking-wide">
                  {t('ledger_popover_title', 'AICTE National Depository Root Ledger')}
                </h3>
              </div>
              <p className="text-[11px] text-emerald-300 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 beacon-pulse shrink-0" />
                {t('ledger_popover_subtitle', 'Consensus Active · 32 Institutional Validator Nodes')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            aria-label={t('action_close', 'Close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="bg-surface p-2.5 rounded-lg border border-line">
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                <Server size={11} className="text-navy" />
                {t('ledger_block_height', 'Block Height')}
              </div>
              <div className="text-sm font-mono font-bold text-navy mt-1">
                #{blockHeight.toLocaleString()}
              </div>
            </div>

            <div className="bg-surface p-2.5 rounded-lg border border-line">
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                <Activity size={11} className="text-emerald-600" />
                {t('ledger_latency', 'API Latency')}
              </div>
              <div className="text-sm font-mono font-bold text-emerald-700 mt-1 flex items-center gap-1">
                {latency} ms <span className="text-[10px] text-emerald-600 font-sans font-normal">(NIC Grid)</span>
              </div>
            </div>

            <div className="bg-surface p-2.5 rounded-lg border border-line col-span-2 sm:col-span-1">
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                <Lock size={11} className="text-saffron-dark" />
                {t('ledger_consensus', 'Consensus')}
              </div>
              <div className="text-xs font-bold text-ink mt-1 truncate" title="Proof-of-Authority (AICTE Consortium)">
                PoA Consortium
              </div>
            </div>
          </div>

          {/* Live Merkle Root Hash Box */}
          <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-[10px] pb-1.5 border-b border-slate-800">
              <span className="font-bold uppercase tracking-wider text-saffron">
                {t('ledger_merkle_root', 'Current Merkle Root (Anchor)')}
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={11} /> SHA-256 Validated
              </span>
            </div>
            <div className="mt-2 break-all text-slate-300 font-mono text-[11px] select-all leading-relaxed">
              {merkleRootHash}
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Ed25519 Key ID: <span className="text-slate-200">aicte-root-2026</span></span>
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 cursor-pointer py-1 px-2"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? t('action_copied', 'Copied!') : t('ledger_copy_root', 'Copy Hash')}</span>
              </button>
            </div>
          </div>

          {/* Cryptographic & Compliance Badges */}
          <div className="bg-surface rounded-lg p-3 border border-line space-y-2">
            <div className="text-[11px] font-bold text-navy flex items-center justify-between">
              <span>Security &amp; Statutory Standards</span>
              <span className="text-[10px] bg-ok-wash text-ok font-semibold px-2 py-0.5 rounded-full border border-ok/20">
                Active Audit
              </span>
            </div>
            <ul className="text-muted text-[11px] space-y-1.5 list-none">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>WORM Storage:</strong> Append-only immutable log with tamper-evident cryptographic chaining.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>DPDP Act 2023 §8:</strong> Zero Aadhaar storage; student records blind-indexed via salted HMAC-SHA256.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>W3C VC 2.0:</strong> Credentials cryptographically signed with Ed25519 signature suite.</span>
              </li>
            </ul>
          </div>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-line">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/aicte/audit');
              }}
              className="w-full sm:flex-1 btn btn-secondary btn-sm min-h-[44px] flex items-center justify-center gap-1.5 font-bold"
            >
              <ExternalLink size={13} />
              <span>{t('ledger_open_audit', 'Open Full Audit Ledger')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/aicte/security-sandbox');
              }}
              className="w-full sm:flex-1 btn btn-primary btn-sm min-h-[44px] flex items-center justify-center gap-1.5 font-bold"
            >
              <ShieldCheck size={13} />
              <span>{t('ledger_test_sandbox', 'Security Sandbox Exploit Test')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
