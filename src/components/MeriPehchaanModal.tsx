import { useState, useEffect } from 'react';
import { ArrowRight, Check, CheckCircle2, ChevronRight, Lock, ShieldCheck, Smartphone, Sparkles, X } from 'lucide-react';

interface MeriPehchaanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentName?: string;
}

export function MeriPehchaanModal({
  isOpen,
  onClose,
  onSuccess,
  studentName = 'Priya Sharma',
}: MeriPehchaanModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [apaarInput, setApaarInput] = useState('663910284422');
  const [otpInput, setOtpInput] = useState('492817');
  const [timer, setTimer] = useState(45);
  const [scopes, setScopes] = useState({
    identity: true,
    enrolment: true,
    abc_credits: true,
    phone_residence: false,
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isOpen && step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, step, timer]);

  if (!isOpen) return null;

  const handleStep1Next = () => {
    setStep(2);
    setTimer(45);
  };

  const handleStep2Verify = () => {
    setStep(3);
  };

  const handleFinalConsent = () => {
    setProcessing(true);
    // Complete digital consent verification
    onSuccess();
    onClose();
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0e2448]/60 flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-md border border-line overflow-hidden flex flex-col my-auto text-ink">
        {/* Tricolour Accent */}
        <div className="tricolour h-1.5" />

        {/* MeriPehchaan National Header */}
        <div className="p-4 sm:p-5 bg-navy text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
              <img src="/aicte-logo.png" alt="MeriPehchaan" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-white/10 px-2 py-0.5 rounded">
                  MeriPehchaan NSSO
                </span>
                <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                  <ShieldCheck size={11} /> DigiLocker Gateway
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                मेरी पहचान · National Single Sign-On
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Pill Indicator */}
        <div className="px-5 py-2.5 bg-wash border-b border-line-soft flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step >= 1 ? 'bg-navy text-white' : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              1
            </span>
            <span className={step === 1 ? 'text-navy font-bold' : 'text-muted'}>Identity</span>
          </div>

          <ChevronRight size={14} className="text-muted" />

          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step >= 2 ? 'bg-navy text-white' : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              2
            </span>
            <span className={step === 2 ? 'text-navy font-bold' : 'text-muted'}>Aadhaar OTP</span>
          </div>

          <ChevronRight size={14} className="text-muted" />

          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === 3 ? 'bg-navy text-white' : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              3
            </span>
            <span className={step === 3 ? 'text-navy font-bold' : 'text-muted'}>DPDP Consent</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-ink">Authenticate with APAAR / DigiLocker ID</h4>
                <p className="text-xs text-muted mt-0.5">
                  Link your Academic Bank of Credits (ABC) repository to deposit W3C Verifiable Credentials directly into your DigiLocker.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink block">12-Digit APAAR ID / Username</label>
                <div className="relative">
                  <input
                    type="text"
                    value={apaarInput}
                    onChange={(e) => setApaarInput(e.target.value)}
                    className="input mono text-sm font-semibold tracking-wider pl-9"
                    placeholder="12 digits"
                  />
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                </div>
                <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>Verified: Registered to {studentName} (ABC Account Connected)</span>
                </div>
              </div>

              <div className="p-3 bg-brand-wash/30 rounded-lg border border-brand/20 text-xs space-y-1">
                <div className="font-bold text-brand flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Zero-Plaintext Aadhaar Guarantee
                </div>
                <p className="text-muted text-[11px] m-0">
                  Under DPDP Act 2023, Agastya only receives a salted cryptographic HMAC token and the APAAR identifier. Plaintext Aadhaar numbers are never collected or stored.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleStep1Next}
                  className="btn btn-primary btn-sm flex items-center gap-1.5 font-bold"
                >
                  <span>Request Aadhaar OTP</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-ink">Enter Aadhaar / DigiLocker OTP</h4>
                <p className="text-xs text-muted mt-0.5">
                  A 6-digit one-time password has been dispatched to your mobile number registered with UIDAI (ending in <strong className="text-ink">•••• 8921</strong>).
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-ink">Enter 6-Digit Code</label>
                  <span className="mono text-[11px] text-muted">Expires in: {timer}s</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="input mono text-base font-bold tracking-widest pl-9 max-w-[200px]"
                    maxLength={6}
                  />
                  <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                </div>
                <div className="text-[11px] text-amber-700 font-medium">
                  Hackathon Demo Note: Pre-filled with valid test token.
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-ghost btn-sm text-muted text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStep2Verify}
                  className="btn btn-primary btn-sm flex items-center gap-1.5 font-bold"
                >
                  <Check size={14} />
                  <span>Verify OTP &amp; Continue</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-ink">DPDP Act §6 Purpose-Bound Consent Notice</h4>
                <p className="text-xs text-muted mt-0.5">
                  Grant permission to AICTE to synchronize your official W3C verifiable credentials with DigiLocker and the Academic Bank of Credits.
                </p>
              </div>

              {/* Scope Checkboxes */}
              <div className="space-y-2.5 p-3.5 bg-wash rounded-lg border border-line-soft text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scopes.identity}
                    onChange={(e) => setScopes({ ...scopes, identity: e.target.checked })}
                    className="mt-0.5 rounded text-brand focus:ring-brand"
                  />
                  <div>
                    <span className="font-bold text-ink block">Basic Student Identity</span>
                    <span className="text-[11px] text-muted">Legal Name ({studentName}), Date of Birth, Gender</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scopes.enrolment}
                    onChange={(e) => setScopes({ ...scopes, enrolment: e.target.checked })}
                    className="mt-0.5 rounded text-brand focus:ring-brand"
                  />
                  <div>
                    <span className="font-bold text-ink block">Institutional Enrolment Record</span>
                    <span className="text-[11px] text-muted">College affiliation, approved intake branch, academic year</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scopes.abc_credits}
                    onChange={(e) => setScopes({ ...scopes, abc_credits: e.target.checked })}
                    className="mt-0.5 rounded text-brand focus:ring-brand"
                  />
                  <div>
                    <span className="font-bold text-ink block">Academic Bank of Credits (ABC) Repository</span>
                    <span className="text-[11px] text-muted">Deposit verifiable semester grade transcripts and credit ledger</span>
                  </div>
                </label>
              </div>

              <div className="text-[10px] text-muted leading-relaxed">
                By clicking <strong>Authorize &amp; Link</strong>, you exercise your data sharing rights under Chapter III of the Digital Personal Data Protection Act, 2023. You may withdraw consent at any time from your Agastya privacy dashboard.
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-ghost btn-sm text-muted text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalConsent}
                  disabled={processing}
                  className="btn btn-primary btn-sm bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 font-bold shadow-xs cursor-pointer"
                >
                  <Sparkles size={14} className="text-amber-300" />
                  <span>{processing ? 'Synchronizing...' : 'Authorize & Link MeriPehchaan'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
