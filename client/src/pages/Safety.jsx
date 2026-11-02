import { useState } from 'react';
import { api } from '../api/client.js';
import useFetch from '../hooks/useFetch.js';
import { PageHead, Panel, Chip, Modal, Field, Toolbar, Select } from '../components/ui.jsx';
import { PlusIcon } from '../components/icons.jsx';
import { BarChart } from '../components/charts/Charts.jsx';
import { ZONES, zoneName, titleCase, relTime } from '../lib/format.js';

const severityChip = (s) => ({ HIGH: 'over', MEDIUM: 'busy', LOW: 'ok' }[s] || 'busy');
const statusChip = (s) => (s === 'OPEN' ? 'over' : 'ok');

export default function Safety() {
  const { data, loading, reload } = useFetch(async () => {
    const [list, stats] = await Promise.all([api.incidents(), api.incidentStats()]);
    return { ...list, stats };
  });
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ zone: 'assembly', type: 'near miss', severity: 'MEDIUM', description: '' });

  const incidents = data?.incidents || [];
  const meta = data?.meta || { openHigh: 0, openTotal: 0 };

  const rows = incidents.filter((i) => (!status || i.status === status) && (!severity || i.severity === severity));
  const byZone = Object.entries(data?.stats?.byZone || {}).map(([zone, value]) => ({ label: zoneName(zone).split(' ')[0], value }));

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.description.trim()) { setErr('A description is required.'); return; }
    setErr(''); setBusy(true);
    try {
      await api.reportIncident(form);
      setOpen(false);
      setForm({ zone: 'assembly', type: 'near miss', severity: 'MEDIUM', description: '' });
      reload();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const resolve = async (id) => {
    await api.resolveIncident(id);
    reload();
  };

  return (
    <div className="page">
      <PageHead title="Safety Monitoring" subtitle="Incident feed, severity triage and resolution tracking.">
        <button className="btn btn-primary" onClick={() => setOpen(true)}><PlusIcon /> Report Incident</button>
      </PageHead>

      <div className="mini-stats">
        <div className="mini danger"><span>High severity open</span><strong>{meta.openHigh}</strong></div>
        <div className="mini warn"><span>Total open</span><strong>{meta.openTotal}</strong></div>
        <div className="mini"><span>Logged incidents</span><strong>{incidents.length}</strong></div>
      </div>

      <div className="split-2">
        <Panel title="Incident feed" className="feed-panel">
          <Toolbar>
            <Select value={status} onChange={setStatus} placeholder="All statuses" options={['OPEN', 'RESOLVED']} />
            <Select value={severity} onChange={setSeverity} placeholder="All severities" options={['HIGH', 'MEDIUM', 'LOW']} />
            <span className="toolbar-count">{rows.length} shown</span>
          </Toolbar>
          <div className="incident-feed">
            {loading && !data && <p className="td-muted pad16">Loading…</p>}
            {!loading && rows.length === 0 && <p className="td-muted pad16">No incidents match the filters.</p>}
            {rows.map((i) => (
              <article key={i.id} className={`incident sev-${i.severity.toLowerCase()} ${i.status === 'RESOLVED' ? 'resolved' : ''}`}>
                <div className="incident-top">
                  <Chip tone={severityChip(i.severity)}>{i.severity}</Chip>
                  <Chip tone={statusChip(i.status)}>{titleCase(i.status)}</Chip>
                  <span className="incident-id">{i.incidentId}</span>
                </div>
                <p className="incident-desc">{i.description}</p>
                <div className="incident-meta">
                  <span>{zoneName(i.zone)}</span>
                  <span>·</span>
                  <span>{i.status === 'RESOLVED' ? `resolved ${relTime(i.resolvedAt)}` : relTime(i.createdAt)}</span>
                  {i.status === 'OPEN' && (
                    <button className="btn btn-ghost xs" onClick={() => resolve(i.id)}>Mark Resolved</button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <div className="stack">
          <Panel title="7-Day incidents by zone">
            <div className="pad16">
              {byZone.length ? <BarChart data={byZone} height={220} color="#f59e0b" /> : <p className="td-muted">No incidents in the last 7 days.</p>}
            </div>
          </Panel>
        </div>
      </div>

      <Modal
        open={open}
        title="Report Incident"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={busy} onClick={submit}>{busy ? 'Reporting…' : 'Report Incident'}</button>
          </>
        }
      >
        <div className="form-grid">
          <Field label="Zone">
            <select className="select" value={form.zone} onChange={set('zone')}>
              {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </Field>
          <Field label="Type">
            <select className="select" value={form.type} onChange={set('type')}>
              {['near miss', 'e-stop triggered', 'abnormal condition', 'comm timeout', 'reported'].map((t) => <option key={t} value={t}>{titleCase(t)}</option>)}
            </select>
          </Field>
          <Field label="Severity">
            <select className="select" value={form.severity} onChange={set('severity')}>
              <option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option>
            </select>
          </Field>
          <div className="span-2">
            <Field label="What happened?">
              <textarea className="input textarea" rows="3" value={form.description} onChange={set('description')} placeholder="Describe the incident, affected asset and immediate action taken." />
            </Field>
          </div>
        </div>
        {err && <div className="form-error">{err}</div>}
      </Modal>
    </div>
  );
}
