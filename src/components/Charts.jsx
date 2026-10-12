import React, { useState } from 'react';

// ─────────────────────────────────────────────────────────────
// 1. INTERACTIVE DONUT / PIE CHART COMPONENT
// ─────────────────────────────────────────────────────────────
export function DonutPieChart({ data = [], title = 'Distribution', centerValue = '', centerLabel = '' }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = data.reduce((acc, curr) => acc + (curr.count || 0), 0) || 1;
  const size = 220;
  const center = size / 2;
  const radius = 78;
  const strokeWidth = 32;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#083058] text-base tracking-tight">{title}</h3>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dynamic Breakdown</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
        {/* SVG Donut */}
        <div className="relative w-[180px] h-[180px] shrink-0 flex items-center justify-center">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Slices */}
            {data.map((item, idx) => {
              const fraction = item.count / total;
              const strokeDasharray = `${fraction * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              accumulatedPercent += fraction;

              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={item.color || '#00839a'}
                  strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center Text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            {hoveredIdx !== null && data[hoveredIdx] ? (
              <>
                <span className="text-xl font-black text-[#083058] leading-tight">
                  {data[hoveredIdx].percentage}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 truncate max-w-[90px]">
                  {data[hoveredIdx].name}
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-black text-[#083058] leading-tight">
                  {centerValue || total}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {centerLabel || 'Total'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2.5 flex-1 min-w-0 w-full">
          {data.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer text-xs ${
                  isHovered ? 'bg-slate-50 font-bold scale-[1.02]' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color || '#00839a' }}
                  />
                  <span className="text-slate-700 truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-400 text-[11px] font-normal">{item.count}</span>
                  <span className="font-bold text-[#083058]">{item.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. SMOOTH AREA / TREND GRAPH COMPONENT
// ─────────────────────────────────────────────────────────────
export function AreaTrendChart({ data = [], title = 'Revenue & Bookings Trend' }) {
  const [metric, setMetric] = useState('revenue'); // 'revenue' or 'bookings'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (data.length === 0) return null;

  const width = 640;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const values = data.map(d => metric === 'revenue' ? d.revenue : d.bookings);
  const maxVal = Math.max(...values, 10);
  const minVal = 0;

  // Calculate coordinates
  const points = data.map((d, i) => {
    const val = metric === 'revenue' ? d.revenue : d.bookings;
    const x = paddingX + (i / (data.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((val - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);
    return { x, y, ...d, value: val };
  });

  // Build SVG path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    pathD += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  // Closed area path for gradient
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
      {/* Header with Metric Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-[#083058] text-base tracking-tight">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Month-on-month trajectory &amp; consultation growth</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              metric === 'revenue' ? 'bg-white text-[#083058] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Gross Revenue (₹)
          </button>
          <button
            onClick={() => setMetric('bookings')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              metric === 'bookings' ? 'bg-white text-[#00839a] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Total Bookings
          </button>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00839a" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00839a" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#083058" />
              <stop offset="100%" stopColor="#00839a" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, idx) => {
            const y = height - paddingY - pct * (height - 2 * paddingY);
            const gridVal = Math.round(minVal + pct * (maxVal - minVal));
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-semibold"
                >
                  {metric === 'revenue' ? `₹${(gridVal / 1000).toFixed(0)}k` : gridVal}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Stroke Line */}
          <path
            d={pathD}
            fill="transparent"
            stroke="url(#lineGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint?.label === pt.label ? '6' : '4'}
                fill="#ffffff"
                stroke="#00839a"
                strokeWidth={hoveredPoint?.label === pt.label ? '3.5' : '2.5'}
                className="transition-all duration-200"
              />
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className="text-[11px] fill-slate-500 font-bold"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute bg-[#083058] text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 8}%`
            }}
          >
            <p className="text-[10px] text-slate-300 font-normal">{hoveredPoint.label} Performance</p>
            <p className="font-bold text-sm">
              {metric === 'revenue' ? `₹${hoveredPoint.value.toLocaleString()}` : `${hoveredPoint.value} Sessions`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. BAR PERFORMANCE / COMPARISON CHART COMPONENT
// ─────────────────────────────────────────────────────────────
export function BarPerformanceChart({ data = [], title = 'Therapist Session Volumes' }) {
  const maxSessions = Math.max(...data.map(d => d.sessions || 0), 100);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-[#083058] text-base tracking-tight">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Completed sessions by top practitioners</p>
        </div>
        <span className="text-xs font-bold text-[#00839a] bg-[#00839a]/10 px-2.5 py-1 rounded-lg">
          Verified Experts
        </span>
      </div>

      <div className="space-y-4 my-2">
        {data.map((item, idx) => {
          const percentage = Math.round((item.sessions / maxSessions) * 100);
          return (
            <div key={idx} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 group-hover:text-[#00839a] transition-colors">{item.name}</span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">({item.title})</span>
                </div>
                <div className="flex items-center gap-3 font-semibold">
                  <span className="text-amber-500 font-bold">★ {item.rating}</span>
                  <span className="text-[#083058] font-bold">{item.sessions} sessions</span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#083058] to-[#00839a]"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
