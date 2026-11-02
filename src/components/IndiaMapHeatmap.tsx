import { useState } from 'react';
import { fmtNum, pct } from '../lib/format';

export interface StateData {
  state: string;
  institutions: number;
  reported: number;
  enrolled: number;
  approved_intake: number;
  open_cases: number;
  high_risk: number;
  value: number;
}

interface IndiaMapHeatmapProps {
  states: StateData[];
  metric: 'enrolled' | 'reporting' | 'utilisation' | 'open_cases';
  selectedState: string | null;
  onSelectState: (stateName: string) => void;
}

// Geographic layout grid coordinates for Indian states (x, y, width, height)
interface StateGeoNode {
  name: string;
  code: string;
  x: number;
  y: number;
  w: number;
  h: number;
  region: 'North' | 'South' | 'West' | 'East' | 'Central' | 'NorthEast';
}

const STATE_GEO_NODES: StateGeoNode[] = [
  // North
  { name: 'Jammu and Kashmir', code: 'JK', x: 190, y: 25, w: 90, h: 42, region: 'North' },
  { name: 'Himachal Pradesh', code: 'HP', x: 200, y: 72, w: 75, h: 36, region: 'North' },
  { name: 'Punjab', code: 'PB', x: 140, y: 105, w: 65, h: 38, region: 'North' },
  { name: 'Uttarakhand', code: 'UK', x: 245, y: 105, w: 65, h: 36, region: 'North' },
  { name: 'Haryana', code: 'HR', x: 175, y: 148, w: 60, h: 38, region: 'North' },
  { name: 'Delhi', code: 'DL', x: 238, y: 148, w: 42, h: 34, region: 'North' },
  { name: 'Rajasthan', code: 'RJ', x: 80, y: 180, w: 100, h: 68, region: 'North' },
  { name: 'Uttar Pradesh', code: 'UP', x: 250, y: 175, w: 110, h: 64, region: 'North' },

  // Central & East
  { name: 'Bihar', code: 'BR', x: 380, y: 185, w: 75, h: 48, region: 'East' },
  { name: 'West Bengal', code: 'WB', x: 445, y: 240, w: 65, h: 60, region: 'East' },
  { name: 'Jharkhand', code: 'JH', x: 375, y: 240, w: 65, h: 46, region: 'East' },
  { name: 'Odisha', code: 'OD', x: 370, y: 295, w: 75, h: 52, region: 'East' },
  { name: 'Madhya Pradesh', code: 'MP', x: 195, y: 245, w: 115, h: 62, region: 'Central' },
  { name: 'Chhattisgarh', code: 'CG', x: 315, y: 275, w: 50, h: 65, region: 'Central' },

  // West
  { name: 'Gujarat', code: 'GJ', x: 65, y: 260, w: 90, h: 58, region: 'West' },
  { name: 'Maharashtra', code: 'MH', x: 165, y: 320, w: 125, h: 68, region: 'West' },
  { name: 'Goa', code: 'GA', x: 155, y: 410, w: 38, h: 28, region: 'West' },

  // South
  { name: 'Telangana', code: 'TG', x: 245, y: 395, w: 75, h: 48, region: 'South' },
  { name: 'Andhra Pradesh', code: 'AP', x: 265, y: 450, w: 85, h: 54, region: 'South' },
  { name: 'Karnataka', code: 'KA', x: 180, y: 430, w: 80, h: 72, region: 'South' },
  { name: 'Kerala', code: 'KL', x: 185, y: 515, w: 55, h: 58, region: 'South' },
  { name: 'Tamil Nadu', code: 'TN', x: 245, y: 515, w: 75, h: 62, region: 'South' },

  // North-East
  { name: 'Assam', code: 'AS', x: 505, y: 195, w: 75, h: 38, region: 'NorthEast' },
];

