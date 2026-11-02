import { useMemo, useState } from 'react';
import { api } from '../api/client.js';
import useFetch from '../hooks/useFetch.js';
import { PageHead, Panel, Chip, Modal, Field, Toolbar, Select } from '../components/ui.jsx';
import { PlusIcon } from '../components/icons.jsx';
import { ZONES, zoneName, titleCase } from '../lib/format.js';

const STATUS_TONE = { RUNNING: 'ok', IDLE: 'busy', CHARGING: 'busy', MAINTENANCE: 'over' };

function Battery({ level }) {
  const tone = level < 20 ? 'fill-alert' : level < 45 ? 'fill-busy' : 'fill-ok';
  return (
    <div className="batt">
      <div className="batt-track"><i className={tone} style={{ width: `${Math.max(3, level)}%` }} /></div>
      <span>{Math.round(level)}%</span>
    </div>
  );
}

export default function Robots() {
  const { data, loading, reload } = useFetch(() => api.robots());
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [zone, setZone] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ name: '', model: 'Cobot', zone: 'assembly', workstation: '' });

  const robots = data?.robots || [];

  const rows = useMemo(() => robots.filter((r) => {
    const hay = `${r.robotId} ${r.name} ${r.model}`.toLowerCase();
    const st = r.liveStatus || r.status;
    return (!q || hay.includes(q.toLowerCase()))
      && (!status || st === status)
      && (!zone || (r.liveZone || r.zone) === zone);
  }), [robots, q, status, zone]);

  const counts = useMemo(() => ({
    total: robots.length,
    running: robots.filter((r) => (r.liveStatus || r.status) === 'RUNNING').length,
    avgBatt: robots.length ? Math.round(robots.reduce((s, r) => s + (r.battery || 0), 0) / robots.length) : 0
  }), [robots]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setErr(''); setBusy(true);
    try {
      await api.addRobot(form);
      setOpen(false);
      setForm({ name: '', model: 'Cobot', zone: 'assembly', workstation: '' });
      reload();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="page">
      <PageHead title="Robots" subtitle="Fleet status, battery health and live task assignment.">
        <button className="btn btn-primary" onClick={() => setOpen(true)}><PlusIcon /> Add Robot</button>
      </PageHead>

      <div className="mini-stats">
        <div className="mini"><span>Fleet size</span><strong>{counts.total}</strong></div>
        <div className="mini"><span>Running</span><strong className="txt-ok">{counts.running}</strong></div>
        <div className="mini"><span>Avg battery</span><strong className="txt-cyan">{counts.avgBatt}%</strong></div>
      </div>

      <Panel>
        <Toolbar>
          <input className="input search" placeholder="Search RB-ID, name, model…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={status} onChange={setStatus} placeholder="All statuses" options={['RUNNING', 'IDLE', 'CHARGING', 'MAINTENANCE']} />
          <Select value={zone} onChange={setZone} placeholder="All zones" options={ZONES.map((z) => ({ value: z.id, label: z.name }))} />
          <span className="toolbar-count">{rows.length} shown</span>
        </Toolbar>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Robot</th><th>Model</th><th>Zone</th><th>Battery</th><th>Uptime</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading && !data && <tr><td colSpan="6" className="td-muted">Loading…</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan="6" className="td-muted">No robots match the filters.</td></tr>}
              {rows.map((r) => {
                const st = r.liveStatus || r.status;
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="cell-user">
                        <span className="avatar sm rb">{r.name.charAt(0)}</span>
                        <div><strong>{r.name}</strong><small>{r.robotId}</small></div>
                      </div>
                    </td>
                    <td>{r.model}</td>
                    <td>{zoneName(r.liveZone || r.zone)}</td>
                    <td><Battery level={r.battery} /></td>
                    <td>{r.uptimeHours}h</td>
                    <td><Chip tone={STATUS_TONE[st]}>{titleCase(st)}</Chip></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={open}
        title="Add Robot"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={busy} onClick={submit}>{busy ? 'Adding…' : 'Add Robot'}</button>
          </>
        }
      >
        <div className="form-grid">
          <Field label="Name"><input className="input" value={form.name} onChange={set('name')} placeholder="Cobot-11" /></Field>
          <Field label="Model">
            <select className="select" value={form.model} onChange={set('model')}>
              {['Cobot', 'Arm', 'SCARA', 'AGV', 'Palletizer'].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Home zone">
            <select className="select" value={form.zone} onChange={set('zone')}>
              {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </Field>
          <Field label="Workstation"><input className="input" value={form.workstation} onChange={set('workstation')} placeholder="WS-A1" /></Field>
        </div>
        {err && <div className="form-error">{err}</div>}
      </Modal>
    </div>
  );
}
