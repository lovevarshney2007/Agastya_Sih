import { useEffect, useState } from 'react';
import { Activity, Pause, Play, Radio, ShieldCheck, Zap } from 'lucide-react';

interface TelemetryEvent {
  id: string;
  time: string;
  state: string;
  category: 'INGESTION' | 'VERIFIER' | 'SECURITY' | 'LEDGER' | 'CONSENT';
  text: string;
  latencyMs: number;
}

const INITIAL_EVENTS: TelemetryEvent[] = [
  { id: '1', time: 'Just now', state: 'MH', category: 'INGESTION', text: 'COEP Pune committed batch upload (150 students). SHA-256 block hash verified.', latencyMs: 14 },
  { id: '2', time: '3s ago', state: 'DL', category: 'VERIFIER', text: 'TCS background desk performed consent-gated degree verification via blind index.', latencyMs: 8 },
  { id: '3', time: '7s ago', state: 'KA', category: 'SECURITY', text: 'Blind index matching engine intercepted concurrent dual enrollment conflict.', latencyMs: 22 },
  { id: '4', time: '12s ago', state: 'TN', category: 'LEDGER', text: 'Merkle root anchor #1844 synchronized to WORM compliance storage.', latencyMs: 19 },
  { id: '5', time: '18s ago', state: 'WB', category: 'CONSENT', text: 'Student consent token issued to HDFC Credila for education loan verification.', latencyMs: 11 },
];

const STREAMING_POOL = [
  { state: 'GJ', category: 'INGESTION' as const, text: 'Nirma University submitted Semester 1 admission roster (85 students).', latencyMs: 16 },
  { state: 'UP', category: 'VERIFIER' as const, text: 'Infosys Limited validated W3C verifiable degree certificate via offline QR.', latencyMs: 9 },
  { state: 'TG', category: 'LEDGER' as const, text: 'Audit hash link computed: prev_hash 34bc7... -> hash 89da1... (0-bit deviation).', latencyMs: 13 },
  { state: 'RJ', category: 'SECURITY' as const, text: 'Adversarial red-team test payload intercepted and quarantined by boundary guard.', latencyMs: 25 },
  { state: 'KL', category: 'CONSENT' as const, text: 'Guardian consent verified for minor applicant under DPDP Act Rule 10.', latencyMs: 15 },
  { state: 'PB', category: 'INGESTION' as const, text: 'Thapar Institute intake cap adherence verified at 94% sanctioned capacity.', latencyMs: 12 },
];

export function RegulatoryTelemetry() {
  const [events, setEvents] = useState<TelemetryEvent[]>(INITIAL_EVENTS);
  const [isLive, setIsLive] = useState(true);
  const [throughput, setThroughput] = useState(38);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const nextItem = STREAMING_POOL[Math.floor(Math.random() * STREAMING_POOL.length)];
      const newEv: TelemetryEvent = {
        id: Math.random().toString(),
        time: 'Just now',
        state: nextItem.state,
        category: nextItem.category,
        text: nextItem.text,
        latencyMs: nextItem.latencyMs,
      };

      setEvents((prev) => [newEv, ...prev.slice(0, 5)]);
      setThroughput(35 + Math.floor(Math.random() * 12));
    }, 4500);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="mb-6 rounded-xl border border-line bg-white shadow-sm overflow-hidden">
      {/* Top Header Bar */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-navy to-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className={`w-3 h-3 rounded-full ${isLive ? 'bg-emerald-400 animate-ping absolute' : 'bg-slate-400'}`} />
            <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-slate-400'}`} />
          </div>
          <div className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Radio size={14} className="text-emerald-400" />
            National Regulatory Telemetry &amp; Event Stream
          </div>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-1.5">
            <Zap size={13} className="text-amber-400" />
            <span className="text-slate-300">Throughput:</span>
            <span className="font-mono font-bold text-emerald-300">{throughput} tx/s</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Activity size={13} className="text-blue-400" />
            <span className="text-slate-300">Avg Hash Latency:</span>
            <span className="font-mono font-bold text-blue-300">14.2 ms</span>
          </div>

          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span className="text-slate-300">Integrity:</span>
            <span className="font-mono font-bold text-emerald-300">100% Chain Intact</span>
          </div>

          <button
            type="button"
            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-[11px]"
            onClick={() => setIsLive((l) => !l)}
            title={isLive ? 'Pause Stream' : 'Resume Stream'}
          >
            {isLive ? <Pause size={12} /> : <Play size={12} />}
            <span>{isLive ? 'Live' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Stream Ticker Rows */}
      <div className="divide-y divide-line-soft">
        {events.map((ev) => {
          const badgeClass =
            ev.category === 'INGESTION'
              ? 'bg-blue-100 text-blue-800 border-blue-200'
              : ev.category === 'SECURITY'
              ? 'bg-amber-100 text-amber-800 border-amber-200'
              : ev.category === 'LEDGER'
              ? 'bg-purple-100 text-purple-800 border-purple-200'
              : ev.category === 'VERIFIER'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : 'bg-indigo-100 text-indigo-800 border-indigo-200';

          return (
            <div key={ev.id} className="px-4 py-2 text-xs flex items-center justify-between gap-3 hover:bg-wash transition">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] shrink-0">
                  {ev.state}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${badgeClass}`}>
                  {ev.category}
                </span>
                <span className="truncate text-ink font-medium">{ev.text}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-muted font-mono text-[11px]">
                <span>{ev.latencyMs}ms</span>
                <span>{ev.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
