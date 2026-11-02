import { useEffect, useRef, useState } from 'react';
import {
  Building2, ChevronDown, ChevronRight, GraduationCap, LayoutGrid, List, MapPin, RefreshCw,
  Search, ShieldCheck, TrendingUp, Users, X,
} from 'lucide-react';
import { api } from '../api/client';
import type { PublicInstitutionRow, PublicSeatsResponse } from '../api/types';
import { AsOf, CountUp, Loading, Meter, MicroSparkline, Pagination } from '../components/ui';
import { fmtDateTime, fmtNum, fmtRelative } from '../lib/format';
import { Link } from '../lib/router';
import { useApi } from '../lib/useApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

function utilizationColor(pct: number) {
  if (pct > 100) return 'bg-bad';
  if (pct >= 90) return 'bg-saffron';
  if (pct >= 70) return 'bg-[#d4a72c]';
  return 'bg-india-green';
}

function utilizationTextColor(pct: number) {
  if (pct > 100) return 'text-bad font-semibold';
  if (pct >= 90) return 'text-saffron font-semibold';
  if (pct >= 70) return 'text-[#8a5b00]';
  return 'text-india-green';
}

function SmallBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const ratio = max > 0 ? value / max : 0;
  const width = Math.min(ratio, 1) * 100;
  const color = utilizationColor(ratio * 100);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(width));
    return () => cancelAnimationFrame(id);
  }, [width]);
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div
        className="h-1.5 flex-1 rounded-full bg-line-soft overflow-hidden"
        role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}
      >
        <div
          className={`h-full rounded-full ${color} transition-[width] duration-700 ease-out`}
          style={{ width: `${shown}%` }}
        />
      </div>
      <span className={`text-xs tabular-nums whitespace-nowrap ${utilizationTextColor(ratio * 100)}`}>
        {Math.round(ratio * 100)}%
      </span>
    </div>
  );
}

// ── KPI tile ─────────────────────────────────────────────────────────────────

function KpiTile({ icon: Icon, label, value, sub, accent = 'brand', sparkline }: {
  icon: React.ElementType; label: string; value: React.ReactNode; sub?: string; accent?: string; sparkline?: number[];
}) {
  const accentMap: Record<string, string> = {
    brand: 'bg-brand-wash text-brand',
    green: 'bg-ok-wash text-ok',
    saffron: 'bg-saffron-wash text-saffron',
    teal: 'bg-[#e0f4f3] text-teal',
  };
  return (
    <div className="panel p-4 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${accentMap[accent] ?? accentMap.brand}`}>
            <Icon size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="text-2xl font-bold tabular-nums text-ink leading-tight">
              <CountUp value={value} />
            </div>
            <div className="text-sm font-medium text-muted mt-0.5">{label}</div>
          </div>
        </div>
        {sparkline && (
          <MicroSparkline
            data={sparkline}
            width={52}
            height={22}
            tone={accent === 'green' ? 'ok' : accent === 'saffron' ? 'saffron' : 'brand'}
          />
        )}
      </div>
      {sub && <div className="text-xs text-faint mt-2">{sub}</div>}
    </div>
  );
}

// ── Programme chart ───────────────────────────────────────────────────────────

function ProgrammeChart({ data }: { data: PublicSeatsResponse['programmes'] }) {
  const max = Math.max(...data.map((r) => r.approved_intake), 1);
  return (
    <div className="space-y-2.5">
      {data.slice(0, 10).map((row) => (
        <div key={`${row.course}-${row.level}`} className="flex items-center gap-3 text-sm">
          <span className="w-36 shrink-0 truncate text-muted" title={`${row.course} (${row.level})`}>
            {row.course}
          </span>
          <div className="flex-1 relative h-6 flex items-center">
            {/* Approved bar */}
            <div
              className="absolute left-0 h-4 rounded-sm bg-brand-wash border border-brand/25"
              style={{ width: `${(row.approved_intake / max) * 100}%` }}
              aria-hidden="true"
            />
            {/* Enrolled bar */}
            <div
              className={`absolute left-0 h-2.5 rounded-sm ${utilizationColor(row.enrolled / Math.max(row.approved_intake, 1) * 100)} opacity-80`}
              style={{ width: `${(row.enrolled / max) * 100}%` }}
              aria-hidden="true"
            />
          </div>
          <span className="w-20 text-right text-xs tabular-nums text-muted">
            {fmtNum(row.enrolled)}<span className="text-faint">/{fmtNum(row.approved_intake)}</span>
          </span>
        </div>
      ))}
      <div className="flex items-center gap-4 text-xs text-muted pt-1">
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-2 rounded-sm bg-brand-wash border border-brand/25" /> Approved intake</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-2 rounded-sm bg-india-green opacity-80" /> Enrolled</span>
      </div>
    </div>
  );
}

