import { useState, useEffect } from 'react';
import { Eye, EyeOff, Printer, RotateCw, ShieldCheck, Sparkles, X } from 'lucide-react';
import QRCode from 'qrcode';

interface PvcCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  apaarId: string;
  institutionName: string;
  programme: string;
  academicYear?: string;
  enrolmentStatus?: string;
  verifyToken?: string;
}

export function PvcCardModal({
  isOpen,
  onClose,
  studentName,
  apaarId,
  institutionName,
  programme,
  academicYear = '2026–27',
  enrolmentStatus = 'ACTIVE',
  verifyToken = 'demo-priya-tcs-2026',
}: PvcCardModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [unmaskApaar, setUnmaskApaar] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const targetUrl = `${window.location.origin}/verify/${encodeURIComponent(verifyToken)}`;
      QRCode.toDataURL(targetUrl, {
        width: 130,
        margin: 1,
        color: { dark: '#0c2340', light: '#ffffff' },
      })
        .then(setQrDataUrl)
        .catch(() => {});
    }
  }, [isOpen, verifyToken]);

  if (!isOpen) return null;

  const formattedApaar = unmaskApaar
    ? `${apaarId.slice(0, 4)} ${apaarId.slice(4, 8)} ${apaarId.slice(8, 12)}`
    : `•••• •••• ${apaarId.slice(-4)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-line overflow-hidden flex flex-col my-auto animate-scale-in text-ink">
        {/* Header (no-print) */}
        <div className="px-5 py-3.5 bg-navy text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-amber-400" />
            <span className="font-bold text-sm">
              Sovereign Student PVC Smart Card Studio (ISO/IEC 7810 ID-1)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFlipped(!isFlipped)}
              className="btn btn-secondary btn-xs bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center gap-1 cursor-pointer font-semibold"
            >
              <RotateCw size={12} />
              {isFlipped ? 'Show Front' : 'Flip to Back'}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-secondary btn-xs bg-amber-500 hover:bg-amber-600 text-navy font-bold border-amber-400 flex items-center gap-1 cursor-pointer"
            >
              <Printer size={12} />
              Print PVC Card
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Card Display Area */}
        <div className="p-6 sm:p-8 bg-wash flex flex-col items-center justify-center space-y-4">
          <div className="text-xs text-muted font-medium flex items-center gap-2 no-print">
            <span>Face: <strong className="text-ink">{isFlipped ? 'Back (Verification & Security)' : 'Front (Identity & Accreditation)'}</strong></span>
            <span>·</span>
            <button
              type="button"
              onClick={() => setUnmaskApaar(!unmaskApaar)}
              className="text-brand hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              {unmaskApaar ? <EyeOff size={13} /> : <Eye size={13} />}
              {unmaskApaar ? 'Mask APAAR' : 'Reveal Full 12 Digits'}
            </button>
          </div>

          {/* ── PVC Card Container (Exact Credit Card Aspect Ratio 85.6mm x 53.98mm ~ 1.586) ── */}
          <div
            id="pvc-card"
            className="w-full max-w-[420px] aspect-[1.586] rounded-2xl shadow-xl overflow-hidden relative border border-line-strong select-none transition-transform duration-500 font-sans text-navy"
            style={{
              background: isFlipped
                ? 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f7f9fc 50%, #eff3f8 100%)',
            }}
          >
            {/* Guilloche Security Micro-pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0c2340_1px,transparent_1px)] [background-size:12px_12px]" />

            {!isFlipped ? (
              /* ── FRONT FACE ── */
              <div className="p-4 sm:p-5 h-full flex flex-col justify-between relative">
                {/* Top Tricolour Header */}
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-line-soft">
                    <div className="flex items-center gap-2">
                      <img src="/aicte-logo.png" alt="AICTE" className="w-8 h-8 object-contain shrink-0" />
                      <div>
                        <div className="text-[9px] uppercase font-bold tracking-wider text-neutral-600 leading-none">
                          Government of India · AICTE
                        </div>
                        <div className="text-xs font-bold text-navy leading-tight mt-0.5">
                          APAAR Sovereign Student Card
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Holographic Chip Seal */}
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 border border-amber-500/60 shadow-xs flex items-center justify-center text-[8px] font-bold text-amber-950">
                        <Sparkles size={13} className="text-amber-800" />
                      </div>
                    </div>
                  </div>

                  {/* Smart EMV Chip Graphic */}
                  <div className="w-8 h-6 rounded-md bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 my-2 border border-amber-600/50 shadow-inner flex flex-col justify-around p-0.5">
                    <div className="h-0.5 bg-amber-700/40 rounded-full" />
                    <div className="h-0.5 bg-amber-700/40 rounded-full" />
                  </div>
                </div>

                {/* Student Details & Photo */}
                <div className="flex items-end justify-between gap-3 my-auto">
                  <div className="space-y-1 min-w-0">
                    <div className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-neutral-900 truncate">
                      {studentName}
                    </div>
                    <div className="text-[11px] font-semibold text-brand truncate max-w-[240px]">
                      {programme}
                    </div>
                    <div className="text-[10px] text-neutral-600 truncate max-w-[240px]">
                      {institutionName}
                    </div>
                  </div>

                  {/* Student Photo Thumbnail */}
                  <div className="w-16 h-20 rounded-lg bg-neutral-200 border-2 border-white shadow-xs overflow-hidden shrink-0 flex items-center justify-center text-neutral-400 font-bold text-xs uppercase bg-cover bg-center">
                    <div className="text-center p-1">
                      <div className="w-7 h-7 rounded-full bg-neutral-300 mx-auto mb-1 flex items-center justify-center text-[10px] text-neutral-600 font-bold">
                        {studentName.slice(0, 1)}
                      </div>
                      <span className="text-[8px] text-neutral-500 block leading-tight">OFFICIAL PHOTO</span>
                    </div>
                  </div>
                </div>

                {/* Footer Bar with APAAR ID */}
                <div className="pt-2 border-t border-line-soft flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] text-neutral-500 uppercase block font-semibold">APAAR Lifelong ID</span>
                    <span className="font-mono font-bold tracking-widest text-xs text-navy">
                      {formattedApaar}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-neutral-500 uppercase block font-semibold">Status / AY</span>
                    <span className="tag tag-ok text-[9px] font-bold py-0 px-1.5 uppercase">
                      {enrolmentStatus} · {academicYear}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* ── BACK FACE ── */
              <div className="p-4 sm:p-5 h-full flex flex-col justify-between relative text-xs">
                {/* Magnetic Strip Representation */}
                <div className="h-6 w-full bg-[#1e293b] rounded-xs -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 mb-2 shadow-inner" />

                {/* Back Body with Dual-QR */}
                <div className="flex items-center justify-between gap-3 my-auto">
                  <div className="space-y-1.5 text-[10px] text-neutral-700 leading-snug max-w-[230px]">
                    <div className="font-bold text-navy text-[11px]">
                      Academic Bank of Credits (ABC) Depository
                    </div>
                    <div>ABC Account Ref: <span className="mono font-bold">ABC-89410294</span></div>
                    <div>Consensus Block: <span className="mono font-bold">#14,298 (AICTE-ROOT)</span></div>
                    <div className="text-[9px] text-neutral-500 italic mt-1">
                      Scan QR code to verify live cryptographic validity against central ledger without revealing plaintext Aadhaar.
                    </div>
                  </div>

                  {/* Offline Verifiable QR Code */}
                  <div className="shrink-0 p-1 bg-white rounded-lg border border-line-soft shadow-xs text-center">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR Code" className="w-18 h-18 object-contain" />
                    ) : (
                      <div className="w-18 h-18 bg-wash flex items-center justify-center text-[9px] text-muted">
                        QR Code
                      </div>
                    )}
                    <span className="text-[8px] mono text-neutral-500 block mt-0.5">Dual-QR Offline</span>
                  </div>
                </div>

                {/* Legal Statutory Notice Footer */}
                <div className="pt-2 border-t border-line-soft text-[8px] text-neutral-500 flex items-center justify-between leading-tight">
                  <span>Issued under AICTE Act 1987 &amp; DPDP Act 2023. Property of Republic of India.</span>
                  <span className="mono font-bold text-neutral-700">Ed25519-Signed</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-muted text-center max-w-sm no-print">
            Compliant with <strong>ISO/IEC 7810 ID-1</strong> specifications for direct thermal PVC dye-sublimation card printers.
          </div>
        </div>
      </div>
    </div>
  );
}
