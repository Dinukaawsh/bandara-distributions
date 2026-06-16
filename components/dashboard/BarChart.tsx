'use client';

type BarSeries = {
  label: string;
  color: string;
  values: number[];
};

type BarChartProps = {
  labels: string[];
  series: BarSeries[];
  formatValue?: (value: number) => string;
  height?: number;
};

function niceMax(value: number) {
  if (value <= 0) return 1000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

export function BarChart({ labels, series, formatValue = (v) => String(v), height = 260 }: BarChartProps) {
  const allValues = series.flatMap((s) => s.values);
  const maxValue = niceMax(Math.max(...allValues, 0));
  const chartWidth = 640;
  const chartHeight = height;
  const padLeft = 56;
  const padRight = 12;
  const padTop = 16;
  const padBottom = 44;
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;
  const groupCount = labels.length;
  const seriesCount = Math.max(series.length, 1);
  const groupWidth = groupCount > 0 ? innerW / groupCount : innerW;
  const barGap = 6;
  const barWidth = Math.max(8, (groupWidth - barGap * (seriesCount + 1)) / seriesCount);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: padTop + innerH - t * innerH,
    value: maxValue * t,
  }));

  if (groupCount === 0) {
    return <p className="py-10 text-center text-sm text-slate-500">No data</p>;
  }

  return (
    <div className="dashboard-chart-wrap">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="dashboard-chart-svg" role="img">
        {yTicks.map((tick) => (
          <g key={tick.value}>
            <line x1={padLeft} y1={tick.y} x2={chartWidth - padRight} y2={tick.y} className="dashboard-chart-grid" />
            <text x={padLeft - 8} y={tick.y + 4} textAnchor="end" className="dashboard-chart-axis">
              {formatValue(tick.value)}
            </text>
          </g>
        ))}

        {labels.map((label, groupIndex) => {
          const groupX = padLeft + groupIndex * groupWidth;
          return (
            <g key={`${label}-${groupIndex}`}>
              {series.map((s, seriesIndex) => {
                const value = s.values[groupIndex] || 0;
                const barH = maxValue > 0 ? (value / maxValue) * innerH : 0;
                const x = groupX + barGap + seriesIndex * (barWidth + barGap);
                const y = padTop + innerH - barH;
                return (
                  <rect
                    key={`${s.label}-${seriesIndex}`}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(barH, value > 0 ? 2 : 0)}
                    rx={4}
                    fill={s.color}
                    className="dashboard-chart-bar"
                  >
                    <title>{`${label} · ${s.label}: ${formatValue(value)}`}</title>
                  </rect>
                );
              })}
              <text
                x={groupX + groupWidth / 2}
                y={chartHeight - 14}
                textAnchor="middle"
                className="dashboard-chart-axis"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="dashboard-chart-legend">
        {series.map((s) => (
          <span key={s.label} className="dashboard-chart-legend-item">
            <span className="dashboard-chart-legend-dot" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
