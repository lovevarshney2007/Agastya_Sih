import { useState, useEffect } from 'react';
import { Pause, Play, X } from 'lucide-react';

interface TelemetryEvent {
  id: string;
  timeOffsetSec: number;
  type: 'INGESTION' | 'LEDGER' | 'VERIFIER' | 'SANCTION' | 'SECURITY';
  badge: string;
  badgeColor: string;
  text: string;
  subtext: string;
}

const TELEMETRY_STREAM: TelemetryEvent[] = [
  {
    id: 'evt-1',
    timeOffsetSec: 8,
    type: 'INGESTION',
    badge: 'BATCH INGEST',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    text: 'COEP Pune submitted Batch #1429',
    subtext: '60 students validated against 14 APH rules',
  },
  {
    id: 'evt-2',
    timeOffsetSec: 22,
    type: 'LEDGER',
    badge: 'MERKLE BLOCK',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    text: 'Block #14299 anchored to WORM ledger',
    subtext: 'SHA-256 Merkle root 0xf7a28e9d... verified',
  },
  {
    id: 'evt-3',
    timeOffsetSec: 45,
    type: 'VERIFIER',
    badge: 'ZERO-TRUST QR',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    text: 'Dual-QR verified by TCS Campus Hiring',
    subtext: 'Offline Ed25519 signature matched AICTE root',
  },
  {
    id: 'evt-4',
    timeOffsetSec: 62,
    type: 'SANCTION',
    badge: '4-EYES QUORUM',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    text: 'Dual-key order signed for Case #2026-081',
    subtext: 'Maker & Checker joint signature authenticated',
  },
  {
    id: 'evt-5',
    timeOffsetSec: 90,
    type: 'LEDGER',
    badge: 'DIGILOCKER SYNC',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    text: 'W3C VC deposited to MeriPehchaan',
    subtext: 'Priya Nair credential stored with DPDP consent',
  },
  {
    id: 'evt-6',
    timeOffsetSec: 110,
    type: 'SECURITY',
    badge: 'FIREWALL MITIGATION',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    text: 'Adversarial Aadhaar injection blocked',
    subtext: 'Client pre-flight DPDP §6 firewall contained leak',
  },
];

export function NationalEventTicker() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isPaused || isMinimized || isDismissed) return;

    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % TELEMETRY_STREAM.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, isMinimized, isDismissed]);

  if (isDismissed) return null;

  const current = TELEMETRY_STREAM[currentIdx];

  if (isMinimized) {
    return (
      <div className="fixed bottom-14 left-3 sm:left-4 z-40 no-print animate-fade-in font-sans">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="bg-navy/90 hover:bg-navy text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full shadow-lg border border-line flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition-all hover:scale-105"
          title="Expand Live National Depository Telemetry Stream"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 beacon-pulse shrink-0" />
          <span>Live Feed ({TELEMETRY_STREAM.length})</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-14 left-3 sm:left-4 z-40 no-print animate-fade-up font-sans max-w-[calc(100vw-1.5rem)] sm:max-w-xs">
      <div
        className="bg-white/95 backdrop-blur-xs rounded-lg shadow-xl border border-line overflow-hidden text-ink"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Header */}
        <div className="bg-navy text-white px-3 py-1.5 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5 font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 beacon-pulse shrink-0" />
            <span className="text-saffron uppercase">National Telemetry Feed</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="text-white/70 hover:text-white p-0.5 rounded cursor-pointer"
              title={isPaused ? 'Resume stream' : 'Pause stream'}
            >
              {isPaused ? <Play size={10} className="fill-current" /> : <Pause size={10} className="fill-current" />}
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="text-white/70 hover:text-white p-0.5 rounded cursor-pointer text-[10px] font-bold px-1"
              title="Minimize stream"
            >
              _
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="text-white/70 hover:text-white p-0.5 rounded cursor-pointer"
              title="Close ticker"
            >
              <X size={11} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-2.5 space-y-1 text-xs">
          <div className="flex items-center justify-between gap-1.5">
            <span className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded border ${current.badgeColor}`}>
              {current.badge}
            </span>
            <span className="text-[10px] text-muted font-mono">{current.timeOffsetSec}s ago</span>
          </div>
          <div className="font-bold text-navy truncate text-xs">{current.text}</div>
          <div className="text-[11px] text-muted line-clamp-1">{current.subtext}</div>
        </div>

        {/* Progress Dots */}
        <div className="bg-wash px-2.5 py-1 flex items-center justify-between border-t border-line-soft text-[10px] text-muted">
          <span>AICTE Depository Stream</span>
          <div className="flex items-center gap-1">
            {TELEMETRY_STREAM.map((s, idx) => (
              <span
                key={s.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${
                  idx === currentIdx ? 'bg-navy w-3' : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
