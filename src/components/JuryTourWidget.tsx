import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useRouter } from '../lib/router';
import { useSession } from '../lib/session';
import { useI18n } from '../lib/i18n';
import { Compass, ChevronRight, ChevronLeft, X, Play, Pause, RotateCcw } from 'lucide-react';

interface TourStep {
  step: number;
  personaId: string;
  roleTitle: string;
  targetPath: string;
  title: string;
  headline: string;
  description: string;
  highlightAction: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    step: 1,
    personaId: 'INSTITUTION_REGISTRAR',
    roleTitle: 'Dr. S. K. Mahajan (Registrar, COEP Pune)',
    targetPath: '/institution/batches',
    title: '1. Ingestion & Rule Ladder',
    headline: 'Batch Upload with Live APH Rule Validation',
    description: 'Institutions upload student batches (CSV/Excel). The ingestion pipeline tests 14 AICTE Approval Process Handbook (APH) rules in real-time.',
    highlightAction: 'Switch to Registrar & Open Batches',
  },
  {
    step: 2,
    personaId: 'AICTE_MAKER',
    roleTitle: 'Rajesh Verma (AICTE Maker, Regulation Bureau)',
    targetPath: '/aicte/cases',
    title: '2. Anomaly Interception',
    headline: 'Cross-Institution Conflict Interception',
    description: 'A dual full-time enrolment between COEP and VJTI was intercepted using salted HMAC blind-indexing without exposing plaintext student identity.',
    highlightAction: 'Switch to AICTE Maker & Inspect Cases',
  },
  {
    step: 3,
    personaId: 'AICTE_CHECKER',
    roleTitle: 'Dr. Anil Deshpande (AICTE Checker, Director)',
    targetPath: '/aicte/cases',
    title: '3. 4-Eyes Dual-Key Governance',
    headline: 'Strict Maker-Checker Resolution',
    description: 'Under the 4-Eyes principle, regulatory citations and case resolutions proposed by the Maker require independent senior Checker sign-off.',
    highlightAction: 'Switch to AICTE Checker & Authorise',
  },
  {
    step: 4,
    personaId: 'STUDENT',
    roleTitle: 'Priya Nair (Student, COEP)',
    targetPath: '/student',
    title: '4. Student Wallet & DPDP Rights',
    headline: 'W3C Credential, DigiLocker & Data Rights',
    description: 'Student receives a tamper-evident JWS credential with Dual-QR code, links DigiLocker, and exercises DPDP Section 11-14 data rights.',
    highlightAction: 'Switch to Student & View Credentials',
  },
  {
    step: 5,
    personaId: 'VERIFIER',
    roleTitle: 'Vikram Malhotra (Lead Verifier, TCS)',
    targetPath: '/verifier',
    title: '5. Zero-Trust Verification',
    headline: 'Consent-Gated Offline Credential Verification',
    description: 'Authorised employers check student authenticity through OTP-assisted consent and cryptographic signature verification against AICTE keys.',
    highlightAction: 'Switch to Verifier & Scan QR',
  },
  {
    step: 6,
    personaId: 'AICTE_MAKER',
    roleTitle: 'Red-Team Security Auditor',
    targetPath: '/aicte/security-sandbox',
    title: '6. Adversarial Attack Simulator',
    headline: 'Red-Team vs Blue-Team Security Sandbox',
    description: 'Execute adversarial exploit payloads (Ghost student injection, plaintext Aadhaar tampering, concurrent dual enrollment) and inspect live firewall containment in real time.',
    highlightAction: 'Switch to AICTE & Launch Security Sandbox',
  },
  {
    step: 7,
    personaId: 'AICTE_CHECKER',
    roleTitle: 'Dr. Anil Deshpande (Regional Director)',
    targetPath: '/aicte/dual-approvals',
    title: '7. 4-Eye Dual-Key Sanctions Desk',
    headline: 'Multi-Signature Cryptographic Sanctions',
    description: 'High-penalty statutory orders (Seat Reduction, Fines) require joint cryptographic signatures from both Maker & Checker before ledger execution.',
    highlightAction: 'Switch to Checker & Multi-Sign Sanctions',
  },
  {
    step: 8,
    personaId: 'AICTE_MAKER',
    roleTitle: 'Rajesh Verma (AICTE Audit Officer)',
    targetPath: '/aicte/audit',
    title: '8. SHA-256 Chain of Custody Proof',
    headline: 'Tamper-Evident Visual Certificate & WORM Storage',
    description: 'Inspect the immutable Merkle-anchored ledger, recompute SHA-256 blocks live, and generate legally valid Chain of Custody certificates.',
    highlightAction: 'Switch to AICTE & Verify Ledger Continuity',
  },
  {
    step: 9,
    personaId: 'STUDENT',
    roleTitle: 'Priya Nair (Student, COEP)',
    targetPath: '/student',
    title: '9. 3D Holographic APAAR Smart ID',
    headline: 'Interactive Student Smart ID Card Simulator',
    description: 'Explore the 3D flip-card APAAR digital identity credential with holographic rainbow foil, DPDP Act blind indexing, and PVC print export.',
    highlightAction: 'Switch to Student & Explore Smart ID Card',
  },
];

