import { AlertOctagon, CheckCircle2, Database, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';

interface VisualAttackFlowProps {
  attackerRole: string;
  defenseEngine: string;
  ruleTriggered?: string;
  isExecuting: boolean;
  isThwarted: boolean;
  latencyMs?: number;
}

export function VisualAttackFlow({
  attackerRole,
  defenseEngine,
  ruleTriggered,
  isExecuting,
  isThwarted,
  latencyMs,
}: VisualAttackFlowProps) {
  return (
    <div className="p-4 rounded-xl border border-line bg-surface shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
          <Zap size={14} className="text-brand" />
          <span>Real-Time Adversarial Pipeline Visualizer</span>
        </div>
        <div className="text-[11px] font-mono">
          {isExecuting ? (
            <span className="text-amber-600 animate-pulse font-semibold">● Intercepting packet...</span>
          ) : isThwarted ? (
            <span className="text-ok font-semibold">● Neutralized in {latencyMs ?? 4.2}ms</span>
          ) : (
            <span className="text-muted">Standing by</span>
          )}
        </div>
      </div>

      {/* Visual 3-Stage Pipeline Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative items-stretch">
        {/* Node 1: Red Team Adversary */}
        <div
          className={`p-3 rounded-lg border transition-all text-xs flex flex-col justify-between ${
            isExecuting || isThwarted
              ? 'border-bad/40 bg-bad-wash/40 ring-1 ring-bad/20'
              : 'border-line bg-wash'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="tag tag-bad text-[10px] font-bold py-0 px-1.5 flex items-center gap-1">
                <AlertOctagon size={11} /> Red Team
              </span>
              <span className="text-[10px] mono text-muted">PORT: 443</span>
            </div>
            <div className="font-bold text-ink text-xs line-clamp-1">{attackerRole || 'Adversarial Syndicate'}</div>
            <div className="text-[10px] text-muted mt-0.5">Crafted exploit packet injection</div>
          </div>

          <div className="mt-3 pt-2 border-t border-bad/20 flex items-center justify-between text-[10px]">
            <span className="text-bad font-semibold">Status:</span>
            <span className="mono font-bold text-bad">
              {isExecuting ? 'TRANSMITTING' : isThwarted ? 'CONTAINED' : 'ARMED'}
            </span>
          </div>
        </div>

        {/* Node 2: Blue Team Firewall Shield */}
        <div
          className={`p-3 rounded-lg border transition-all text-xs flex flex-col justify-between ${
            isThwarted
              ? 'border-brand/40 bg-brand-wash/40 ring-2 ring-brand/30 shadow-xs'
              : isExecuting
              ? 'border-amber-400 bg-amber-500/10 animate-pulse'
              : 'border-line bg-wash'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="tag text-[10px] font-bold py-0 px-1.5 bg-brand text-white flex items-center gap-1">
                <ShieldCheck size={11} /> AICTE Zero-Trust Firewall
              </span>
              <span className="text-[10px] mono text-ok">ACTIVE</span>
            </div>
            <div className="font-bold text-ink text-xs line-clamp-1">
              {defenseEngine || 'Multi-Layer Cryptographic Shield'}
            </div>
            <div className="text-[10px] text-muted mt-0.5">
              {ruleTriggered ? `Enforcing Rule: ${ruleTriggered}` : 'Dihedral + HMAC + Merkle filters'}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-line-soft flex items-center justify-between text-[10px]">
            <span className="text-muted">Interception:</span>
            <span className="font-bold text-brand">
              {isThwarted ? 'DROP (HTTP 403)' : isExecuting ? 'INSPECTING' : 'LISTENING'}
            </span>
          </div>
        </div>

        {/* Node 3: Target Immutable Ledger */}
        <div
          className={`p-3 rounded-lg border transition-all text-xs flex flex-col justify-between ${
            isThwarted
              ? 'border-ok/40 bg-ok-wash/40 ring-1 ring-ok/20'
              : 'border-line bg-wash'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="tag tag-ok text-[10px] font-bold py-0 px-1.5 flex items-center gap-1">
                <Database size={11} /> Depository
              </span>
              <span className="text-[10px] mono text-ok font-bold">BLOCK #14,298</span>
            </div>
            <div className="font-bold text-ink text-xs">AICTE Sovereign Ledger</div>
            <div className="text-[10px] text-muted mt-0.5">SHA-256 Merkle Consensus Root</div>
          </div>

          <div className="mt-3 pt-2 border-t border-ok/20 flex items-center justify-between text-[10px]">
            <span className="text-ok font-semibold">Integrity:</span>
            <span className="mono font-bold text-ok flex items-center gap-1">
              <CheckCircle2 size={11} /> 100% UNCOMPROMISED
            </span>
          </div>
        </div>
      </div>

      {/* Packet Path Progress / Alert Bar */}
      <div className="p-2.5 rounded-lg bg-wash border border-line-soft flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          {isThwarted ? (
            <ShieldAlert size={15} className="text-ok shrink-0" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-brand beacon-pulse shrink-0" />
          )}
          <span className="text-ink">
            {isThwarted
              ? `Adversarial packet intercepted by AICTE shield before reaching depository. Threat actor blocked.`
              : isExecuting
              ? `Processing cryptographic signature verification and cross-institutional conflict index...`
              : `Firewall listening for zero-day tampering, ghost injection, and plain Aadhaar leaks.`}
          </span>
        </div>
        <span className="mono text-[10px] text-muted font-semibold shrink-0">W3C VC 2.0 / DPDP §8</span>
      </div>
    </div>
  );
}