export function IndiaMapHeatmap({ states, metric, selectedState, onSelectState }: IndiaMapHeatmapProps) {
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);

  const stateMap = new Map<string, StateData>();
  states.forEach((s) => stateMap.set(s.state.toLowerCase(), s));

  // Compute color based on value
  const values = states.map((s) => s.value);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 1);

  const getColor = (stateName: string) => {
    const data = stateMap.get(stateName.toLowerCase());
    if (!data) return '#f1f5f9';

    if (metric === 'open_cases') {
      if (data.open_cases > 1) return '#f43f5e'; // strong red
      if (data.open_cases === 1) return '#fb923c'; // amber orange
      return '#10b981'; // clean emerald
    }

    if (metric === 'utilisation') {
      const util = pct(data.enrolled, data.approved_intake);
      if (util >= 90) return '#059669'; // high green
      if (util >= 75) return '#0284c7'; // solid cyan/blue
      if (util >= 50) return '#f59e0b'; // amber
      return '#94a3b8'; // grey
    }

    if (metric === 'reporting') {
      const rep = pct(data.reported, data.institutions);
      if (rep >= 85) return '#0d9488';
      if (rep >= 60) return '#0284c7';
      return '#eab308';
    }

    // Default: enrolled (gradient blue)
    const ratio = Math.min(Math.max((data.value - minVal) / (maxVal - minVal || 1), 0), 1);
    if (ratio > 0.8) return '#1e3a8a'; // deep navy
    if (ratio > 0.6) return '#2563eb'; // blue
    if (ratio > 0.4) return '#3b82f6';
    if (ratio > 0.2) return '#60a5fa';
    return '#93c5fd';
  };

  return (
    <div className="relative font-sans select-none">
      {/* Interactive SVG Geo Topology Canvas */}
      <div className="w-full overflow-x-auto py-2">
        <svg
          viewBox="0 0 620 595"
          className="w-full max-w-[560px] mx-auto h-auto drop-shadow-sm"
          style={{ minHeight: '380px' }}
        >
          {/* Subtle Map Backdrop */}
          <rect width="620" height="595" fill="#f8fafc" rx="12" />

          {/* Grid lines for cartographic look */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="620" height="595" fill="url(#grid)" opacity="0.6" />

          {/* Render State Geographic Nodes */}
          {STATE_GEO_NODES.map((node) => {
            const data = stateMap.get(node.name.toLowerCase());
            const isSelected = selectedState?.toLowerCase() === node.name.toLowerCase();
            const fillColor = getColor(node.name);

            return (
              <g
                key={node.code}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onSelectState(node.name)}
                onMouseEnter={() => data && setHoveredState(data)}
                onMouseLeave={() => setHoveredState(null)}
                className="cursor-pointer transition-transform duration-150 group"
              >
                {/* State Topology Rect */}
                <rect
                  width={node.w}
                  height={node.h}
                  rx="6"
                  fill={fillColor}
                  stroke={isSelected ? '#f59e0b' : '#ffffff'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  className="transition-all duration-200 group-hover:brightness-95 group-hover:shadow-lg"
                  style={{
                    filter: isSelected ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))' : undefined,
                  }}
                />

                {/* State Code */}
                <text
                  x={node.w / 2}
                  y={node.h / 2 - 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  className="pointer-events-none tracking-wider"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                >
                  {node.code}
                </text>

                {/* Metric Mini Value */}
                {data && (
                  <text
                    x={node.w / 2}
                    y={node.h / 2 + 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#ffffff"
                    fontSize="8.5"
                    fontWeight="600"
                    className="pointer-events-none opacity-90"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                  >
                    {metric === 'utilisation' ? `${pct(data.enrolled, data.approved_intake)}%`
                      : metric === 'reporting' ? `${pct(data.reported, data.institutions)}%`
                      : metric === 'open_cases' ? (data.open_cases > 0 ? `🚨 ${data.open_cases}` : '✅ 0')
                      : fmtNum(data.enrolled)}
                  </text>
                )}

                {/* Conflict Badge Alert Pulse */}
                {data && data.open_cases > 0 && metric !== 'open_cases' && (
                  <circle
                    cx={node.w - 4}
                    cy={4}
                    r="4"
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                )}
              </g>
            );
          })}

          {/* Map Compass / Orientation */}
          <g transform="translate(490, 480)">
            <rect width="105" height="90" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <text x="12" y="20" fontSize="9" fontWeight="bold" fill="#0f172a">
              CARTOGRAPHIC HUD
            </text>
            <text x="12" y="36" fontSize="8" fill="#64748b">
              Consensus Mesh
            </text>
            <circle cx="20" cy="52" r="3" fill="#10b981" />
            <text x="30" y="55" fontSize="8" fill="#334155">
              32 NIC Nodes
            </text>
            <circle cx="20" cy="68" r="3" fill="#3b82f6" />
            <text x="30" y="71" fontSize="8" fill="#334155">
              APH 2024-27
            </text>
          </g>
        </svg>
      </div>

      {/* Dynamic Hover Tooltip Card */}
      {hoveredState && (
        <div className="absolute top-2 left-2 z-20 bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs animate-fade-in pointer-events-none max-w-xs">
          <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5 mb-1.5">
            <span className="font-bold text-sm text-saffron">{hoveredState.state}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {pct(hoveredState.reported, hoveredState.institutions)}% reporting
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Enrolled:</span>
              <strong className="text-white font-mono">{fmtNum(hoveredState.enrolled)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Approved Ceiling:</span>
              <span className="text-slate-300 font-mono">{fmtNum(hoveredState.approved_intake)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Seat Utilisation:</span>
              <strong className="text-emerald-400 font-mono">
                {pct(hoveredState.enrolled, hoveredState.approved_intake)}%
              </strong>
            </div>
            {hoveredState.open_cases > 0 && (
              <div className="flex justify-between text-rose-400 font-bold pt-1 border-t border-slate-800">
                <span>Open Violations:</span>
                <span>{hoveredState.open_cases} Active</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-wash border border-line-soft rounded-lg text-xs">
        <span className="font-semibold text-muted">
          Active Metric: <strong className="text-navy">{metric.toUpperCase()}</strong>
        </span>
        <div className="flex items-center gap-1.5 text-[11px] text-muted font-mono">
          <span>Low</span>
          <div className="w-24 h-2.5 rounded bg-gradient-to-r from-blue-300 via-blue-600 to-navy" />
          <span>High Saturation</span>
        </div>
        <span className="text-[11px] text-muted hidden sm:inline">
          Click any state to inspect regulatory telemetry
        </span>
      </div>
    </div>
  );
}
