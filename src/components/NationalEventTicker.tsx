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
    badgeColor: 'bg-[rgba(0,217,232,0.15)] text-[#00D9E8] border-[rgba(0,217,232,0.4)]',
    text: 'COEP Pune submitted Batch #1429',
    subtext: '60 students validated against 14 APH rules',
  },
  {
    id: 'evt-2',
    timeOffsetSec: 22,
    type: 'LEDGER',
    badge: 'MERKLE BLOCK',
    badgeColor: 'bg-[rgba(0,214,143,0.15)] text-[#00D68F] border-[rgba(0,214,143,0.4)]',
    text: 'Block #14299 anchored to WORM ledger',
    subtext: 'SHA-256 Merkle root 0xf7a28e9d... verified',
  },
  {
    id: 'evt-3',
    timeOffsetSec: 45,
    type: 'VERIFIER',
    badge: 'ZERO-TRUST QR',
    badgeColor: 'bg-[rgba(0,217,232,0.15)] text-[#00D9E8] border-[rgba(0,217,232,0.4)]',
    text: 'Dual-QR verified by TCS Campus Hiring',
    subtext: 'Offline Ed25519 signature matched AICTE root',
  },
  {
    id: 'evt-4',
    timeOffsetSec: 62,
    type: 'SANCTION',
    badge: '4-EYES QUORUM',
    badgeColor: 'bg-[rgba(255,176,32,0.15)] text-[#FFB020] border-[rgba(255,176,32,0.4)]',
    text: 'Dual-key order signed for Case #2026-081',
    subtext: 'Maker & Checker joint signature authenticated',
  },
  {
    id: 'evt-5',
    timeOffsetSec: 90,
    type: 'LEDGER',
    badge: 'DIGILOCKER SYNC',
    badgeColor: 'bg-[rgba(255,212,0,0.15)] text-[#FFD400] border-[rgba(255,212,0,0.4)]',
    text: 'W3C VC deposited to MeriPehchaan',
    subtext: 'Priya Nair credential stored with DPDP consent',
  },
  {
    id: 'evt-6',
    timeOffsetSec: 110,
    type: 'SECURITY',
    badge: 'FIREWALL MITIGATION',
    badgeColor: 'bg-[rgba(255,82,99,0.15)] text-[#FF5263] border-[rgba(255,82,99,0.4)]',
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
          className="bg-[#101725] hover:bg-[#1C293B] text-[#F8FAFC] text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-[#35445A] hover:border-[#FFD400] flex items-center gap-2 cursor-pointer transition-all"
          title="Expand Live National Depository Telemetry Stream"
        >
          <span className="w-2 h-2 rounded-full bg-[#00D68F] beacon-pulse shrink-0" />
          <span>Live Feed ({TELEMETRY_STREAM.length})</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-14 left-3 sm:left-4 z-40 no-print animate-fade-up font-sans max-w-[calc(100vw-1.5rem)] sm:max-w-xs">
      <div
        className="bg-[#151F30] rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] border border-[#35445A] overflow-hidden text-[#F8FAFC]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Header */}
        <div className="bg-[#101725] text-[#F8FAFC] px-3.5 py-2 flex items-center justify-between text-[10px] border-b border-[#35445A]">
          <div className="flex items-center gap-2 font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#00D68F] beacon-pulse shrink-0" />
            <span className="text-[#FFD400] uppercase font-extrabold">National Telemetry Feed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="text-[#929FB0] hover:text-[#F8FAFC] p-1 rounded hover:bg-[#1C293B] transition-colors cursor-pointer"
              title={isPaused ? 'Resume stream' : 'Pause stream'}
            >
              {isPaused ? <Play size={10} className="fill-current text-[#00D68F]" /> : <Pause size={10} className="fill-current text-[#FFD400]" />}
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="text-[#929FB0] hover:text-[#F8FAFC] p-1 rounded hover:bg-[#1C293B] transition-colors cursor-pointer text-[10px] font-bold px-1.5 leading-none"
              title="Minimize stream"
            >
              _
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="text-[#929FB0] hover:text-[#FF5263] p-1 rounded hover:bg-[#1C293B] transition-colors cursor-pointer"
              title="Close ticker"
            >
              <X size={11} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-1.5 text-xs bg-[#151F30]">
          <div className="flex items-center justify-between gap-1.5">
            <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${current.badgeColor}`}>
              {current.badge}
            </span>
            <span className="text-[10px] text-[#929FB0] font-mono">{current.timeOffsetSec}s ago</span>
          </div>
          <div className="font-bold text-[#F8FAFC] truncate text-xs">{current.text}</div>
          <div className="text-[11px] text-[#C0CAD8] line-clamp-1">{current.subtext}</div>
        </div>

        {/* Progress Dots */}
        <div className="bg-[#101725] px-3 py-1.5 flex items-center justify-between border-t border-[#35445A] text-[10px] text-[#929FB0]">
          <span>AICTE Depository Stream</span>
          <div className="flex items-center gap-1.5">
            {TELEMETRY_STREAM.map((s, idx) => (
              <span
                key={s.id}
                onClick={() => setCurrentIdx(idx)}
                className={`h-1.5 rounded-full cursor-pointer transition-all ${
                  idx === currentIdx ? 'bg-[#FFD400] w-3.5 shadow-[0_0_6px_rgba(255,212,0,0.5)]' : 'bg-[#35445A] hover:bg-[#4A5F7E] w-1.5'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
