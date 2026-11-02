import { useState } from 'react';
import { LayersIcon, PlusIcon, MinusIcon, TargetIcon } from '../icons.jsx';

const DEFAULT_LAYERS = { workers: true, robots: true, hazards: true, alerts: true, vents: true, teams: true };

const layerLabels = {
  workers: 'Workers',
  robots: 'Robots',
  hazards: 'Hazard zones',
  alerts: 'Gas alerts',
  vents: 'Vent shafts',
  teams: 'Response teams'
};

export default function ZoneMap({ data, selectedId, onSelect }) {
  const [view, setView] = useState({ s: 1, cx: 500, cy: 260 });
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [layersOpen, setLayersOpen] = useState(false);

  const zoom = (factor) => {
    setView((v) => {
      const s = Math.min(2.6, Math.max(1, v.s * factor));
      return s === 1 ? { s: 1, cx: 500, cy: 260 } : { ...v, s };
    });
  };

  const { s, cx, cy } = view;
  const viewBox = `${cx - 500 / s} ${cy - 260 / s} ${1000 / s} ${520 / s}`;

  return (
    <div className="map-stage">
      <svg className="factory-svg" viewBox={viewBox} role="img" aria-label="Live factory zone map">
        <defs>
          <pattern id="floorgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#15202d" strokeWidth="1" />
          </pattern>
          <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#ef4444" strokeWidth="2" />
          </pattern>
        </defs>

        <rect x="0" y="0" width="1000" height="520" fill="#0b111b" />
        <rect x="0" y="0" width="1000" height="520" fill="url(#floorgrid)" opacity="0.6" />

        <g className="corridors">
          {data.corridors.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>

        <g className="zones">
          {data.zones.map((z) => (
            <g
              key={z.id}
              className={`zone zone-${z.status} ${selectedId === z.id ? 'selected' : ''}`}
              onClick={() => onSelect(selectedId === z.id ? null : z.id)}
            >
              <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="10" />
              <text className="zone-name" x={z.x + 12} y={z.y + 22}>{z.name}</text>
              <g className="zone-chip" transform={`translate(${z.x + z.w - 66}, ${z.y + 10})`}>
                <rect width="56" height="18" rx="9" />
                <text x="28" y="13">{z.workers}/{z.capacity}</text>
              </g>
            </g>
          ))}
        </g>

        {layers.hazards && (
          <g className="hazards">
            {data.hazards.map((h) => (
              <path key={h.id} d={h.path} />
            ))}
          </g>
        )}

        {layers.vents && (
          <g className="vents">
            {data.vents.map((v) => (
              <g key={v.id} transform={`translate(${v.x}, ${v.y})`}>
                <circle r="10" className="vent-ring" />
                <g className="fan">
                  <path d="M0,-7 C3,-3 3,-1 0,0 C-3,-1 -3,-3 0,-7 Z" />
                  <path d="M0,-7 C3,-3 3,-1 0,0 C-3,-1 -3,-3 0,-7 Z" transform="rotate(120)" />
                  <path d="M0,-7 C3,-3 3,-1 0,0 C-3,-1 -3,-3 0,-7 Z" transform="rotate(240)" />
                </g>
                <circle r="1.6" className="vent-hub" />
              </g>
            ))}
          </g>
        )}

        {layers.teams && (
          <g className="teams">
            {data.teams.map((t) => (
              <g key={t.id} className={`team ${t.status}`} style={{ transform: `translate(${t.x}px, ${t.y}px)` }}>
                <path d="M0,-10 C7,-8 9,-7 9,-3 C9,4 5,9 0,11 C-5,9 -9,4 -9,-3 C-9,-7 -7,-8 0,-10 Z" />
                <path d="M0,-4 V4 M-4,0 H4" className="team-cross" />
              </g>
            ))}
          </g>
        )}

        {layers.robots && (
          <g className="robots">
            {data.robots.map((r) => (
              <g key={r.id} className={`entity robot robot-${r.state}`} style={{ transform: `translate(${r.x}px, ${r.y}px)` }}>
                <rect x="-6" y="-5" width="12" height="10" rx="2.5" />
                <line x1="0" y1="-5" x2="0" y2="-8" />
                <circle cx="0" cy="-8.6" r="1.1" />
                <circle cx="-2.4" cy="-1" r="1" className="robot-eye" />
                <circle cx="2.4" cy="-1" r="1" className="robot-eye" />
              </g>
            ))}
          </g>
        )}

        {layers.workers && (
          <g className="workers">
            {data.workers.map((w) => (
              <g key={w.id} className="entity worker" style={{ transform: `translate(${w.x}px, ${w.y}px)` }}>
                <circle r="4.5" />
              </g>
            ))}
          </g>
        )}

        {layers.alerts && (
          <g className="alerts">
            {data.alerts.map((a) => (
              <g key={a.id} className={`alert-marker sev-${a.severity}`} transform={`translate(${a.x}, ${a.y})`}>
                <circle r="14" className="alert-halo" />
                <path d="M0,-11 L10,7 L-10,7 Z" />
                <text y="5">!</text>
              </g>
            ))}
          </g>
        )}
      </svg>

      <div className="map-controls">
        <div className="ctrl-wrap">
          <button className="ctrl-btn" title="Map layers" onClick={() => setLayersOpen((o) => !o)}>
            <LayersIcon />
          </button>
          {layersOpen && (
            <div className="layers-pop">
              {Object.keys(DEFAULT_LAYERS).map((key) => (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={layers[key]}
                    onChange={() => setLayers((l) => ({ ...l, [key]: !l[key] }))}
                  />
                  {layerLabels[key]}
                </label>
              ))}
            </div>
          )}
        </div>
        <button className="ctrl-btn" title="Zoom in" onClick={() => zoom(1.25)}><PlusIcon /></button>
        <button className="ctrl-btn" title="Zoom out" onClick={() => zoom(1 / 1.25)}><MinusIcon /></button>
        <button className="ctrl-btn" title="Reset view" onClick={() => setView({ s: 1, cx: 500, cy: 260 })}><TargetIcon /></button>
      </div>

      <div className="map-compass">
        <svg viewBox="0 0 40 40" width="40" height="40">
          <circle cx="20" cy="20" r="17" className="compass-ring" />
          <path d="M20 8 L24 24 L20 20 L16 24 Z" className="compass-needle" />
          <text x="20" y="6" className="compass-n">N</text>
        </svg>
        <div className="scale-bar">
          <span>100 m</span>
          <i />
        </div>
      </div>
    </div>
  );
}
