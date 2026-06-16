'use client';

type LineChartProps = {
  labels: string[];
  values: number[];
  color?: string;
  fillColor?: string;
  formatValue?: (value: number) => string;
  height?: number;
};

function niceMax(value: number) {
  if (value <= 0) return 1000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

export function LineChart({
  labels,
  values,
  color = '#1d4ed8',
  fillColor = 'rgba(29, 78, 216, 0.12)',
  formatValue = (v) => String(v),
  height = 240,
}: LineChartProps) {
  const chartWidth = 640;
  const chartHeight = height;
  const padLeft = 56;
  const padRight = 12;
  const padTop = 16;
  const padBottom = 44;
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;
  const maxValue = niceMax(Math.max(...values, 0));
  const count = values.length;

  if (count === 0) {
    return <p className="py-10 text-center text-sm text-slate-500">No data</p>;
  }

  const points = values.map((value, index) => {
    const x = padLeft + (count === 1 ? innerW / 2 : (index / (count - 1)) * innerW);
    const y = padTop + innerH - (maxValue > 0 ? (value / maxValue) * innerH : 0);
    return { x, y, value, label: labels[index] || '' };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padTop + innerH} L ${points[0].x} ${padTop + innerH} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: padTop + innerH - t * innerH,
    value: maxValue * t,
  }));

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

        <path d={areaPath} fill={fillColor} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, index) => (
          <g key={`${p.label}-${index}`}>
            <circle cx={p.x} cy={p.y} r={5} fill="#fff" stroke={color} strokeWidth={3}>
              <title>{`${p.label}: ${formatValue(p.value)}`}</title>
            </circle>
            <text x={p.x} y={chartHeight - 14} textAnchor="middle" className="dashboard-chart-axis">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
