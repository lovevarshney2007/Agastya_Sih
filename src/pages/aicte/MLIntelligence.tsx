import { useState } from 'react';
import { api } from '../../api/client';
import type { FuzzyDedupResponse } from '../../api/types';
import { Alert, ErrorState, Loading, PageHeader, Panel, StatusTag } from '../../components/ui';
import { fmtNum } from '../../lib/format';
import { useApi } from '../../lib/useApi';
import { Brain, Cpu, GitCompare, Scale, Search, TrendingUp, UserCheck } from 'lucide-react';
import { SeatDemandForecaster } from '../../components/SeatDemandForecaster';

export function MLIntelligencePage() {
  const [activeTab, setActiveTab] = useState<'forecast' | 'dedup' | 'cohort'>('forecast');
  const [selectedState, setSelectedState] = useState<string>('ALL');

  // Forecasting API hook
  const { data: cohortData, error: cohortError, loading: cohortLoading, reload: reloadCohorts } = useApi(
    () => api.ml.cohortAnomalies(),
    []
  );

  const { data: forecastData, error: forecastError, loading: forecastLoading, reload: reloadForecast } = useApi(
    () => api.ml.forecasting(selectedState === 'ALL' ? undefined : selectedState),
    [selectedState]
  );

  // Live Deduplication Sandbox State
  const [nameA, setNameA] = useState('Mohd. Rizwan Khan');
  const [dobA, setDobA] = useState('2005-04-12');
  const [nameB, setNameB] = useState('Mohammad Rizwan Khan');
  const [dobB, setDobB] = useState('2005-04-12');
  const [fatherName, setFatherName] = useState('Abdul Khan');
  const [dedupResult, setDedupResult] = useState<FuzzyDedupResponse | null>(null);
  const [dedupLoading, setDedupLoading] = useState(false);
  const [dedupError, setDedupError] = useState<string | null>(null);

  const runPairwiseDedup = async () => {
    setDedupLoading(true);
    setDedupError(null);
    try {
      const res = await api.ml.fuzzyDedup({
        student_name: nameA,
        dob: dobA,
        target_name: nameB,
        target_dob: dobB,
        father_name: fatherName,
      });
      setDedupResult(res);
    } catch (err) {
      setDedupError(err instanceof Error ? err.message : 'Deduplication failed.');
    } finally {
      setDedupLoading(false);
    }
  };

  const runDatabaseScan = async () => {
    setDedupLoading(true);
    setDedupError(null);
    try {
      const res = await api.ml.fuzzyDedup({
        student_name: nameA,
        dob: dobA,
        father_name: fatherName,
        threshold: 0.60,
      });
      setDedupResult(res);
    } catch (err) {
      setDedupError(err instanceof Error ? err.message : 'Database scan failed.');
    } finally {
      setDedupLoading(false);
    }
  };

  const states = ['ALL', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Uttar Pradesh', 'Gujarat'];

  return (
    <>
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Brain className="text-brand h-7 w-7" />
            <span>AICTE Policy & Machine Learning Intelligence</span>
          </div>
        }
        description="Predictive seat rationalization, probabilistic Indian demographic deduplication, and synthetic ghost-student cohort detection."
      />

      {/* Navigation Tabs */}
      <div className="flex border-b border-line-soft mb-6 space-x-4">
        <button
          type="button"
          onClick={() => setActiveTab('forecast')}
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'forecast'
              ? 'border-brand text-brand font-semibold'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <TrendingUp size={16} />
          Seat Demand & Rationalization Forecaster
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dedup')}
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'dedup'
              ? 'border-brand text-brand font-semibold'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <UserCheck size={16} />
          Indian Demographic Fuzzy Deduplication
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cohort')}
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'cohort'
              ? 'border-brand text-brand font-semibold'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Cpu size={16} />
          Ghost Student & Batch Anomaly Scanner
        </button>
      </div>

      {/* ── TAB 1: SEAT FORECASTING ── */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          <SeatDemandForecaster />

          <div className="flex flex-wrap items-center justify-between gap-4 bg-canvas-subtle p-4 rounded-lg border border-line-soft">
            <div>
              <h2 className="font-semibold text-ink text-base">Academic Cycle 2026–2027 Projections</h2>
              <p className="text-xs text-muted mt-0.5">
                Calculated using discipline trend regressions and actual student admissions vs sanctioned intake.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="state-filter" className="text-xs font-semibold text-muted uppercase">
                Filter State:
              </label>
              <select
                id="state-filter"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="input input-sm"
              >
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st === 'ALL' ? 'All States (National)' : st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {forecastLoading && !forecastData ? (
            <Loading rows={6} />
          ) : forecastError ? (
            <ErrorState message={forecastError} onRetry={reloadForecast} />
          ) : forecastData ? (
            <>
              {/* Metric KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="panel p-4 bg-canvas border border-line-soft rounded-lg">
                  <div className="text-xs font-semibold text-muted uppercase">Sanctioned Intake</div>
                  <div className="text-2xl font-bold text-ink mt-1">
                    {fmtNum(forecastData.summary.total_sanctioned_intake)}
                  </div>
                  <div className="text-xs text-muted mt-1">Total approved capacity</div>
                </div>
                <div className="panel p-4 bg-canvas border border-line-soft rounded-lg">
                  <div className="text-xs font-semibold text-muted uppercase">Projected 2026 Demand</div>
                  <div className="text-2xl font-bold text-brand mt-1">
                    {fmtNum(forecastData.summary.total_projected_demand)}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    Est. fill rate: {forecastData.summary.projected_fill_rate_pct}%
                  </div>
                </div>
                <div className="panel p-4 bg-canvas border border-line-soft rounded-lg">
                  <div className="text-xs font-semibold text-muted uppercase">Projected Surplus / Vacant</div>
                  <div className="text-2xl font-bold text-bad mt-1">
                    {fmtNum(forecastData.summary.projected_unfilled_seats)}
                  </div>
                  <div className="text-xs text-muted mt-1">Seats at risk of non-admission</div>
                </div>
                <div className="panel p-4 bg-canvas border border-line-soft rounded-lg">
                  <div className="text-xs font-semibold text-muted uppercase">Rationalization Model</div>
                  <div className="text-base font-bold text-ink mt-1">Ridge + Trend ML</div>
                  <div className="text-xs text-ok mt-1 flex items-center gap-1">
                    <Scale size={12} /> Statutory compliant
                  </div>
                </div>
              </div>

              {/* Discipline Breakdown Table */}
              <Panel
                title={
                  <div className="flex items-center justify-between w-full">
                    <h3 className="font-semibold text-base">Discipline Demand & Statutory Policy Recommendations</h3>
                    <span className="text-xs text-muted mono">Model: AICTE-FORECAST-2026.1</span>
                  </div>
                }
              >
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Discipline / Branch</th>
                        <th className="num">Sanctioned</th>
                        <th className="num">Current Enrolled</th>
                        <th className="num">2026 Est. Demand</th>
                        <th>Projected Fill %</th>
                        <th>Policy Status</th>
                        <th>Statutory AICTE Advisory</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecastData.discipline_breakdown.map((row) => (
                        <tr key={row.discipline}>
                          <td className="font-semibold">{row.discipline}</td>
                          <td className="num">{fmtNum(row.approved_intake_2025)}</td>
                          <td className="num">{fmtNum(row.actual_enrolled_2025)}</td>
                          <td className="num font-bold text-brand">{fmtNum(row.projected_demand_2026)}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-16 bg-line-soft rounded-sm overflow-hidden">
                                <div
                                  className={`h-full ${
                                    row.projected_fill_rate_2026 >= 90
                                      ? 'bg-ok'
                                      : row.projected_fill_rate_2026 >= 65
                                      ? 'bg-[#d4a72c]'
                                      : 'bg-bad'
                                  }`}
                                  style={{ width: `${Math.min(100, row.projected_fill_rate_2026)}%` }}
                                />
                              </div>
                              <span className="tabular-nums text-xs font-semibold">
                                {row.projected_fill_rate_2026}%
                              </span>
                            </div>
                          </td>
                          <td>
                            <StatusTag
                              value={
                                row.policy_action_status === 'SURPLUS_SEATS_AT_RISK'
                                  ? 'HIGH'
                                  : row.policy_action_status === 'CAPACITY_EXPANSION_RECOMMENDED'
                                  ? 'OK'
                                  : 'LOW'
                              }
                              label={
                                row.policy_action_status === 'SURPLUS_SEATS_AT_RISK'
                                  ? 'Surplus Risk'
                                  : row.policy_action_status === 'CAPACITY_EXPANSION_RECOMMENDED'
                                  ? 'Expand Quota'
                                  : 'Optimal'
                              }
                            />
                          </td>
                          <td className="text-xs text-ink max-w-sm">{row.statutory_recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </>
          ) : null}
        </div>
      )}

      {/* ── TAB 2: INDIAN DEMOGRAPHIC FUZZY DEDUPLICATION ── */}
      {activeTab === 'dedup' && (
        <div className="space-y-6">
          <Alert tone="info" title="Jury Live Interactive Sandbox">
            Test how the platform handles Indian name transliterations, title variations (&quot;Mohd&quot; vs &quot;Mohammad&quot;), and
            phonetic Soundex / Jaro-Winkler distance before APAAR resolution.
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Record A */}
            <Panel title={<h3 className="font-semibold text-base">Candidate Record A (Uploaded Batch)</h3>}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Student Full Name</label>
                  <input
                    type="text"
                    value={nameA}
                    onChange={(e) => setNameA(e.target.value)}
                    className="input w-full"
                    placeholder="e.g. Mohd. Rizwan Khan"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Date of Birth (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={dobA}
                    onChange={(e) => setDobA(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Father / Guardian Name</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="input w-full"
                    placeholder="e.g. Abdul Khan"
                  />
                </div>
              </div>
            </Panel>

            {/* Record B */}
            <Panel title={<h3 className="font-semibold text-base">Target Record B (Existing Seat / Registry)</h3>}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Target Student Name</label>
                  <input
                    type="text"
                    value={nameB}
                    onChange={(e) => setNameB(e.target.value)}
                    className="input w-full"
                    placeholder="e.g. Mohammad Rizwan Khan"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Target Date of Birth</label>
                  <input
                    type="date"
                    value={dobB}
                    onChange={(e) => setDobB(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div className="pt-6 flex gap-3">
                  <button
                    type="button"
                    disabled={dedupLoading}
                    onClick={runPairwiseDedup}
                    className="btn btn-primary flex-1 flex items-center justify-center gap-1.5"
                  >
                    <GitCompare size={14} /> Compare Identity Pair
                  </button>
                  <button
                    type="button"
                    disabled={dedupLoading}
                    onClick={runDatabaseScan}
                    className="btn btn-secondary flex-1 flex items-center justify-center gap-1.5"
                  >
                    <Search size={14} /> Scan National DB
                  </button>
                </div>
              </div>
            </Panel>
          </div>

          {dedupError && <Alert tone="bad">{dedupError}</Alert>}

          {/* Results Display */}
          {dedupResult && dedupResult.mode === 'PAIRWISE_COMPARISON' && dedupResult.comparison && (
            <Panel title={<h3 className="font-semibold text-base">Probabilistic Entity Linkage Verdict</h3>}>
              <div className="p-4 bg-canvas-subtle rounded-lg border border-line-soft flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <div className="text-xs font-semibold text-muted uppercase">Confidence Match Score</div>
                  <div className="text-3xl font-extrabold text-brand mt-1">
                    {dedupResult.comparison.confidence_pct}%
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted uppercase">Duplicate Risk Classification</div>
                  <div className="mt-1">
                    <StatusTag
                      value={dedupResult.comparison.risk_tier === 'HIGH_PROBABILITY_DUPLICATE' ? 'HIGH' : 'MEDIUM'}
                      label={dedupResult.comparison.risk_tier}
                    />
                  </div>
                </div>
                <div className="text-xs text-muted max-w-sm">
                  {dedupResult.comparison.risk_tier === 'HIGH_PROBABILITY_DUPLICATE'
                    ? 'CRITICAL ALERT: High probability of cross-institutional dual-enrolment under minor phonetic variation.'
                    : 'Records show minor similarity; manual registrar verification recommended.'}
                </div>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Linkage Metric</th>
                      <th className="num">Computed Value</th>
                      <th>Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Jaro-Winkler Name Distance (Prefix Weighted)</td>
                      <td className="num font-semibold">{dedupResult.comparison.metrics.name_jaro_winkler}</td>
                      <td>
                        {dedupResult.comparison.metrics.name_jaro_winkler > 0.85 ? (
                          <span className="text-ok font-medium">Strong prefix and phonetic match</span>
                        ) : (
                          <span className="text-muted">Moderate variation</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Levenshtein Edit Similarity Ratio</td>
                      <td className="num font-semibold">{dedupResult.comparison.metrics.levenshtein_ratio}</td>
                      <td>Character-level substitution & edit proximity</td>
                    </tr>
                    <tr>
                      <td>Indian Phonetic Soundex Equivalence</td>
                      <td className="num font-semibold">
                        {dedupResult.comparison.metrics.phonetic_soundex_match ? '1.0 (MATCH)' : '0.0 (NO MATCH)'}
                      </td>
                      <td>
                        {dedupResult.comparison.metrics.phonetic_soundex_match ? (
                          <span className="text-ok font-medium">Phonetically identical under Indian dialect mapping</span>
                        ) : (
                          <span className="text-muted">Distinct phonetic pronunciation</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Date of Birth Proximity</td>
                      <td className="num font-semibold">{dedupResult.comparison.metrics.dob_match_score}</td>
                      <td>Exact calendar birth-date match</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {dedupResult && dedupResult.mode === 'DATABASE_CROSS_SCAN' && (
            <Panel
              title={
                <h3 className="font-semibold text-base">
                  Database Scan Matches ({dedupResult.total_matches ?? 0} potential candidates)
                </h3>
              }
            >
              {dedupResult.candidates && dedupResult.candidates.length > 0 ? (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Enrolled Student</th>
                        <th>Institution & State</th>
                        <th>Course</th>
                        <th className="num">Match Score</th>
                        <th>Risk Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dedupResult.candidates.map((c) => (
                        <tr key={c.student_id}>
                          <td>
                            <div className="font-semibold">{c.enrolled_name}</div>
                            <div className="text-xs text-muted">DOB: {c.enrolled_dob || 'N/A'} · APAAR: {c.apaar_id || 'Pending'}</div>
                          </td>
                          <td>
                            <div>{c.institution_name}</div>
                            <div className="text-xs text-muted">{c.institution_state}</div>
                          </td>
                          <td className="text-xs">{c.course_name}</td>
                          <td className="num font-bold text-brand">{c.confidence_pct}%</td>
                          <td>
                            <StatusTag
                              value={c.risk_tier === 'HIGH_PROBABILITY_DUPLICATE' ? 'HIGH' : 'MEDIUM'}
                              label={c.risk_tier}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted text-sm">
                  No duplicate candidate exceeded the confidence threshold in the national student ledger.
                </div>
              )}
            </Panel>
          )}
        </div>
      )}

      {/* ── TAB 3: COHORT ANOMALY & GHOST STUDENT SCANNER ── */}
      {activeTab === 'cohort' && (
        <div className="space-y-6">
          <Alert tone="info" title="Unsupervised Batch-Level Demographic Entropy Scanner">
            Detects fraudulent admission cohorts where rogue institutions fabricate synthetic student profiles to
            claim government scholarship subsidies or satisfy faculty-student accreditation ratios.
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="panel p-4 bg-canvas border border-line-soft rounded-lg">
              <div className="text-xs font-semibold text-muted uppercase">DOB Variance Gauge</div>
              <div className="text-lg font-bold text-ink mt-2">Birth-Year StdDev (σ)</div>
              <p className="text-xs text-muted mt-1">
                Flags unnatural clustering where 90%+ of admissions share an identical birth year.
              </p>
            </div>
            <div className="panel p-4 bg-canvas border border-line-soft rounded-lg">
              <div className="text-xs font-semibold text-muted uppercase">Category Entropy</div>
              <div className="text-lg font-bold text-ink mt-2">Quota Skew Detector</div>
              <p className="text-xs text-muted mt-1">
                Identifies synthetic batches where a single social category is padded beyond demographic plausibility.
              </p>
            </div>
            <div className="panel p-4 bg-canvas border border-line-soft rounded-lg">
              <div className="text-xs font-semibold text-muted uppercase">APAAR Coverage</div>
              <div className="text-lg font-bold text-ink mt-2">Missing ID Outlier</div>
              <p className="text-xs text-muted mt-1">
                Batches with &gt;40% missing APAAR IDs are quarantined from ledger commit pending physical audit.
              </p>
            </div>
          </div>

          {cohortLoading && !cohortData ? (
            <Loading rows={5} />
          ) : cohortError ? (
            <ErrorState message={cohortError} onRetry={reloadCohorts} />
          ) : (
            <Panel title={<h3 className="font-semibold text-base">Active Institution Cohort Demographic Entropy & Fraud Scores</h3>}>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Permanent ID</th>
                      <th>Institution & State</th>
                      <th className="num">Enrolled</th>
                      <th>Birth Variance</th>
                      <th>Dominant Quota</th>
                      <th className="num">Anomaly Score</th>
                      <th>Inspection Level</th>
                      <th>Automated Finding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(cohortData || []).map((row) => (
                      <tr key={row.institution_id}>
                        <td className="mono text-xs font-semibold">{row.aicte_permanent_id}</td>
                        <td>
                          <div className="font-semibold">{row.name}</div>
                          <div className="text-xs text-muted">{row.state}</div>
                        </td>
                        <td className="num font-semibold">{fmtNum(row.total_enrolled)}</td>
                        <td className="text-xs">
                          <span className={row.birth_year_std_dev < 0.15 ? 'text-bad font-semibold' : 'text-ok font-semibold'}>
                            σ = {row.birth_year_std_dev}
                          </span>{' '}
                          <span className="text-muted">
                            ({row.birth_year_std_dev < 0.15 ? 'Clustered' : 'Dispersed'})
                          </span>
                        </td>
                        <td className="text-xs font-medium">{row.dominant_category_pct}%</td>
                        <td className="num font-bold">
                          <span className={row.fraud_score >= 0.5 ? 'text-bad' : row.fraud_score >= 0.25 ? 'text-[#d4a72c]' : 'text-ok'}>
                            {row.fraud_score.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <StatusTag value={row.risk_level} />
                        </td>
                        <td className="text-xs max-w-xs">{row.findings.join(' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </div>
      )}
    </>
  );
}