export function JuryTourWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [switching, setSwitching] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlaySecondsLeft, setAutoPlaySecondsLeft] = useState(12);
  const { signIn } = useSession();
  const { navigate } = useRouter();
  const { t } = useI18n();

  const currentStep = TOUR_STEPS[currentStepIdx];

  const handleExecuteStep = async (step: TourStep) => {
    setSwitching(true);
    try {
      const res = await api.auth.demoLogin(step.personaId);
      signIn(res);
      navigate(step.targetPath);
    } catch (e: any) {
      alert(`Login failed: ${e.message || 'Error switching persona'}`);
    } finally {
      setSwitching(false);
    }
  };

  // Automated 3-minute hands-free demo countdown
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setAutoPlaySecondsLeft((prev) => {
        if (prev <= 1) {
          setCurrentStepIdx((curr) => {
            const nextIdx = (curr + 1) % TOUR_STEPS.length;
            void handleExecuteStep(TOUR_STEPS[nextIdx]);
            return nextIdx;
          });
          return 12;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      setAutoPlaySecondsLeft(12);
      void handleExecuteStep(TOUR_STEPS[nextIdx]);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      setAutoPlaySecondsLeft(12);
      void handleExecuteStep(TOUR_STEPS[prevIdx]);
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
    setAutoPlaySecondsLeft(12);
    void handleExecuteStep(TOUR_STEPS[0]);
  };

  return (
    <div className="fixed bottom-4 right-3 sm:right-4 z-50 font-sans no-print">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`bg-[#101725] hover:bg-[#1C293B] text-[#F8FAFC] px-3 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-2xl flex items-center gap-2 border-2 ${
            isAutoPlay ? 'border-[#FFD400] ring-4 ring-[#FFD400]/25' : 'border-[#FFD400]'
          } text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer`}
          title="Open interactive multi-role platform walkthrough"
        >
          {isAutoPlay ? (
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD400] animate-ping shrink-0" />
          ) : (
            <Compass size={15} className="text-[#FFD400] shrink-0" />
          )}
          <span className="hidden sm:inline">
            {isAutoPlay ? `Auto-Pitching (${autoPlaySecondsLeft}s)` : t('tour_launcher_full', 'Role Switcher & Tour')}
          </span>
          <span className="sm:hidden">
            {isAutoPlay ? `Auto (${autoPlaySecondsLeft}s)` : t('tour_launcher_mobile', 'Role Tour')}
          </span>
          <span className="bg-[#FFD400] text-[#080B12] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full font-mono">
            {currentStepIdx + 1}/{TOUR_STEPS.length}
          </span>
        </button>
      ) : (
        <div className="bg-[#151F30] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-[#35445A] w-[calc(100vw-1.5rem)] sm:w-96 max-w-[calc(100vw-1.5rem)] overflow-hidden transition-all animate-fade-up">
          {/* Header */}
          <div className="bg-[#101725] text-[#F8FAFC] px-4 py-3 flex items-center justify-between gap-2 border-b border-[#35445A]">
            <div className="flex items-center gap-2 min-w-0">
              <Compass size={16} className="text-[#FFD400] shrink-0" />
              <div className="min-w-0">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFD400] truncate">
                  {t('tour_executive_demo', 'Executive Demonstration')}
                </h4>
                <div className="text-xs font-bold leading-none text-[#F8FAFC] truncate mt-0.5">
                  {t('tour_launcher_full', 'Role Switcher & Workflow Tour')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Auto Play Demo Toggle */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !isAutoPlay;
                  setIsAutoPlay(nextState);
                  setAutoPlaySecondsLeft(12);
                }}
                className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isAutoPlay
                    ? 'bg-[#FFD400] text-[#080B12] shadow-md ring-2 ring-[#FFD400]/50 font-extrabold'
                    : 'bg-[#1C293B] hover:bg-[#233145] text-[#F8FAFC] border border-[#35445A]'
                }`}
                title="Auto-advance through all 9 demo steps every 12 seconds for hands-free pitching"
              >
                {isAutoPlay ? <Pause size={10} className="fill-current text-[#080B12]" /> : <Play size={10} className="fill-current text-[#FFD400]" />}
                <span>{isAutoPlay ? `${autoPlaySecondsLeft}s` : t('tour_auto_pitch', 'Auto Pitch')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsAutoPlay(false);
                }}
                className="text-[#929FB0] hover:text-[#F8FAFC] p-1 rounded-md hover:bg-[#1C293B] transition-colors cursor-pointer"
                aria-label={t('action_close', 'Close')}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Progress Bar & Live Countdown */}
          <div className="w-full bg-[#1C293B] h-1.5">
            <div
              className="bg-[#FFD400] h-1.5 transition-all duration-300 shadow-[0_0_8px_rgba(255,212,0,0.5)]"
              style={{ width: `${((currentStepIdx + 1) / TOUR_STEPS.length) * 100}%` }}
            />
          </div>
          {isAutoPlay && (
            <div className="bg-[#1C293B] px-3 py-1.5 border-b border-[#35445A] text-[10px] text-[#FFB020] font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB020] animate-pulse" />
                <span>Hands-free Pitch Mode: Step advances in</span>
              </span>
              <span className="font-mono font-bold bg-[#101725] px-1.5 py-0.2 rounded border border-[#35445A] text-[#FFD400]">
                {autoPlaySecondsLeft}s
              </span>
            </div>
          )}

          {/* Body */}
          <div className="p-4 space-y-3.5 bg-[#151F30]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#F8FAFC]">{currentStep.title}</span>
              <span className="text-[#00D9E8] font-mono font-bold text-[11px] bg-[#101725] px-2 py-0.5 rounded border border-[#35445A]">
                Step {currentStep.step} of {TOUR_STEPS.length}
              </span>
            </div>

            <div className="bg-[#101725] p-3 rounded-lg border border-[#35445A]">
              <div className="text-[10px] font-extrabold text-[#929FB0] uppercase tracking-wider">
                {t('tour_active_persona', 'Active Demo Persona:')}
              </div>
              <div className="text-xs font-bold text-[#00D9E8] mt-0.5">{currentStep.roleTitle}</div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-[#F8FAFC]">{currentStep.headline}</h5>
              <p className="text-xs text-[#C0CAD8] mt-1 leading-relaxed">{currentStep.description}</p>
            </div>

            {/* Step Action Button: Prominent Institutional Gold CTA */}
            <button
              type="button"
              onClick={() => handleExecuteStep(currentStep)}
              disabled={switching}
              className="w-full btn btn-primary flex items-center justify-center gap-2 py-2.5 font-bold shadow-lg cursor-pointer bg-[#FFD400] text-[#080B12] hover:bg-[#FFE033] hover:shadow-[0_4px_20px_rgba(255,212,0,0.4)] transition-all"
            >
              <Play size={14} className="fill-current" />
              <span>{switching ? 'Switching Persona...' : currentStep.highlightAction}</span>
            </button>

            {/* Quick 9-step pills */}
            <div className="grid grid-cols-9 gap-1 pt-1">
              {TOUR_STEPS.map((s, idx) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => {
                    setCurrentStepIdx(idx);
                    setAutoPlaySecondsLeft(12);
                    void handleExecuteStep(s);
                  }}
                  title={s.title}
                  className={`py-1 text-[11px] font-bold rounded border transition-all cursor-pointer ${
                    idx === currentStepIdx
                      ? 'bg-[#FFD400] text-[#080B12] border-[#FFD400] font-extrabold shadow-sm'
                      : 'bg-[#1C293B] text-[#C0CAD8] border-[#35445A] hover:border-[#FFD400] hover:text-[#F8FAFC]'
                  }`}
                >
                  {s.step}
                </button>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2.5 border-t border-[#35445A] text-xs">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStepIdx === 0 || switching}
                className="flex items-center gap-1 font-semibold text-[#C0CAD8] hover:text-[#F8FAFC] disabled:opacity-30 cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} />
                <span>{t('action_prev', 'Prev')}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                title="Restart walkthrough from Step 1"
                className="flex items-center gap-1 font-semibold text-[#929FB0] hover:text-[#FFD400] cursor-pointer transition-colors"
              >
                <RotateCcw size={12} />
                <span>{t('action_restart', 'Restart')}</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentStepIdx === TOUR_STEPS.length - 1 || switching}
                className="flex items-center gap-1 font-bold text-[#00D9E8] hover:text-[#FFD400] disabled:opacity-30 cursor-pointer transition-colors"
              >
                <span>{t('action_next', 'Next')}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
