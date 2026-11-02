import { api } from '../api/client.js';
import useFetch from '../hooks/useFetch.js';
import { PageHead, Panel, Chip } from '../components/ui.jsx';
import { zoneName, fmtDate } from '../lib/format.js';

const stdTone = (s) => (s === 'PASSED' ? 'ok' : 'busy');
const certTone = (s) => ({ VALID: 'ok', EXPIRING: 'busy', EXPIRED: 'over' }[s] || 'busy');

export default function Compliance() {
  const { data, loading } = useFetch(() => api.compliance());

  if (loading && !data) return <div className="empty-state">Loading compliance data…</div>;
  if (!data) return <div className="empty-state">No compliance data.</div>;

  const { standards, certifications, zoneSnapshot } = data;
  const overall = Math.round(
    (standards.reduce((s, x) => s + x.met, 0) / standards.reduce((s, x) => s + x.total, 0)) * 100
  );
  const expired = certifications.filter((c) => c.status === 'EXPIRED').length;
  const expiring = certifications.filter((c) => c.status === 'EXPIRING').length;

  return (
    <div className="page">
      <PageHead title="Standards & Compliance" subtitle="Audit status against robot-safety standards and worker certification health." />

      <div className="mini-stats">
        <div className="mini"><span>Overall compliance</span><strong className="txt-ok">{overall}%</strong></div>
        <div className="mini danger"><span>Expired certs</span><strong>{expired}</strong></div>
        <div className="mini warn"><span>Expiring ≤30 days</span><strong>{expiring}</strong></div>
        <div className="mini"><span>Standards tracked</span><strong>{standards.length}</strong></div>
      </div>

      <Panel title="Standards audits">
        <div className="std-grid">
          {standards.map((s) => {
            const pct = Math.round((s.met / s.total) * 100);
            return (
              <div className="std-card" key={s.code}>
                <div className="std-top">
                  <strong>{s.code}</strong>
                  <Chip tone={stdTone(s.status)}>{s.status}</Chip>
                </div>
                <p className="muted">{s.title}</p>
                <div className="std-meter">
                  <div className="occ-bar big"><i className={pct === 100 ? 'fill-ok' : 'fill-busy'} style={{ width: `${pct}%` }} /></div>
                  <span>{s.met}/{s.total} checks · {pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid-2">
        <Panel title="Worker certifications">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Worker</th><th>Certification</th><th>Expires</th><th>Status</th></tr></thead>
              <tbody>
                {certifications.map((c, i) => (
                  <tr key={`${c.workerName}-${i}`}>
                    <td><strong>{c.workerName}</strong><small>{c.role}</small></td>
                    <td>{c.certification}</td>
                    <td>{fmtDate(c.expiresAt)}<small>{c.days < 0 ? `${Math.abs(c.days)}d overdue` : `in ${c.days}d`}</small></td>
                    <td><Chip tone={certTone(c.status)}>{c.status}</Chip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Zone compliance snapshot">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Zone</th><th>Applicable standards</th></tr></thead>
              <tbody>
                {zoneSnapshot.map((z) => (
                  <tr key={z.zone}>
                    <td><strong>{zoneName(z.zone)}</strong></td>
                    <td>
                      <div className="chip-row">
                        {z.items.map((it, i) => (
                          <span key={i} className={`std-pill ${it.status === 'PASSED' ? 'ok' : 'warn'}`}>
                            {it.code}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
