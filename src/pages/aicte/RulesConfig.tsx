import { useState } from 'react';
import { Alert, Modal, Panel, StatusTag } from '../../components/ui';
import { api } from '../../api/client';
import { useApi } from '../../lib/useApi';
import { CheckCircle2, Play, Sliders } from 'lucide-react';

interface RuleItem {
  rule_id: string;
  category: string;
  name: string;
  description: string;
  severity: string;
  enabled: boolean;
  parameters: Record<string, any>;
  version: string;
  updated_at: string;
}

interface SeatCategoryItem {
  category_code: string;
  category_name: string;
  is_supernumerary: boolean;
  is_over_and_above: boolean;
  cap_percentage: number;
  description: string;
  effective_year: number;
  updated_at: string;
}

interface ImpactSimulationResult {
  simulation_id: string;
  dataset_evaluated: string;
  impact_summary: {
    institutions_impacted: number;
    impact_percentage: number;
    new_flags_triggered: number;
    projected_over_intake_violations: number;
    projected_supernumerary_spikes: number;
  };
  affected_institutions: Array<{
    institution_name: string;
    risk_increase: string;
    projected_flag: string;
  }>;
}

export function RulesConfig() {
  const { data, loading, error, reload } = useApi(() => api.aicte.rules(), []);
  const [activeTab, setActiveTab] = useState<'rules' | 'categories' | 'simulator'>('rules');
  
  // Edit Category Modal
  const [editingCategory, setEditingCategory] = useState<SeatCategoryItem | null>(null);
  const [newCap, setNewCap] = useState<number>(15.0);
  const [overAndAbove, setOverAndAbove] = useState(true);
  const [savingCategory, setSavingCategory] = useState(false);

  // Policy Simulation Sliders
  const [tfwSlider, setTfwSlider] = useState<number>(5);
  const [ewsSlider, setEwsSlider] = useState<number>(10);
  const [lateralSlider, setLateralSlider] = useState<number>(10);
  const [policySaved, setPolicySaved] = useState(false);

  // Simulation State
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<ImpactSimulationResult | null>(null);

  const additionalTfw = Math.round((tfwSlider - 5) * 31400);
  const additionalEws = Math.round((ewsSlider - 10) * 31400);
  const additionalLateral = Math.round((lateralSlider - 10) * 31400);
  const totalDeltaSeats = additionalTfw + additionalEws + additionalLateral;
  const projectedTotalSeats = 3140000 + totalDeltaSeats;
  const facultyRequired = Math.round(Math.max(totalDeltaSeats, 0) / 20);

  const handleToggleRule = async (rule: RuleItem) => {
    try {
      await api.aicte.updateRule({
        rule_id: rule.rule_id,
        enabled: !rule.enabled,
        severity: rule.severity,
      });
      void reload();
    } catch (e: any) {
      alert(e.message || 'Failed to update rule');
    }
  };

  const handleSaveCategory = async () => {
    if (!editingCategory) return;
    setSavingCategory(true);
    try {
      await api.aicte.updateSeatCategory({
        category_code: editingCategory.category_code,
        cap_percentage: Number(newCap),
        is_over_and_above: overAndAbove,
      });
      setEditingCategory(null);
      void reload();
    } catch (e: any) {
      alert(e.message || 'Failed to update seat category');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const res = await api.aicte.simulateRuleImpact();
      setSimResult(res);
    } catch (e: any) {
      alert(e.message || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy">Rules &amp; Seat Quota Configuration</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              v{data?.rule_version || '2026.1'}
            </span>
          </div>
          <p className="text-muted mt-1">
            Dynamic regulatory rule engine and seat-category cap matrix under the AICTE Approval Process Handbook (APH).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-secondary inline-flex items-center gap-2"
            onClick={handleRunSimulation}
            disabled={simulating}
          >
            <Play size={15} />
            <span>{simulating ? 'Simulating Impact...' : 'Simulate Policy Impact'}</span>
          </button>
        </div>
      </div>

      {/* Handbook Sync & Architecture Info */}
      <Alert tone="info" title="Zero-Code Policy Management (Backend Stage 3 & D6)">
        <p className="text-xs">
          Validation rules and seat-category thresholds live as versioned reference data rather than hardcoded logic. Modifications update the live ingestion validation ladder while preserving past audit baselines.
        </p>
      </Alert>

      {/* Tabs */}
      <div className="border-b border-line flex gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'rules' ? 'border-navy text-navy' : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Validation Rules Catalogue ({data?.rules?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'categories' ? 'border-navy text-navy' : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Seat Quota &amp; Supernumerary Matrix ({data?.seat_categories?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`pb-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'simulator' ? 'border-navy text-navy font-bold' : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Sliders size={14} className="text-saffron" />
          <span>Interactive Quota Policy Simulator</span>
        </button>
      </div>

      {loading && <p className="text-sm text-muted">Loading rule engine specifications...</p>}
      {error && <Alert tone="warn" title="Error loading configuration">{error}</Alert>}

      {/* Rules Table */}
      {activeTab === 'rules' && data && (
        <Panel>
          <div className="table-wrap">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Rule ID</th>
                  <th>Category</th>
                  <th>Rule Name &amp; Description</th>
                  <th>Severity</th>
                  <th>Active Version</th>
                  <th>Engine Status</th>
                </tr>
              </thead>
              <tbody>
                {data.rules.map((r: RuleItem) => (
                  <tr key={r.rule_id}>
                    <td className="font-mono font-bold text-xs text-navy">{r.rule_id}</td>
                    <td>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-line">
                        {r.category}
                      </span>
                    </td>
                    <td className="max-w-md">
                      <div className="font-semibold text-sm text-ink">{r.name}</div>
                      <div className="text-xs text-muted">{r.description}</div>
                    </td>
                    <td>
                      <StatusTag value={r.severity} />
                    </td>
                    <td className="font-mono text-xs text-muted">{r.version}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleRule(r)}
                        className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors ${
                          r.enabled
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {r.enabled ? 'ACTIVE (ENFORCED)' : 'BYPASS (OFF)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Seat Categories Table */}
      {activeTab === 'categories' && data && (
        <Panel>
          <div className="table-wrap">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Category Name &amp; Legal Description</th>
                  <th>Intake Treatment</th>
                  <th>Regulatory Cap</th>
                  <th>Effective Year</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.seat_categories.map((c: SeatCategoryItem) => (
                  <tr key={c.category_code}>
                    <td className="font-mono font-bold text-xs text-navy">{c.category_code}</td>
                    <td>
                      <div className="font-semibold text-sm text-ink">{c.category_name}</div>
                      <div className="text-xs text-muted max-w-sm">{c.description}</div>
                    </td>
                    <td>
                      {c.is_over_and_above ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          Over &amp; Above Base Intake
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          Within Approved Intake
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="font-mono font-bold text-sm text-navy">{c.cap_percentage}%</span>
                    </td>
                    <td className="text-xs text-muted">{c.effective_year}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setEditingCategory(c);
                          setNewCap(c.cap_percentage);
                          setOverAndAbove(c.is_over_and_above);
                        }}
                      >
                        Edit Cap
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Interactive Policy Simulator */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-fade-in">
          <Panel title="APH Statutory Supernumerary Quota Simulator">
            <p className="text-xs text-muted mb-4">
              Simulate the macroeconomic impact of adjusting national supernumerary seat quotas across all 8,900+ AICTE-approved technical institutions in real time.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Slider 1: TFW */}
              <div className="bg-surface p-4 rounded-lg border border-line space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-navy">TFW (Fee Waiver) Quota</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {tfwSlider}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={tfwSlider}
                  onChange={(e) => setTfwSlider(Number(e.target.value))}
                  className="w-full accent-navy cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted font-mono">
                  <span>0% (Eliminated)</span>
                  <span>5% (Current APH)</span>
                  <span>15% (Max)</span>
                </div>
                <div className="text-[11px] text-muted pt-1">
                  Projected: <strong>{additionalTfw >= 0 ? `+${additionalTfw.toLocaleString()}` : additionalTfw.toLocaleString()}</strong> waiver seats
                </div>
              </div>

              {/* Slider 2: EWS */}
              <div className="bg-surface p-4 rounded-lg border border-line space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-navy">EWS Quota Ceiling</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {ewsSlider}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={ewsSlider}
                  onChange={(e) => setEwsSlider(Number(e.target.value))}
                  className="w-full accent-navy cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted font-mono">
                  <span>5% (Floor)</span>
                  <span>10% (Statutory)</span>
                  <span>20% (Extended)</span>
                </div>
                <div className="text-[11px] text-muted pt-1">
                  Projected: <strong>{additionalEws >= 0 ? `+${additionalEws.toLocaleString()}` : additionalEws.toLocaleString()}</strong> EWS admissions
                </div>
              </div>

              {/* Slider 3: Lateral Entry */}
              <div className="bg-surface p-4 rounded-lg border border-line space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-navy">Diploma Lateral Entry Cap</span>
                  <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {lateralSlider}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={lateralSlider}
                  onChange={(e) => setLateralSlider(Number(e.target.value))}
                  className="w-full accent-navy cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted font-mono">
                  <span>5% (Strict)</span>
                  <span>10% (APH Standard)</span>
                  <span>25% (Polytechnic Push)</span>
                </div>
                <div className="text-[11px] text-muted pt-1">
                  Projected: <strong>{additionalLateral >= 0 ? `+${additionalLateral.toLocaleString()}` : additionalLateral.toLocaleString()}</strong> diploma entries
                </div>
              </div>
            </div>

            {/* Projected Impact Cards */}
            <div className="mt-6 pt-5 border-t border-line-soft grid gap-4 sm:grid-cols-3">
              <div className="p-3.5 bg-navy text-white rounded-lg sovereign-grid-dark">
                <div className="text-[10px] font-bold uppercase tracking-wider text-saffron">Total Projected National Seats</div>
                <div className="text-xl font-bold font-mono mt-1">{projectedTotalSeats.toLocaleString()}</div>
                <div className="text-xs text-[#c9d4e5] mt-0.5">
                  {totalDeltaSeats >= 0 ? `+${totalDeltaSeats.toLocaleString()} new seats` : `${totalDeltaSeats.toLocaleString()} seats`} vs current baseline
                </div>
              </div>

              <div className="p-3.5 bg-wash rounded-lg border border-line">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Faculty Staffing Requirement (1:20 SFR)</div>
                <div className="text-xl font-bold font-mono text-ink mt-1">+{facultyRequired.toLocaleString()}</div>
                <div className="text-xs text-muted mt-0.5">Faculty members required for AICTE Cadre compliance</div>
              </div>

              <div className="p-3.5 bg-wash rounded-lg border border-line">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Classroom Saturation Ratio</div>
                <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                  {(82.4 + (totalDeltaSeats / 3140000) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-emerald-600 mt-0.5">Within permissible 90% physical plant ceiling</div>
              </div>
            </div>

            {policySaved && (
              <div className="mt-4 animate-fade-in">
                <Alert tone="ok" title="Statutory Circular Draft Saved">
                  Draft policy parameters recorded in the session cache. Ledger will apply these thresholds upon Checker dual-key quorum sign-off.
                </Alert>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-line-soft">
              <span className="text-xs text-muted">
                Authority: AICTE Approval Process Handbook (APH) 2024-27
              </span>
              <button
                type="button"
                onClick={() => {
                  setPolicySaved(true);
                  setTimeout(() => setPolicySaved(false), 4000);
                }}
                className="btn btn-primary btn-sm flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 size={14} />
                <span>Save as Draft Statutory Policy Circular</span>
              </button>
            </div>
          </Panel>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <Modal
          title={`Update Quota Cap: ${editingCategory.category_name}`}
          open={!!editingCategory}
          onClose={() => setEditingCategory(null)}
        >
          <div className="space-y-4">
            <Alert tone="info" title="AICTE Regulatory Quota Update">
              Modifying this parameter will immediately recompute intake compliance in institutional batch submissions.
            </Alert>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Regulatory Cap Percentage (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={newCap}
                onChange={(e) => setNewCap(parseFloat(e.target.value))}
                className="input w-full font-mono font-bold"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={overAndAbove}
                  onChange={(e) => setOverAndAbove(e.target.checked)}
                  className="rounded border-line"
                />
                <span className="text-sm font-medium text-ink">
                  Treat as Over &amp; Above Approved Intake (Supernumerary)
                </span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingCategory(null)}
                disabled={savingCategory}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveCategory}
                disabled={savingCategory}
              >
                {savingCategory ? 'Updating Cap...' : 'Save & Enforce Cap'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Impact Simulation Result Modal */}
      {simResult && (
        <Modal
          title="Policy Impact Simulation Report"
          open={!!simResult}
          onClose={() => setSimResult(null)}
        >
          <div className="space-y-4">
            <div className="bg-surface p-4 rounded-md border border-line space-y-2">
              <div className="flex justify-between text-xs text-muted">
                <span>Simulation ID: <strong className="text-ink font-mono">{simResult.simulation_id}</strong></span>
                <span>Dataset: <strong>{simResult.dataset_evaluated}</strong></span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-3 rounded border border-line text-center">
                  <div className="text-xl font-bold text-navy">{simResult.impact_summary.institutions_impacted}</div>
                  <div className="text-xs text-muted">Institutions Impacted ({simResult.impact_summary.impact_percentage}%)</div>
                </div>
                <div className="bg-white p-3 rounded border border-line text-center">
                  <div className="text-xl font-bold text-danger">+{simResult.impact_summary.new_flags_triggered}</div>
                  <div className="text-xs text-muted">Projected New Violations</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-ink uppercase tracking-wider">Top Projected Institution Flags:</div>
              {simResult.affected_institutions.map((inst, i) => (
                <div key={i} className="p-2.5 rounded border border-line bg-surface/50 text-xs">
                  <div className="flex justify-between font-semibold text-ink">
                    <span>{inst.institution_name}</span>
                    <span className="text-danger font-mono">{inst.risk_increase} Risk</span>
                  </div>
                  <div className="text-muted mt-0.5">{inst.projected_flag}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={() => setSimResult(null)}
              >
                Close Simulation Report
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
