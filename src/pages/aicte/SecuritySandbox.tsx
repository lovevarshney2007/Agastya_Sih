import { useState } from 'react';
import { CheckCircle2, ChevronRight, Play, RefreshCw, ShieldCheck, Terminal, Zap } from 'lucide-react';
import { api } from '../../api/client';
import { Alert, ErrorState, KeyValue, Loading, PageHeader, Panel, Spinner } from '../../components/ui';
import { VisualAttackFlow } from '../../components/VisualAttackFlow';
import { useApi } from '../../lib/useApi';

interface AttackScenario {
  id: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  attacker_role: string;
  attacker_objective: string;
  red_team_payload: Record<string, any>;
  blue_team_engine: string;
  defense_rule: string;
  expected_result: string;
  statutory_citation: string;
}

interface AttackExecutionResult {
  success: boolean;
  scenario_id: string;
  scenario_title: string;
  status: string;
  defense_engine: string;
  rule_triggered: string;
  statutory_citation: string;
  latency_ms: number;
  cryptographic_proof: string;
  audit_action: string;
  terminal_logs: string[];
  payload_inspected: Record<string, any>;
  timestamp: string;
}

export function SecuritySandboxPage() {
  const { data: scenarios, error, reload } = useApi(() => api.aicte.securityScenarios(), []);
  const [selectedId, setSelectedId] = useState<string>('ghost_student_injection');
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<AttackExecutionResult | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  if (error && !scenarios) return <ErrorState message={error} onRetry={reload} />;
  if (!scenarios) return <Loading rows={8} />;

  const activeScenario = scenarios.find((s: AttackScenario) => s.id === selectedId) || scenarios[0];

  const handleLaunchAttack = async () => {
    if (!activeScenario) return;
    setExecuting(true);
    setExecutionError(null);
    setExecutionResult(null);

    try {
      const res = await api.aicte.executeAttack(activeScenario.id);
      setExecutionResult(res);
    } catch (err) {
      setExecutionError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Adversarial Attack & Security Defense Sandbox"
        description="Live Red-Team penetration testing sandbox demonstrating AICTE autonomous defense, cryptographic integrity, and fraud interception."
        actions={
          <div className="flex items-center gap-2">
            <span className="tag tag-ok flex items-center gap-1 text-xs">
              <ShieldCheck size={14} /> Autonomous Shield: ACTIVE
            </span>
            <button type="button" className="btn btn-secondary btn-sm flex items-center gap-1" onClick={reload}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        }
      />

      {executionError && <div className="mb-4"><Alert tone="bad">{executionError}</Alert></div>}

      <div className="mb-6">
        <VisualAttackFlow
          attackerRole={activeScenario?.attacker_role || 'Rogue Entity'}
          defenseEngine={executionResult?.defense_engine || activeScenario?.blue_team_engine || 'AICTE Defense Shield'}
          ruleTriggered={executionResult?.rule_triggered || activeScenario?.defense_rule}
          isExecuting={executing}
          isThwarted={!!executionResult}
          latencyMs={executionResult?.latency_ms}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        {/* ── Left Column: Red Team Attack Vectors ── */}
        <div className="space-y-5">
          <Panel title="Select Adversarial Attack Vector (Red Team)">
            <p className="text-xs text-muted mt-0 mb-3">
              Choose an attack scenario to simulate an attempt by malicious syndicates, rogue insiders, or colleges to bypass regulatory checks.
            </p>

            <div className="space-y-2">
              {scenarios.map((s: AttackScenario) => {
                const isSelected = s.id === selectedId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(s.id);
                      setExecutionResult(null);
                    }}
                    className={`w-full text-left p-3 rounded border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-brand ring-2 ring-brand/20 bg-brand-wash/30'
                        : 'border-line bg-surface hover:border-line-strong'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-xs text-ink">{s.title}</span>
                        <span className={`tag text-[10px] py-0 px-1 font-bold ${
                          s.severity === 'CRITICAL' ? 'tag-bad' : s.severity === 'HIGH' ? 'tag-warn' : 'tag-neutral'
                        }`}>
                          {s.severity}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted truncate">{s.category} · Rule {s.defense_rule}</div>
                    </div>
                    <ChevronRight size={16} className={`shrink-0 ${isSelected ? 'text-brand' : 'text-faint'}`} />
                  </button>
                );
              })}
            </div>
          </Panel>

          {activeScenario && (
            <Panel title="Attack Vector Blueprint & Payload">
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted block">Attacker Persona:</span>
                  <strong className="text-ink font-semibold">{activeScenario.attacker_role}</strong>
                </div>

                <div>
                  <span className="text-muted block">Adversarial Objective:</span>
                  <p className="text-ink mt-0.5">{activeScenario.attacker_objective}</p>
                </div>

                <div>
                  <span className="text-muted block mb-1">Red Team Attack Payload:</span>
                  <pre className="mono text-[11px] bg-wash border border-line-soft rounded p-3 overflow-x-auto text-ink">
                    {JSON.stringify(activeScenario.red_team_payload, null, 2)}
                  </pre>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    className="btn btn-primary w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold"
                    disabled={executing}
                    onClick={handleLaunchAttack}
                  >
                    {executing ? <Spinner /> : <Play size={16} />}
                    Launch Attack against AICTE Shield
                  </button>
                </div>
              </div>
            </Panel>
          )}
        </div>

        {/* ── Right Column: Blue Team Defense Console & Execution Log ── */}
        <div className="space-y-5">
          <Panel
            title="Blue Team Autonomous Defense Terminal"
            actions={
              <span className="mono text-[11px] text-muted flex items-center gap-1">
                <Terminal size={14} /> W3C Ledger Interceptor
              </span>
            }
          >
            {executing ? (
              <div className="p-12 text-center space-y-3">
                <Spinner />
                <div className="text-sm font-semibold text-ink">Intercepting Adversarial Attack...</div>
                <div className="text-xs text-muted mono">Executing cryptographic verification &amp; regulatory rule match</div>
              </div>
            ) : executionResult ? (
              <div className="space-y-4">
                {/* Result Hero Banner */}
                <div className="bg-ok text-white p-4 rounded-lg flex items-start gap-3 shadow-sm">
                  <ShieldCheck size={28} className="shrink-0 animate-pop mt-0.5" />
                  <div>
                    <div className="text-base font-bold tracking-wide">ATTACK INTERCEPTED &amp; THWARTED</div>
                    <div className="text-xs opacity-95 mt-0.5">
                      Autonomous Defense Engine halted the adversarial payload in <strong>{executionResult.latency_ms}ms</strong>.
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  <div className="border border-line rounded p-2.5 bg-wash">
                    <span className="text-muted block">Defending Engine</span>
                    <strong className="text-ink">{executionResult.defense_engine}</strong>
                  </div>
                  <div className="border border-line rounded p-2.5 bg-wash">
                    <span className="text-muted block">Triggered Rule</span>
                    <strong className="text-bad font-mono">{executionResult.rule_triggered}</strong>
                  </div>
                </div>

                {/* Forensic Terminal Screen */}
                <div>
                  <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Forensic Terminal Execution Log</span>
                    <span className="mono text-[10px] text-ok">Live Defense Pipeline</span>
                  </div>
                  <div className="bg-[#0f172a] text-[#38bdf8] p-3.5 rounded-lg font-mono text-xs space-y-1 overflow-x-auto border border-[#334155] shadow-inner max-h-[220px]">
                    {executionResult.terminal_logs.map((log: string, idx: number) => {
                      const isAlert = log.includes('ATTACK') || log.includes('FAIL') || log.includes('MISMATCH') || log.includes('OVERFLOW');
                      const isSuccess = log.includes('Neutralized') || log.includes('anchored') || log.includes('completed');
                      return (
                        <div key={idx} className={isAlert ? 'text-[#f87171] font-semibold' : isSuccess ? 'text-[#4ade80]' : 'text-[#e2e8f0]'}>
                          {log}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Statutory Reference & Cryptographic Proof */}
                <div className="border-t border-line-soft pt-3">
                  <KeyValue
                    items={[
                      ['Statutory Citation', executionResult.statutory_citation],
                      ['Audit Ledger Action', <span key="audit_action" className="mono font-semibold text-brand">{executionResult.audit_action}</span>],
                      ['Cryptographic Hash Proof', <span key="proof_hash" className="mono text-[11px] break-all">{executionResult.cryptographic_proof}</span>],
                      ['Timestamp', executionResult.timestamp],
                    ]}
                  />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-brand-wash text-brand mx-auto flex items-center justify-center">
                  <Zap size={24} />
                </div>
                <h4 className="text-sm font-bold text-ink">Security Simulator Ready</h4>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Select an adversarial attack from the left column and click <strong>"Launch Attack"</strong> to see real-time autonomous interception, cryptographic proof generation, and statutory enforcement.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleLaunchAttack}
                  >
                    Test Ghost Student Attack (Quick Demo)
                  </button>
                </div>
              </div>
            )}
          </Panel>

          {/* Defense Capabilities Summary */}
          <Panel title="Defense Grid Integrity Matrix">
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              <div className="p-2.5 rounded border border-line bg-surface">
                <div className="font-semibold text-ink flex items-center gap-1.5 mb-1">
                  <CheckCircle2 size={14} className="text-ok" /> Dihedral Checksum Gatekeeper
                </div>
                <p className="text-muted mt-0">Enforces mathematical Verhoeff verification on all APAAR IDs before admission.</p>
              </div>

              <div className="p-2.5 rounded border border-line bg-surface">
                <div className="font-semibold text-ink flex items-center gap-1.5 mb-1">
                  <CheckCircle2 size={14} className="text-ok" /> Cross-Institution Conflict Engine
                </div>
                <p className="text-muted mt-0">Detects concurrent dual full-time seats in milliseconds across all institutions.</p>
              </div>

              <div className="p-2.5 rounded border border-line bg-surface">
                <div className="font-semibold text-ink flex items-center gap-1.5 mb-1">
                  <CheckCircle2 size={14} className="text-ok" /> Merkle Hash Chain Auditor
                </div>
                <p className="text-muted mt-0">Instant alarm on direct SQL row alterations with pinpoint sequence integrity proof.</p>
              </div>

              <div className="p-2.5 rounded border border-line bg-surface">
                <div className="font-semibold text-ink flex items-center gap-1.5 mb-1">
                  <CheckCircle2 size={14} className="text-ok" /> Dynamic Quota Enforcer
                </div>
                <p className="text-muted mt-0">Enforces APH Regulation 13(4) category percentage caps (TFW, EWS, Lateral Entry).</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
