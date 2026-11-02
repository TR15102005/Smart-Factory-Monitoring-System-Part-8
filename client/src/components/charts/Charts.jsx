const C = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#38bdf8',
  grid: '#1c2836',
  axis: '#64748b',
  text: '#9fb3c8'
};

function niceMax(v) {
  if (v <= 0) return 4;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / mag) * mag;
}

/* Vertical bars */
export function BarChart({ data = [], height = 200, color = '#38bdf8', unit = '' }) {
  const W = Math.max(360, data.length * 58);
  const padL = 30, padB = 24, padT = 10;
  const max = niceMax(Math.max(...data.map((d) => d.value), 1));
  const bw = (W - padL) / data.length;
  return (
    <div className="chart-scroll">
      <svg viewBox={`0 0 ${W} ${height}`} className="chart" preserveAspectRatio="none" style={{ height }}>
        {[0, 0.5, 1].map((t) => {
          const y = padT + (height - padT - padB) * t;
          return <line key={t} x1={padL} x2={W} y1={y} y2={y} stroke={C.grid} strokeWidth="1" />;
        })}
        {data.map((d, i) => {
          const h = ((height - padT - padB) * d.value) / max;
          const x = padL + i * bw + bw * 0.18;
          const y = height - padB - h;
          return (
            <g key={d.label + i}>
              <rect x={x} y={y} width={bw * 0.64} height={Math.max(1, h)} rx="3" fill={color} opacity="0.9">
                <title>{`${d.label}: ${d.value}${unit}`}</title>
              </rect>
              <text x={x + bw * 0.32} y={height - 8} textAnchor="middle" fontSize="9.5" fill={C.axis}>{d.label}</text>
            </g>
          );
        })}
        <text x={4} y={padT + 6} fontSize="9" fill={C.axis}>{max}</text>
      </svg>
    </div>
  );
}

/* Horizontal bars */
export function HBarChart({ data = [], color = '#22d3ee', unit = '' }) {
  const max = niceMax(Math.max(...data.map((d) => d.value), 1));
  return (
    <div className="hbar-chart">
      {data.map((d) => (
        <div className="hbar-row" key={d.label}>
          <span className="hbar-label" title={d.label}>{d.label}</span>
          <div className="hbar-track">
            <i style={{ width: `${(d.value / max) * 100}%`, background: color }} />
          </div>
          <span className="hbar-val">{d.value}{unit}</span>
        </div>
      ))}
    </div>
  );
}

/* Donut */
export function Donut({ data = [], size = 168, thickness = 20, centerLabel, centerValue }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="donut">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#16212e" strokeWidth={thickness} />
        {data.map((d) => {
          const frac = d.value / total;
          const dash = frac * circ;
          const el = (
            <circle
              key={d.label}
              cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={d.color} strokeWidth={thickness}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </circle>
          );
          offset += dash;
          return el;
        })}
        {centerValue != null && (
          <text x="50%" y="47%" textAnchor="middle" fontSize="24" fontWeight="700" fill="#e2e8f0">{centerValue}</text>
        )}
        {centerLabel && (
          <text x="50%" y="62%" textAnchor="middle" fontSize="11" fill={C.axis}>{centerLabel}</text>
        )}
      </svg>
      <ul className="donut-legend">
        {data.map((d) => (
          <li key={d.label}>
            <span className="dot" style={{ background: d.color }} />
            {d.label}
            <b>{d.value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Line + area */
export function LineArea({ data = [], height = 200, color = '#38bdf8', unit = '' }) {
  const W = Math.max(320, data.length * 38);
  const padL = 30, padB = 22, padT = 12;
  const max = niceMax(Math.max(...data.map((d) => d.value), 1));
  const stepX = (W - padL) / Math.max(1, data.length - 1);
  const px = (i) => padL + i * stepX;
  const py = (v) => padT + (height - padT - padB) * (1 - v / max);
  const line = data.map((d, i) => `${px(i)},${py(d.value)}`).join(' ');
  const area = `${padL},${height - padB} ${line} ${px(data.length - 1)},${height - padB}`;
  const gid = `grad-${color.replace('#', '')}`;
  return (
    <div className="chart-scroll">
      <svg viewBox={`0 0 ${W} ${height}`} className="chart" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((t) => {
          const y = padT + (height - padT - padB) * t;
          return <line key={t} x1={padL} x2={W} y1={y} y2={y} stroke={C.grid} strokeWidth="1" />;
        })}
        <polygon points={area} fill={`url(#${gid})`} />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <circle key={i} cx={px(i)} cy={py(d.value)} r="2.6" fill={color}>
            <title>{`${d.label}: ${d.value}${unit}`}</title>
          </circle>
        ))}
        {data.map((d, i) => (
          i % Math.ceil(data.length / 7) === 0 &&
          <text key={`t${i}`} x={px(i)} y={height - 7} textAnchor="middle" fontSize="10" fill={C.axis}>{d.label}</text>
        ))}
        <text x={4} y={padT + 4} fontSize="9" fill={C.axis}>{max}</text>
      </svg>
    </div>
  );
}

/* Stacked bars by severity */
export function StackedBars({ data = [], keys = ['HIGH', 'MEDIUM', 'LOW'], height = 210 }) {
  const W = Math.max(340, data.length * 34);
  const padL = 28, padB = 22, padT = 10;
  const totals = data.map((d) => keys.reduce((s, k) => s + (d[k] || 0), 0));
  const max = niceMax(Math.max(...totals, 1));
  const bw = (W - padL) / data.length;
  return (
    <div className="chart-scroll">
      <svg viewBox={`0 0 ${W} ${height}`} className="chart" preserveAspectRatio="none" style={{ height }}>
        {[0, 0.5, 1].map((t) => {
          const y = padT + (height - padT - padB) * t;
          return <line key={t} x1={padL} x2={W} y1={y} y2={y} stroke={C.grid} strokeWidth="1" />;
        })}
        {data.map((d, i) => {
          const x = padL + i * bw + bw * 0.2;
          let acc = 0;
          return (
            <g key={d.label + i}>
              {keys.map((k) => {
                const v = d[k] || 0;
                if (!v) return null;
                const h = ((height - padT - padB) * v) / max;
                const y = height - padB - ((height - padT - padB) * acc) / max - h;
                acc += v;
                return <rect key={k} x={x} y={y} width={bw * 0.6} height={Math.max(1, h)} fill={C[k]} opacity="0.92"><title>{`${d.label} ${k}: ${v}`}</title></rect>;
              })}
              <text x={x + bw * 0.3} y={height - 7} textAnchor="middle" fontSize="9" fill={C.axis}>{d.label}</text>
            </g>
          );
        })}
        <text x={4} y={padT + 6} fontSize="9" fill={C.axis}>{max}</text>
      </svg>
      <div className="chart-legend">
        {keys.map((k) => (
          <span key={k} className="legend-item"><i className="sw" style={{ background: C[k] }} />{k}</span>
        ))}
      </div>
    </div>
  );
}
