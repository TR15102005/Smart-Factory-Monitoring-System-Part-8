import { useMemo, useState } from 'react';
import { api } from '../api/client.js';
import useFetch from '../hooks/useFetch.js';
import { PageHead, Panel, Chip, Modal, Field, Toolbar, Select } from '../components/ui.jsx';
import { UsersIcon, PlusIcon } from '../components/icons.jsx';
import { ZONES, zoneName, titleCase } from '../lib/format.js';

const STATUS_TONE = { ACTIVE: 'ok', TRAINING: 'busy', OFFLINE: 'over' };

export default function Workers() {
  const { data, loading, reload } = useFetch(() => api.workers());
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [zone, setZone] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ name: '', role: '', department: '', zone: 'assembly', workstation: '', shift: 'Day' });

  const workers = data?.workers || [];

  const rows = useMemo(() => workers.filter((w) => {
    const hay = `${w.employeeId} ${w.name} ${w.role} ${w.department}`.toLowerCase();
    return (!q || hay.includes(q.toLowerCase()))
      && (!status || w.status === status)
      && (!zone || (w.liveZone || w.zone) === zone);
  }), [workers, q, status, zone]);

  const counts = useMemo(() => ({
    total: workers.length,
    active: workers.filter((w) => w.status === 'ACTIVE').length,
    onFloor: workers.filter((w) => w.onFloor).length
  }), [workers]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setErr(''); setBusy(true);
    try {
      await api.addWorker(form);
      setOpen(false);
      setForm({ name: '', role: '', department: '', zone: 'assembly', workstation: '', shift: 'Day' });
      reload();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="page">
      <PageHead title="Workers" subtitle="Personnel roster, assignments and live floor presence.">
        <button className="btn btn-primary" onClick={() => setOpen(true)}><PlusIcon /> Add Worker</button>
      </PageHead>

      <div className="mini-stats">
        <div className="mini"><span>Total workers</span><strong>{counts.total}</strong></div>
        <div className="mini"><span>Active</span><strong className="txt-ok">{counts.active}</strong></div>
        <div className="mini"><span>On floor now</span><strong className="txt-cyan">{counts.onFloor}</strong></div>
      </div>

      <Panel>
        <Toolbar>
          <input className="input search" placeholder="Search EMP-ID, name, role…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={status} onChange={setStatus} placeholder="All statuses" options={['ACTIVE', 'TRAINING', 'OFFLINE']} />
          <Select value={zone} onChange={setZone} placeholder="All zones" options={ZONES.map((z) => ({ value: z.id, label: z.name }))} />
          <span className="toolbar-count">{rows.length} shown</span>
        </Toolbar>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Employee</th><th>Role</th><th>Department</th><th>Zone</th><th>Shift</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading && !data && <tr><td colSpan="6" className="td-muted">Loading…</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan="6" className="td-muted">No workers match the filters.</td></tr>}
              {rows.map((w) => (
                <tr key={w.id}>
                  <td>
                    <div className="cell-user">
                      <span className="avatar sm">{w.name.charAt(0)}</span>
                      <div><strong>{w.name}</strong><small>{w.employeeId}</small></div>
                    </div>
                  </td>
                  <td>{w.role}</td>
                  <td>{w.department}</td>
                  <td>{zoneName(w.liveZone || w.zone)}{w.onFloor && <span className="dot-live" title="On floor" />}</td>
                  <td>{w.shift}</td>
                  <td><Chip tone={STATUS_TONE[w.status]}>{titleCase(w.status)}</Chip></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={open}
        title="Add Worker"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={busy} onClick={submit}>{busy ? 'Adding…' : 'Add Worker'}</button>
          </>
        }
      >
        <div className="form-grid">
          <Field label="Full name"><input className="input" value={form.name} onChange={set('name')} placeholder="Jane Doe" /></Field>
          <Field label="Role"><input className="input" value={form.role} onChange={set('role')} placeholder="Cobot Operator" /></Field>
          <Field label="Department"><input className="input" value={form.department} onChange={set('department')} placeholder="Assembly" /></Field>
          <Field label="Workstation"><input className="input" value={form.workstation} onChange={set('workstation')} placeholder="WS-A1" /></Field>
          <Field label="Zone">
            <select className="select" value={form.zone} onChange={set('zone')}>
              {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </Field>
          <Field label="Shift">
            <select className="select" value={form.shift} onChange={set('shift')}>
              <option value="Day">Day</option><option value="Night">Night</option>
            </select>
          </Field>
        </div>
        {err && <div className="form-error">{err}</div>}
      </Modal>
    </div>
  );
}
