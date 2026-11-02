import { useMemo, useState } from 'react';
import { api } from '../api/client.js';
import useFetch from '../hooks/useFetch.js';
import { PageHead, Panel, Chip, Modal, Field, Toolbar, Select } from '../components/ui.jsx';
import { PlusIcon } from '../components/icons.jsx';
import { titleCase, fmtDate } from '../lib/format.js';

const STATUS_TONE = { COMPLETED: 'ok', IN_PROGRESS: 'busy', SCHEDULED: 'over' };
const NEXT = { SCHEDULED: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED' };

export default function Maintenance() {
  const { data, loading, reload } = useFetch(() => api.maintenance());
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ asset: '', type: 'PREVENTIVE', technician: '', durationHours: '', notes: '' });

  const records = data?.records || [];
  const rows = useMemo(
    () => records.filter((r) => (!status || r.status === status) && (!type || r.type === type)),
    [records, status, type]
  );

  const counts = useMemo(() => ({
    open: records.filter((r) => r.status !== 'COMPLETED').length,
    inProgress: records.filter((r) => r.status === 'IN_PROGRESS').length,
    completed: records.filter((r) => r.status === 'COMPLETED').length
  }), [records]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.asset.trim() || !form.technician.trim()) { setErr('Asset and technician are required.'); return; }
    setErr(''); setBusy(true);
    try {
      await api.addMaintenance(form);
      setOpen(false);
      setForm({ asset: '', type: 'PREVENTIVE', technician: '', durationHours: '', notes: '' });
      reload();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const advance = async (r) => {
    const next = NEXT[r.status];
    if (!next) return;
    await api.updateMaintenance(r.id, { status: next });
    reload();
  };

  return (
    <div className="page">
      <PageHead title="Alerts & Maintenance" subtitle="Preventive, corrective and calibration work orders across the fleet.">
        <button className="btn btn-primary" onClick={() => setOpen(true)}><PlusIcon /> Schedule Maintenance</button>
      </PageHead>

      <div className="mini-stats">
        <div className="mini warn"><span>Open work orders</span><strong>{counts.open}</strong></div>
        <div className="mini"><span>In progress</span><strong className="txt-cyan">{counts.inProgress}</strong></div>
        <div className="mini"><span>Completed</span><strong className="txt-ok">{counts.completed}</strong></div>
      </div>

      <Panel>
        <Toolbar>
          <Select value={status} onChange={setStatus} placeholder="All statuses" options={['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']} />
          <Select value={type} onChange={setType} placeholder="All types" options={['PREVENTIVE', 'CORRECTIVE', 'CALIBRATION']} />
          <span className="toolbar-count">{rows.length} shown</span>
        </Toolbar>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Record</th><th>Asset</th><th>Type</th><th>Technician</th><th>Duration</th><th>Date</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {loading && !data && <tr><td colSpan="8" className="td-muted">Loading…</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan="8" className="td-muted">No maintenance records match the filters.</td></tr>}
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.recordId}</strong></td>
                  <td>{r.asset}</td>
                  <td>{titleCase(r.type)}</td>
                  <td>{r.technician}</td>
                  <td>{r.durationHours}h</td>
                  <td>{fmtDate(r.date)}</td>
                  <td><Chip tone={STATUS_TONE[r.status]}>{titleCase(r.status)}</Chip></td>
                  <td>
                    {NEXT[r.status] && (
                      <button className="btn btn-ghost xs" onClick={() => advance(r)}>
                        {r.status === 'SCHEDULED' ? 'Start' : 'Complete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={open}
        title="Schedule Maintenance"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={busy} onClick={submit}>{busy ? 'Saving…' : 'Schedule'}</button>
          </>
        }
      >
        <div className="form-grid">
          <Field label="Asset"><input className="input" value={form.asset} onChange={set('asset')} placeholder="RB-004" /></Field>
          <Field label="Technician"><input className="input" value={form.technician} onChange={set('technician')} placeholder="Elena Petrova" /></Field>
          <Field label="Type">
            <select className="select" value={form.type} onChange={set('type')}>
              <option value="PREVENTIVE">Preventive</option>
              <option value="CORRECTIVE">Corrective</option>
              <option value="CALIBRATION">Calibration</option>
            </select>
          </Field>
          <Field label="Est. duration (hours)"><input className="input" type="number" min="0" step="0.5" value={form.durationHours} onChange={set('durationHours')} placeholder="2" /></Field>
          <div className="span-2">
            <Field label="Notes"><textarea className="input textarea" rows="3" value={form.notes} onChange={set('notes')} placeholder="Scope of work, parts required…" /></Field>
          </div>
        </div>
        {err && <div className="form-error">{err}</div>}
      </Modal>
    </div>
  );
}
