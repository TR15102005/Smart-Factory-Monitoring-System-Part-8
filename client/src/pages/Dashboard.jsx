import useLive from '../hooks/useLive.js';
import StatCard from '../components/StatCard.jsx';
import { UsersIcon, RobotIcon, AlertIcon, GaugeIcon } from '../components/icons.jsx';

const statusLabel = { ok: 'Normal', busy: 'Near capacity', over: 'Over capacity', alert: 'Gas alert' };

function elapsed(ts) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  return s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ${s % 60}s ago`;
}

export default function Dashboard() {
  const { data, error } = useLive();

  if (!data) {
    return <div className="empty-state">{error ? error.message : 'Connecting to factory floor…'}</div>;
  }

  const { summary, zones, alerts, resolved } = data;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Operations Dashboard</h1>
          <p className="muted">Worker safety, robot utilization and compliance across {zones.length} factory zones.</p>
        </div>
        <span className="live-pill"><i /> LIVE</span>
      </div>

      <div className="stat-grid">
        <StatCard icon={<UsersIcon />} label="Workers on floor" value={summary.workers} sub={`across ${zones.length} monitored zones`} tone="info" />
        <StatCard icon={<RobotIcon />} label="Robot utilization" value={`${summary.robotUtilization}%`} sub={`${summary.robotsActive} of ${summary.robotsTotal} robots active`} tone="cyan" />
        <StatCard icon={<AlertIcon />} label="Active alerts" value={summary.activeAlerts} sub={summary.activeAlerts ? 'response teams dispatched' : 'no open gas alerts'} tone={summary.activeAlerts ? 'danger' : 'ok'} />
        <StatCard icon={<GaugeIcon />} label="Compliance score" value={`${summary.compliance}%`} sub="capacity & alert compliance" tone={summary.compliance >= 80 ? 'ok' : 'warn'} />
      </div>

      <div className="dash-grid">
        <section className="panel">
          <header className="panel-head"><h2>Zone occupancy</h2></header>
          <table className="zone-table">
            <thead>
              <tr><th>Zone</th><th>Occupancy</th><th>Robots</th><th>Status</th></tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id}>
                  <td>
                    <strong>{z.name}</strong>
                    <small>{z.type}</small>
                  </td>
                  <td>
                    <div className="occ-cell">
                      <div className="occ-bar"><i className={`fill-${z.status}`} style={{ width: `${Math.min(100, z.utilization)}%` }} /></div>
                      <span>{z.workers}/{z.capacity} · {z.utilization}%</span>
                    </div>
                  </td>
                  <td>{z.robots}</td>
                  <td><span className={`status-chip st-${z.status}`}>{statusLabel[z.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <header className="panel-head"><h2>Safety alerts</h2></header>
          <div className="alert-feed">
            {alerts.length === 0 && <p className="muted pad">No active alerts. All zones within safe limits.</p>}
            {alerts.map((a) => (
              <div key={a.id} className={`alert-item sev-${a.severity}`}>
                <span className="alert-dot" />
                <div>
                  <strong>{a.message}</strong>
                  <small>{zones.find((z) => z.id === a.zoneId)?.name} · {a.severity} severity · {elapsed(a.startedAt)}</small>
                </div>
              </div>
            ))}
            {resolved.length > 0 && <h3 className="feed-sub">Recently resolved</h3>}
            {resolved.map((a) => (
              <div key={a.id} className="alert-item resolved">
                <span className="alert-dot" />
                <div>
                  <strong>{a.message}</strong>
                  <small>{zones.find((z) => z.id === a.zoneId)?.name} · resolved {elapsed(a.resolvedAt)}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
