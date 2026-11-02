import { useRef, useState } from 'react';
import useLive from '../hooks/useLive.js';
import ZoneMap from '../components/map/ZoneMap.jsx';
import ZonePanel from '../components/map/ZonePanel.jsx';
import { PinIcon, ExpandIcon, UsersIcon, RobotIcon, AlertIcon, ShieldIcon } from '../components/icons.jsx';

const legend = [
  { key: 'workers', label: 'Workers', swatch: <i className="sw sw-worker" /> },
  { key: 'hazards', label: 'Hazard Zone', swatch: <i className="sw sw-hazard" /> },
  { key: 'alerts', label: 'Gas Alert', swatch: <i className="sw sw-alert" /> },
  { key: 'vents', label: 'Vent Shaft', swatch: <i className="sw sw-vent" /> },
  { key: 'teams', label: 'Response Team', swatch: <i className="sw sw-team" /> },
  { key: 'robots', label: 'Robots', swatch: <i className="sw sw-robot" /> }
];

export default function ZoneLayout() {
  const { data, error } = useLive();
  const [selectedId, setSelectedId] = useState(null);
  const cardRef = useRef(null);

  const toggleFullscreen = () => {
    const el = cardRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  if (!data) {
    return <div className="empty-state">{error ? error.message : 'Connecting to factory floor…'}</div>;
  }

  const { summary, zones } = data;
  const selected = zones.find((z) => z.id === selectedId) || null;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Zone Layout &amp; Occupancy</h1>
          <p className="muted">Live floor map — click a zone for occupancy, robotics and compliance detail.</p>
        </div>
        <span className="live-pill"><i /> LIVE</span>
      </div>

      <div className="kpi-strip">
        <div className="kpi"><UsersIcon /><span>Workers on floor</span><strong>{summary.workers}</strong></div>
        <div className="kpi"><RobotIcon /><span>Robot utilization</span><strong>{summary.robotUtilization}%</strong></div>
        <div className={`kpi ${summary.activeAlerts ? 'kpi-danger' : ''}`}><AlertIcon /><span>Active alerts</span><strong>{summary.activeAlerts}</strong></div>
        <div className="kpi"><ShieldIcon /><span>Compliance</span><strong>{summary.compliance}%</strong></div>
      </div>

      <section className="map-card" ref={cardRef}>
        <header className="map-head">
          <div className="map-title">
            <PinIcon />
            <strong>Live Factory Zone Map</strong>
          </div>
          <div className="map-legend">
            {legend.map((l) => (
              <span className="legend-item" key={l.key}>{l.swatch}{l.label}</span>
            ))}
          </div>
          <button className="icon-btn" title="Toggle fullscreen" onClick={toggleFullscreen}>
            <ExpandIcon />
          </button>
        </header>
        <div className="map-body">
          <ZoneMap data={data} selectedId={selectedId} onSelect={setSelectedId} />
          {selected && (
            <ZonePanel zone={selected} alerts={data.alerts} robots={data.robots} onClose={() => setSelectedId(null)} />
          )}
        </div>
      </section>
    </div>
  );
}
