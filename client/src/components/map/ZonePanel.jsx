const statusLabel = { ok: 'Normal', busy: 'Near capacity', over: 'Over capacity', alert: 'Gas alert' };
const statusNote = {
  ok: 'Within safe operating limits.',
  busy: 'Near capacity — monitor entry flow.',
  over: 'Over capacity — restrict entry and rebalance staff.',
  alert: 'Active gas alert — response team dispatched.'
};

export default function ZonePanel({ zone, alerts, robots, onClose }) {
  const zoneAlerts = alerts.filter((a) => a.zoneId === zone.id);
  const zoneRobots = robots.filter((r) => r.zone === zone.id);
  const robotStates = zoneRobots.reduce((acc, r) => ({ ...acc, [r.state]: (acc[r.state] || 0) + 1 }), {});

  return (
    <aside className="zone-panel">
      <header>
        <div>
          <h3>{zone.name}</h3>
          <span className={`status-chip st-${zone.status}`}>{statusLabel[zone.status]}</span>
        </div>
        <button className="icon-btn" title="Close" onClick={onClose}>✕</button>
      </header>

      <div className="panel-metric">
        <div className="metric-row">
          <span>Occupancy</span>
          <strong>{zone.workers} / {zone.capacity}</strong>
        </div>
        <div className="occ-bar big">
          <i className={`fill-${zone.status}`} style={{ width: `${Math.min(100, zone.utilization)}%` }} />
        </div>
        <small>{zone.utilization}% of safe capacity · {zone.type} zone</small>
      </div>

      <div className="panel-metric">
        <div className="metric-row">
          <span>Robots in zone</span>
          <strong>{zoneRobots.length}</strong>
        </div>
        <div className="chip-row">
          {zoneRobots.length === 0 && <small className="muted">No robots assigned right now</small>}
          {Object.entries(robotStates).map(([state, count]) => (
            <span key={state} className={`robot-chip rs-${state}`}>{state} × {count}</span>
          ))}
        </div>
      </div>

      <div className="panel-metric">
        <div className="metric-row">
          <span>Safety alerts</span>
          <strong>{zoneAlerts.length}</strong>
        </div>
        {zoneAlerts.length === 0 ? (
          <small className="muted">No open alerts in this zone.</small>
        ) : (
          zoneAlerts.map((a) => (
            <div key={a.id} className={`alert-item sev-${a.severity}`}>
              <span className="alert-dot" />
              <div><strong>{a.message}</strong><small>{a.severity} severity</small></div>
            </div>
          ))
        )}
      </div>

      <p className={`zone-note note-${zone.status}`}>{statusNote[zone.status]}</p>
    </aside>
  );
}