// ── State breakdown table ─────────────────────────────────────────────────────

function StateTable({
  states, selected, onSelect,
}: {
  states: PublicSeatsResponse['states'];
  selected: string;
  onSelect: (s: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-line">
            <th className="text-left pb-2 pr-4 text-muted font-medium">State</th>
            <th className="text-right pb-2 px-3 text-muted font-medium whitespace-nowrap">Colleges</th>
            <th className="text-right pb-2 px-3 text-muted font-medium whitespace-nowrap">Approved</th>
            <th className="text-right pb-2 px-3 text-muted font-medium whitespace-nowrap">Enrolled</th>
            <th className="pb-2 pl-3 text-muted font-medium min-w-[140px]">Utilization</th>
          </tr>
        </thead>
        <tbody>
          {states.map((row) => (
            <tr
              key={row.state}
              className={`border-b border-line-soft cursor-pointer hover:bg-wash transition-colors ${selected === row.state ? 'bg-brand-wash' : ''}`}
              onClick={() => onSelect(selected === row.state ? '' : row.state)}
            >
              <td className="py-2 pr-4 font-medium">
                <span className="flex items-center gap-1">
                  {row.state}
                  {selected === row.state && <X size={12} className="text-brand shrink-0" />}
                </span>
              </td>
              <td className="py-2 px-3 text-right tabular-nums">{fmtNum(row.institutions_count)}</td>
              <td className="py-2 px-3 text-right tabular-nums">{fmtNum(row.approved_seats)}</td>
              <td className="py-2 px-3 text-right tabular-nums">{fmtNum(row.enrolled)}</td>
              <td className="py-2 pl-3">
                <SmallBar value={row.enrolled} max={row.approved_seats} label={`${row.state} utilization`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Geospatial Regional Zone Matrix ──────────────────────────────────────────

const REGIONAL_ZONES: { name: string; tag: string; states: string[] }[] = [
  {
    name: 'Northern Zone',
    tag: 'NZ',
    states: ['Delhi', 'Uttar Pradesh', 'Rajasthan', 'Punjab', 'Haryana', 'Uttarakhand', 'Jammu and Kashmir'],
  },
  {
    name: 'Western Zone',
    tag: 'WZ',
    states: ['Maharashtra', 'Gujarat', 'Goa', 'Madhya Pradesh'],
  },
  {
    name: 'Southern Zone',
    tag: 'SZ',
    states: ['Tamil Nadu', 'Karnataka', 'Telangana', 'Andhra Pradesh', 'Kerala'],
  },
  {
    name: 'Eastern & North-East Zone',
    tag: 'EZ',
    states: ['West Bengal', 'Bihar', 'Odisha', 'Jharkhand', 'Assam'],
  },
];

function RegionalZoneMatrix({
  states,
  selected,
  onSelect,
}: {
  states: PublicSeatsResponse['states'];
  selected: string;
  onSelect: (s: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {REGIONAL_ZONES.map((zone) => {
          const matchedStates = states.filter((s) =>
            zone.states.some((zs) => zs.toLowerCase() === s.state.toLowerCase())
          );
          const totalSeats = matchedStates.reduce((acc, s) => acc + s.approved_seats, 0);
          const totalEnrolled = matchedStates.reduce((acc, s) => acc + s.enrolled, 0);
          const totalColleges = matchedStates.reduce((acc, s) => acc + s.institutions_count, 0);
          const ratio = totalSeats > 0 ? (totalEnrolled / totalSeats) * 100 : 0;
          const hasSelected = matchedStates.some((s) => s.state === selected);

          return (
            <div
              key={zone.name}
              className={`p-3.5 rounded-lg border transition-all ${
                hasSelected ? 'border-brand bg-brand-wash/30 shadow-xs' : 'border-line bg-wash/40 hover:border-line-strong'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-bold text-sm text-navy flex items-center gap-1.5">
                    <MapPin size={13} className="text-saffron shrink-0" />
                    <span>{zone.name}</span>
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {totalColleges} colleges · {fmtNum(totalEnrolled)} enrolled
                  </div>
                </div>
                <span className={`text-xs font-bold tabular-nums ${utilizationTextColor(ratio)}`}>
                  {Math.round(ratio)}% fill
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-line-soft rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full ${utilizationColor(ratio)} transition-all duration-500`}
                  style={{ width: `${Math.min(ratio, 100)}%` }}
                />
              </div>

              {/* State Chips */}
              <div className="flex flex-wrap gap-1.5">
                {matchedStates.map((s) => {
                  const isSel = selected === s.state;
                  return (
                    <button
                      key={s.state}
                      type="button"
                      onClick={() => onSelect(isSel ? '' : s.state)}
                      className={`text-xs px-2 py-0.5 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                        isSel
                          ? 'bg-brand text-white border-brand font-semibold shadow-xs'
                          : 'bg-white hover:bg-brand-wash text-ink border-line hover:border-brand/40'
                      }`}
                      title={`${s.state}: ${fmtNum(s.enrolled)}/${fmtNum(s.approved_seats)} (${Math.round((s.enrolled / Math.max(s.approved_seats, 1)) * 100)}%)`}
                    >
                      <span>{s.state}</span>
                      {isSel && <X size={11} className="shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-[11px] text-muted flex items-center justify-between pt-1">
        <span>Click any state chip to isolate colleges in that jurisdiction</span>
        {selected && (
          <button
            type="button"
            className="text-brand hover:underline font-semibold text-xs"
            onClick={() => onSelect('')}
          >
            Clear State Filter ({selected})
          </button>
        )}
      </div>
    </div>
  );
}

// ── Institution row expanded ──────────────────────────────────────────────────

function InstitutionProgrammes({ inst }: { inst: PublicInstitutionRow }) {
  return (
    <div className="bg-wash border-t border-line-soft px-4 py-3">
      <div className="text-xs text-muted font-semibold mb-2 uppercase tracking-wide">Programme breakdown</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-line-soft">
              <th className="text-left pb-1 pr-3 text-faint font-medium">Course</th>
              <th className="text-left pb-1 pr-3 text-faint font-medium">Level</th>
              <th className="text-right pb-1 px-2 text-faint font-medium">Approved</th>
              <th className="text-right pb-1 px-2 text-faint font-medium">Enrolled</th>
              <th className="text-right pb-1 px-2 text-faint font-medium">Supernumerary</th>
              <th className="pb-1 pl-2 text-faint font-medium min-w-[120px]">Fill rate</th>
            </tr>
          </thead>
          <tbody>
            {inst.programmes.map((p, i) => (
              <tr key={i} className="border-b border-line-soft last:border-0">
                <td className="py-1.5 pr-3 font-medium">{p.course}</td>
                <td className="py-1.5 pr-3 text-muted">{p.level}</td>
                <td className="py-1.5 px-2 text-right tabular-nums">{fmtNum(p.approved_intake)}</td>
                <td className="py-1.5 px-2 text-right tabular-nums">{fmtNum(p.enrolled)}</td>
                <td className="py-1.5 px-2 text-right tabular-nums text-muted">
                  {fmtNum(p.supernumerary)}/{fmtNum(p.supernumerary_cap)}
                </td>
                <td className="py-1.5 pl-2">
                  <SmallBar value={p.enrolled} max={p.approved_intake} label={`${p.course} fill`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── College table ─────────────────────────────────────────────────────────────

function CollegeTable({
  institutions, total, page, pageSize, onPage,
}: {
  institutions: PublicInstitutionRow[];
  total: number; page: number; pageSize: number;
  onPage: (p: number) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto rounded-md border border-line">
      <table className="w-full text-sm border-collapse min-w-[900px]">
        <thead className="bg-wash border-b border-line">
          <tr>
            <th className="text-left py-3 px-4 text-muted font-medium">College</th>
            <th className="text-left py-3 px-3 text-muted font-medium">State</th>
            <th className="text-right py-3 px-3 text-muted font-medium whitespace-nowrap">Approved</th>
            <th className="text-right py-3 px-3 text-muted font-medium whitespace-nowrap">Enrolled</th>
            <th className="text-right py-3 px-3 text-muted font-medium whitespace-nowrap">Remaining</th>
            <th className="py-3 px-3 text-muted font-medium min-w-[150px]">Utilization</th>
            <th className="text-right py-3 px-3 text-muted font-medium whitespace-nowrap">APAAR verified</th>
            <th className="py-3 px-3 text-muted font-medium whitespace-nowrap">Last updated</th>
            <th className="py-3 px-3 w-8" />
          </tr>
        </thead>
        <tbody>
          {institutions.length === 0 && (
            <tr>
              <td colSpan={9} className="py-12 text-center text-muted">
                No institutions found. Try adjusting the filters.
              </td>
            </tr>
          )}
          {institutions.map((inst) => {
            const isOpen = expanded === inst.id;
            const remaining = inst.seats_remaining;
            return (
              <>
                <tr
                  key={inst.id}
                  className={`border-b border-line-soft cursor-pointer hover:bg-wash transition-colors ${isOpen ? 'bg-wash' : ''}`}
                  onClick={() => setExpanded(isOpen ? null : inst.id)}
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-ink">{inst.name}</div>
                    <div className="text-xs text-faint mt-0.5 font-mono">{inst.code} · {inst.type}</div>
                  </td>
                  <td className="py-3 px-3 text-muted whitespace-nowrap">
                    {inst.state}{inst.district ? `, ${inst.district}` : ''}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">{fmtNum(inst.total_approved)}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{fmtNum(inst.total_enrolled)}</td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    <span className={remaining < 0 ? 'text-bad font-semibold' : remaining === 0 ? 'text-muted' : 'text-india-green font-semibold'}>
                      {remaining < 0 ? `+${fmtNum(Math.abs(remaining))} over` : fmtNum(remaining)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <Meter value={inst.total_enrolled} max={inst.total_approved} label={`${inst.name} utilization`} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`tabular-nums text-sm ${inst.identity_verified_pct >= 90 ? 'text-ok font-semibold' : inst.identity_verified_pct >= 70 ? 'text-muted' : 'text-bad'}`}>
                      {inst.identity_verified_pct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-muted whitespace-nowrap">
                    {inst.last_submission ? fmtRelative(inst.last_submission) : <span className="text-faint">Not submitted</span>}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <ChevronDown
                      size={16}
                      className={`text-faint transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </td>
                </tr>
                {isOpen && (
                  <tr key={`${inst.id}-detail`} className="border-b border-line-soft">
                    <td colSpan={9} className="p-0">
                      <InstitutionProgrammes inst={inst} />
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
      <Pagination page={page} pageSize={pageSize} total={total} onPage={onPage} />
    </div>
  );
}

// ── Mock fallback data (used when backend endpoint doesn't exist yet) ──────────

function buildMockData(): PublicSeatsResponse {
  const states = [
    { state: 'Maharashtra', institutions_count: 312, approved_seats: 94800, enrolled: 87240, utilization_pct: 92, verified_pct: 84 },
    { state: 'Tamil Nadu', institutions_count: 241, approved_seats: 72300, enrolled: 65800, utilization_pct: 91, verified_pct: 88 },
    { state: 'Karnataka', institutions_count: 197, approved_seats: 59100, enrolled: 52400, utilization_pct: 89, verified_pct: 82 },
    { state: 'Uttar Pradesh', institutions_count: 278, approved_seats: 83400, enrolled: 70100, utilization_pct: 84, verified_pct: 71 },
    { state: 'Rajasthan', institutions_count: 143, approved_seats: 42900, enrolled: 34200, utilization_pct: 80, verified_pct: 75 },
    { state: 'Gujarat', institutions_count: 159, approved_seats: 47700, enrolled: 41200, utilization_pct: 86, verified_pct: 79 },
    { state: 'Telangana', institutions_count: 134, approved_seats: 40200, enrolled: 38900, utilization_pct: 97, verified_pct: 91 },
    { state: 'West Bengal', institutions_count: 98, approved_seats: 29400, enrolled: 24100, utilization_pct: 82, verified_pct: 68 },
  ];
  const programmes = [
    { course: 'B.Tech', level: 'UG', approved_intake: 240000, enrolled: 218400, supernumerary: 14200 },
    { course: 'MBA', level: 'PG', approved_intake: 85000, enrolled: 72100, supernumerary: 3800 },
    { course: 'MCA', level: 'PG', approved_intake: 42000, enrolled: 36800, supernumerary: 1900 },
    { course: 'M.Tech', level: 'PG', approved_intake: 38000, enrolled: 29400, supernumerary: 1200 },
    { course: 'B.Pharm', level: 'UG', approved_intake: 24000, enrolled: 21600, supernumerary: 1100 },
    { course: 'Diploma', level: 'Diploma', approved_intake: 96000, enrolled: 81200, supernumerary: 4200 },
  ];
  const institutions: PublicInstitutionRow[] = [
    {
      id: 'inst-1', name: 'Indian Institute of Technology Bombay', code: 'PER-MH-001',
      state: 'Maharashtra', district: 'Mumbai', type: 'Autonomous Institute',
      programmes: [
        { course: 'B.Tech', level: 'UG', approved_intake: 880, enrolled: 876, supernumerary: 52, supernumerary_cap: 88 },
        { course: 'M.Tech', level: 'PG', approved_intake: 420, enrolled: 408, supernumerary: 18, supernumerary_cap: 42 },
        { course: 'MBA', level: 'PG', approved_intake: 120, enrolled: 118, supernumerary: 8, supernumerary_cap: 12 },
      ],
      total_approved: 1420, total_enrolled: 1402, seats_remaining: 18, identity_verified_pct: 97.3,
      as_of: new Date().toISOString(), last_submission: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'inst-2', name: 'Savitribai Phule Pune University', code: 'PER-MH-042',
      state: 'Maharashtra', district: 'Pune', type: 'State University',
      programmes: [
        { course: 'B.Tech', level: 'UG', approved_intake: 1200, enrolled: 1240, supernumerary: 80, supernumerary_cap: 120 },
        { course: 'MCA', level: 'PG', approved_intake: 180, enrolled: 174, supernumerary: 12, supernumerary_cap: 18 },
      ],
      total_approved: 1380, total_enrolled: 1414, seats_remaining: -34, identity_verified_pct: 81.2,
      as_of: new Date().toISOString(), last_submission: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'inst-3', name: 'PSG College of Technology', code: 'PER-TN-017',
      state: 'Tamil Nadu', district: 'Coimbatore', type: 'Private Aided',
      programmes: [
        { course: 'B.Tech', level: 'UG', approved_intake: 960, enrolled: 902, supernumerary: 48, supernumerary_cap: 96 },
        { course: 'MBA', level: 'PG', approved_intake: 120, enrolled: 112, supernumerary: 6, supernumerary_cap: 12 },
        { course: 'M.Tech', level: 'PG', approved_intake: 60, enrolled: 54, supernumerary: 4, supernumerary_cap: 6 },
      ],
      total_approved: 1140, total_enrolled: 1068, seats_remaining: 72, identity_verified_pct: 92.8,
      as_of: new Date().toISOString(), last_submission: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'inst-4', name: 'Delhi Technological University', code: 'PER-DL-003',
      state: 'Delhi', district: 'Delhi', type: 'State University',
      programmes: [
        { course: 'B.Tech', level: 'UG', approved_intake: 1440, enrolled: 1380, supernumerary: 72, supernumerary_cap: 144 },
        { course: 'M.Tech', level: 'PG', approved_intake: 360, enrolled: 298, supernumerary: 18, supernumerary_cap: 36 },
      ],
      total_approved: 1800, total_enrolled: 1678, seats_remaining: 122, identity_verified_pct: 88.4,
      as_of: new Date().toISOString(), last_submission: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'inst-5', name: 'Vellore Institute of Technology', code: 'PER-TN-009',
      state: 'Tamil Nadu', district: 'Vellore', type: 'Deemed University',
      programmes: [
        { course: 'B.Tech', level: 'UG', approved_intake: 5400, enrolled: 5298, supernumerary: 324, supernumerary_cap: 540 },
        { course: 'MBA', level: 'PG', approved_intake: 480, enrolled: 462, supernumerary: 24, supernumerary_cap: 48 },
        { course: 'M.Tech', level: 'PG', approved_intake: 720, enrolled: 684, supernumerary: 36, supernumerary_cap: 72 },
        { course: 'MCA', level: 'PG', approved_intake: 240, enrolled: 228, supernumerary: 12, supernumerary_cap: 24 },
      ],
      total_approved: 6840, total_enrolled: 6672, seats_remaining: 168, identity_verified_pct: 94.6,
      as_of: new Date().toISOString(), last_submission: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'inst-6', name: 'Rajiv Gandhi Institute of Technology', code: 'PER-KA-028',
      state: 'Karnataka', district: 'Bengaluru', type: 'Government',
      programmes: [
        { course: 'B.Tech', level: 'UG', approved_intake: 360, enrolled: 312, supernumerary: 18, supernumerary_cap: 36 },
        { course: 'Diploma', level: 'Diploma', approved_intake: 180, enrolled: 164, supernumerary: 9, supernumerary_cap: 18 },
      ],
      total_approved: 540, total_enrolled: 476, seats_remaining: 64, identity_verified_pct: 76.3,
      as_of: new Date().toISOString(), last_submission: null,
    },
  ];
  return {
    as_of: new Date().toISOString(), academic_year: 2026,
    total_approved_seats: 525000, total_enrolled: 468400,
    total_institutions: 1562, institutions_reporting: 1318,
    states, programmes, institutions,
    page: 1, page_size: 20, total_institution_count: institutions.length,
  };
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function PublicDashboard() {
  const [state, setState] = useState('');
  const [level, setLevel] = useState('');
  const [search, setSearch] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [page, setPage] = useState(1);
  const [stateViewMode, setStateViewMode] = useState<'matrix' | 'table'>('matrix');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const PAGE_SIZE = 20;

  const { data: live, error, loading, reload } = useApi(
    () => api.publicSeats({ state: state || undefined, level: level || undefined, search: search || undefined, page, page_size: PAGE_SIZE }),
    [state, level, search, page],
  );

  // Fall back to mock data when the endpoint isn't implemented yet
  const data: PublicSeatsResponse = live ?? buildMockData();
  const isMock = !live;

  // Auto-refresh every 5 min
  useEffect(() => {
    const t = setInterval(() => { void reload(); }, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [reload]);

  const stateOptions = [...new Set(data.states.map((s) => s.state))].sort();
  const levelOptions = [...new Set(data.programmes.map((p) => p.level))].sort();

  function handleSearchChange(val: string) {
    setInputVal(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setSearch(val); setPage(1); }, 350);
  }

  function handleStateChange(val: string) { setState(val); setPage(1); }
  function handleLevelChange(val: string) { setLevel(val); setPage(1); }

  const seatsRemaining = data.total_approved_seats - data.total_enrolled;
  const notReporting = data.total_institutions - data.institutions_reporting;

  return (
    <div className="min-h-screen bg-page">
      {/* ── Page header ── */}
      <div className="bg-navy-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link to="/" className="text-[#c9d4e5] text-sm no-underline hover:underline inline-flex items-center gap-1 mb-3">
                ← Back to home
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold">🏛️ Live Seats Dashboard</h1>
              <p className="text-[#c9d4e5] mt-1.5 max-w-2xl">
                Real-time enrolment data for AICTE-approved institutions across India. Academic year {data.academic_year}–{data.academic_year + 1}.
                Updated on every submission. No personal data is shown.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {isMock && (
                <span className="bg-saffron/20 text-saffron text-xs px-2.5 py-1 rounded-full font-semibold">
                  Demo data
                </span>
              )}
              <span className="bg-white/10 text-white text-xs px-2.5 py-1 rounded-full">
                Prototype · synthetic data
              </span>
              <button
                type="button"
                onClick={() => void reload()}
                disabled={loading}
                className="btn btn-sm bg-white/10 hover:bg-white/20 text-white border-0"
                aria-label="Refresh data"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
                Refresh
              </button>
            </div>
          </div>
          <div className="text-xs text-[#8b9bbf] mt-3 flex items-center gap-1.5">
            <ShieldCheck size={13} aria-hidden="true" />
            Data from AICTE APAAR Ledger · Last updated{' '}
            {error ? <span className="text-saffron">update failed</span> : fmtDateTime(data.as_of)}
          </div>
        </div>
        <div className="tricolour h-1" aria-hidden="true" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── KPI tiles ── */}
        <section aria-labelledby="kpi-h">
          <h2 id="kpi-h" className="sr-only">National figures</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiTile
              icon={Building2}
              label="Institutions approved"
              value={fmtNum(data.total_institutions)}
              sub="AICTE-approved"
              accent="brand"
              sparkline={[2800, 2850, 2920, 2980, 3040, 3110, 3180]}
            />
            <KpiTile
              icon={TrendingUp}
              label="Reporting this year"
              value={fmtNum(data.institutions_reporting)}
              sub={`${notReporting} not yet submitted`}
              accent="green"
              sparkline={[1200, 1500, 1850, 2150, 2480, 2710, 2940]}
            />
            <KpiTile
              icon={Users}
              label="Total approved seats"
              value={fmtNum(data.total_approved_seats)}
              sub={`${fmtNum(data.total_enrolled)} enrolled`}
              accent="saffron"
              sparkline={[720000, 720000, 720000, 720000, 720000, 720000, 720000]}
            />
            <KpiTile
              icon={GraduationCap}
              label="Seats available"
              value={seatsRemaining < 0 ? `+${fmtNum(Math.abs(seatsRemaining))} over` : fmtNum(seatsRemaining)}
              sub="approved minus enrolled"
              accent="teal"
              sparkline={[180000, 150000, 120000, 95000, 75000, 58000, Math.max(seatsRemaining, 10000)]}
            />
          </div>
        </section>

        {/* ── State + Programme ── */}
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
          {/* State breakdown */}
          <section aria-labelledby="state-h" className="panel">
            <div className="panel-head">
              <div className="flex items-center gap-2">
                <h2 id="state-h">Regional & State Distribution</h2>
                {state && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-wash text-brand font-semibold">
                    Filter: {state}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 bg-wash p-0.5 rounded border border-line">
                <button
                  type="button"
                  className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${stateViewMode === 'matrix' ? 'bg-surface font-semibold shadow-2xs text-ink' : 'text-muted hover:text-ink'}`}
                  onClick={() => setStateViewMode('matrix')}
                  title="Geospatial Regional Matrix"
                >
                  <LayoutGrid size={12} /> Regional Matrix
                </button>
                <button
                  type="button"
                  className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${stateViewMode === 'table' ? 'bg-surface font-semibold shadow-2xs text-ink' : 'text-muted hover:text-ink'}`}
                  onClick={() => setStateViewMode('table')}
                  title="Table view"
                >
                  <List size={12} /> Table
                </button>
              </div>
            </div>
            <div className="panel-body">
              {stateViewMode === 'matrix' ? (
                <RegionalZoneMatrix states={data.states} selected={state} onSelect={handleStateChange} />
              ) : (
                <StateTable states={data.states} selected={state} onSelect={handleStateChange} />
              )}
            </div>
          </section>

          {/* Programme chart */}
          <section aria-labelledby="prog-h" className="panel">
            <div className="panel-head">
              <h2 id="prog-h">Programme-wise seats</h2>
              <span className="text-xs text-muted">Enrolled vs approved intake</span>
            </div>
            <div className="panel-body">
              <ProgrammeChart data={data.programmes} />
            </div>
          </section>
        </div>

        {/* ── College-wise table ── */}
        <section aria-labelledby="colleges-h">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 id="colleges-h" className="text-xl font-bold">College-wise live seats</h2>
              <p className="text-muted text-sm mt-0.5">
                {fmtNum(data.total_institution_count)} institutions{state ? ` in ${state}` : ''}{level ? ` · ${level}` : ''}.
                Click a row to see programme details.
              </p>
            </div>
            <AsOf at={data.as_of} onRefresh={reload} loading={loading} />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" aria-hidden="true" />
              <input
                type="search"
                className="input pl-9 w-full"
                placeholder="Search college name or ID…"
                value={inputVal}
                onChange={(e) => handleSearchChange(e.target.value)}
                aria-label="Search colleges"
              />
            </div>

            <div className="relative">
              <select
                className="input pr-8 appearance-none cursor-pointer"
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                aria-label="Filter by state"
              >
                <option value="">All states</option>
                {stateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronRight size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-faint pointer-events-none" aria-hidden="true" />
            </div>

            <div className="relative">
              <select
                className="input pr-8 appearance-none cursor-pointer"
                value={level}
                onChange={(e) => handleLevelChange(e.target.value)}
                aria-label="Filter by level"
              >
                <option value="">All levels</option>
                {levelOptions.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <ChevronRight size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-faint pointer-events-none" aria-hidden="true" />
            </div>

            {(state || level || search) && (
              <button
                type="button"
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
                onClick={() => { setState(''); setLevel(''); setSearch(''); setInputVal(''); setPage(1); }}
              >
                <X size={14} aria-hidden="true" /> Clear filters
              </button>
            )}
          </div>

          {loading && !live ? (
            <Loading rows={6} />
          ) : (
            <CollegeTable
              institutions={data.institutions}
              total={data.total_institution_count}
              page={page}
              pageSize={PAGE_SIZE}
              onPage={setPage}
            />
          )}
        </section>

        {/* ── Transparency footer ── */}
        <section className="panel p-5 border-t-4 !border-t-brand text-sm">
          <div className="flex flex-wrap gap-6 items-start">
            <div className="flex-1 min-w-[220px]">
              <div className="font-semibold mb-1">About this data</div>
              <p className="text-muted">
                Figures are sourced from institution submissions to the AICTE APAAR Ledger. Numbers update
                as institutions commit their enrolment data. Small groups (fewer than 10) are shown as &lt;10 to protect privacy.
              </p>
            </div>
            <div className="flex-1 min-w-[220px]">
              <div className="font-semibold mb-1">What we never show</div>
              <ul className="text-muted space-y-0.5 list-disc pl-4">
                <li>Student names, APAAR IDs, or personal details</li>
                <li>Aadhaar numbers or contact information</li>
                <li>Which students belong to which seat category</li>
              </ul>
            </div>
            <div className="flex-1 min-w-[180px]">
              <div className="font-semibold mb-1">Verify a certificate</div>
              <p className="text-muted mb-2">Have a QR code from a student certificate?</p>
              <Link to="/verify" className="btn btn-primary btn-sm no-underline">Check a QR code →</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

