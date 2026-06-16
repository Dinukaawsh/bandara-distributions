'use client';

export type DonutSlice = {
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  slices: DonutSlice[];
  centerLabel?: string;
  centerValue?: string;
  formatValue?: (value: number) => string;
};

const CHART_COLORS = ['#1d4ed8', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#4f46e5'];

export function DonutChart({
  slices,
  centerLabel,
  centerValue,
  formatValue = (v) => String(v),
}: DonutChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const radius = 72;
  const stroke = 22;
  const size = 200;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  if (total <= 0) {
    return <p className="py-10 text-center text-sm text-slate-500">No data</p>;
  }

  let offset = 0;
  const segments = slices
    .filter((slice) => slice.value > 0)
    .map((slice, index) => {
      const fraction = slice.value / total;
      const length = fraction * circumference;
      const dasharray = `${length} ${circumference - length}`;
      const dashoffset = -offset;
      offset += length;
      return {
        ...slice,
        dasharray,
        dashoffset,
        color: slice.color || CHART_COLORS[index % CHART_COLORS.length],
        percent: Math.round(fraction * 100),
      };
    });

  return (
    <div className="dashboard-donut-layout">
      <div className="dashboard-donut-chart">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={stroke}
          />
          {segments.map((segment) => (
            <circle
              key={segment.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={stroke}
              strokeDasharray={segment.dasharray}
              strokeDashoffset={segment.dashoffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${center} ${center})`}
            >
              <title>{`${segment.label}: ${formatValue(segment.value)} (${segment.percent}%)`}</title>
            </circle>
          ))}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="dashboard-donut-center">
            {centerValue && <p className="dashboard-donut-center-value">{centerValue}</p>}
            {centerLabel && <p className="dashboard-donut-center-label label-si">{centerLabel}</p>}
          </div>
        )}
      </div>

      <div className="dashboard-donut-legend">
        {segments.map((segment) => (
          <div key={segment.label} className="dashboard-donut-legend-row">
            <span className="dashboard-chart-legend-dot" style={{ backgroundColor: segment.color }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 label-si">{segment.label}</p>
              <p className="text-xs text-slate-500">
                {formatValue(segment.value)} · {segment.percent}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
