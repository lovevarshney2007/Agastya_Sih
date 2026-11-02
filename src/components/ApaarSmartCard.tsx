import { useState } from 'react';
import { CheckCircle2, Copy, Printer, QrCode, RotateCw, Shield, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { shortHash } from '../lib/format';
import { bhashiniVoice } from '../utils/bhashiniVoice';

interface ApaarSmartCardProps {
  name: string;
  maskedApaar: string;
  institution: string;
  course: string;
  studentIdNo?: string;
  academicYear?: string;
  verified?: boolean;
}

export function ApaarSmartCard({
  name,
  maskedApaar,
  institution,
  course,
  studentIdNo = 'COEP-CSE-2026-101',
  academicYear = '2026–27',
  verified = true,
}: ApaarSmartCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(maskedApaar);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeakCard = () => {
    if (isSpeaking) {
      bhashiniVoice.stop();
      setIsSpeaking(false);
      return;
    }

    const narrative = `APAAR Smart ID Card for student ${name}. Enrolled in ${course} at ${institution}. Academic year ${academicYear}. Student registration number: ${studentIdNo}. Cryptographic verification status: Active and verified under Digital Personal Data Protection Act 2023.`;

    setIsSpeaking(true);
    bhashiniVoice.speak(narrative, 'en-IN', {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  return (
    <div className="flex flex-col items-center">
      {/* 3D Card Stage */}
      <div
        className="w-full max-w-md h-64 cursor-pointer select-none"
        style={{ perspective: '1200px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full h-full duration-700 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* ================= FRONT SIDE ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl shadow-xl p-5 text-white flex flex-col justify-between overflow-hidden border border-white/20"
            style={{
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #0e2448 0%, #1e3a8a 50%, #172554 100%)',
            }}
          >
            {/* Holographic Rainbow Foil Layer */}
            <div
              className="absolute -inset-full opacity-15 pointer-events-none rotate-45"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), rgba(255,200,0,0.8), rgba(0,255,200,0.8), transparent)',
              }}
            />

            {/* Top Bar */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <img src="/aicte-logo.png" alt="AICTE" className="h-9 w-9 object-contain bg-white/90 p-1 rounded-full shadow" />
                <div>
                  <div className="text-[10px] tracking-widest uppercase font-semibold text-amber-300">Government of India</div>
                  <div className="text-xs font-bold tracking-wider">AICTE · APAAR SMART ID</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                <ShieldCheck size={12} />
                <span>{verified ? 'ACTIVE · VERIFIED' : 'PENDING'}</span>
              </div>
            </div>

            {/* Middle: Microchip + Photo + Details */}
            <div className="flex items-center gap-4 relative z-10 my-1">
              {/* Photo Box */}
              <div className="relative shrink-0">
                <div className="w-16 h-20 rounded-lg bg-gradient-to-b from-slate-200 to-slate-400 border-2 border-white/40 shadow-inner overflow-hidden flex flex-col items-center justify-end p-1">
                  <div className="w-10 h-10 rounded-full bg-slate-600 mb-1" />
                  <div className="w-14 h-6 rounded-t-full bg-slate-700" />
                </div>
                {/* Microchip Graphic */}
                <div className="absolute -top-1 -right-2 w-6 h-5 rounded bg-amber-400 border border-amber-600 shadow flex items-center justify-center">
                  <div className="w-4 h-3 border border-amber-800/40 rounded-sm grid grid-cols-2 gap-0.5 p-0.5">
                    <div className="bg-amber-600/30" />
                    <div className="bg-amber-600/30" />
                  </div>
                </div>
              </div>

              {/* Student Meta */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="text-base font-bold truncate text-white leading-tight">{name}</div>
                <div className="text-[11px] text-amber-200 truncate font-medium">{course}</div>
                <div className="text-[10px] text-slate-300 truncate">{institution}</div>
                <div className="text-[10px] text-slate-400 font-mono">Roll: {studentIdNo} · Year {academicYear}</div>
              </div>
            </div>

            {/* Bottom Bar: Masked APAAR + QR Emulation */}
            <div className="flex items-end justify-between pt-2 border-t border-white/10 relative z-10">
              <div>
                <div className="text-[9px] text-slate-300 uppercase tracking-widest font-semibold flex items-center gap-1">
                  APAAR ID <span className="text-amber-400 text-[8px]">(DigiLocker Synced)</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-sm font-bold tracking-widest text-amber-300">{maskedApaar}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition"
                    title="Copy APAAR ID"
                  >
                    {copied ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="p-1 bg-white rounded shadow-sm text-navy">
                  <QrCode size={30} />
                </div>
                <span className="text-[8px] text-slate-400 mt-0.5 font-mono">Offline Sign</span>
              </div>
            </div>
          </div>

          {/* ================= BACK SIDE ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl shadow-xl p-5 text-slate-800 flex flex-col justify-between overflow-hidden border border-slate-300 bg-white"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Top Back Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-brand" />
                <span className="text-xs font-bold text-navy uppercase tracking-wider">Statutory Verification Proof</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">ISO/IEC 18013-5 Compliant</span>
            </div>

            {/* Middle Back: DPDP Mandate & Blind Index */}
            <div className="space-y-2 text-[11px] leading-relaxed my-auto">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-700">
                <div className="font-bold text-slate-900 text-[10px] uppercase mb-0.5">DPDP Act 2023 Section 6 Protection:</div>
                <p className="m-0 text-[10px] text-slate-600">
                  This identity is secured using HMAC-SHA256 salted blind indexing. Plaintext biometrics and Aadhaar numbers are never retained on this card or in the national ledger.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div>
                  <span className="text-slate-400 block">Ledger Blind Index:</span>
                  <span className="font-bold text-slate-700">{shortHash('apaar-blind-token-663910284422', 14)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Root Anchor:</span>
                  <span className="font-bold text-emerald-700">WORM Block #1844</span>
                </div>
              </div>
            </div>

            {/* Bottom Back: Barcode + Support Hotline */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
              <div>
                <div className="font-bold text-navy">AICTE Regulation Bureau</div>
                <div className="text-slate-500">Helpline: 1800-11-AICTE · Nelson Mandela Marg, New Delhi</div>
              </div>
              <div className="text-right font-mono font-bold text-slate-400">
                ||| | |||| | |||| ||||
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
        <button
          type="button"
          className="btn btn-secondary btn-sm flex items-center gap-1.5 shadow-sm"
          onClick={() => setFlipped((f) => !f)}
        >
          <RotateCw size={14} className="text-brand" />
          <span>{flipped ? 'Flip to Front' : 'Flip to Back (Proof)'}</span>
        </button>

        <button
          type="button"
          className={`btn btn-sm flex items-center gap-1.5 shadow-sm transition-all ${
            isSpeaking ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse' : 'btn-secondary'
          }`}
          onClick={handleSpeakCard}
          title="Bhashini Multilingual Speech Synthesis"
        >
          {isSpeaking ? (
            <>
              <VolumeX size={14} />
              <span>Stop Voice</span>
            </>
          ) : (
            <>
              <Volume2 size={14} className="text-indigo-600" />
              <span>Bhashini Voice Assist</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm"
          onClick={() => window.print()}
        >
          <Printer size={14} />
          <span>Print / PVC ID Card</span>
        </button>
      </div>

      <div className="text-xs text-muted mt-2 flex items-center gap-1.5">
        <RotateCw size={12} className="text-muted" />
        <span>Click or tap card to inspect reverse side</span>
      </div>
    </div>
  );
}
