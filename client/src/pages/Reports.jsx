import { useState } from 'react';
import { api } from '../api/client.js';
import useFetch from '../hooks/useFetch.js';
import { PageHead, Panel, Field, Modal } from '../components/ui.jsx';
import { DocIcon } from '../components/icons.jsx';
import { fmtDateTime } from '../lib/format.js';

const today = () => new Date().toISOString().slice(0, 10);
const monthAgo = () => new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);

export default function Reports() {
  const { data, loading, reload } = useFetch(() => api.reports());
  const [form, setForm] = useState({ title: '', workspace: 'Main Plant', from: monthAgo(), to: today() });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [preview, setPreview] = useState(null);

  const reports = data?.reports || [];
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.title.trim()) { setErr('A report title is required.'); return; }
    setErr(''); setBusy(true);
    try {
      await api.generateReport(form);
      setForm((f) => ({ ...f, title: '' }));
      reload();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="page">
      <PageHead title="Reports" subtitle="Generate snapshot reports and browse the archive." />

      <div className="split-2">
        <Panel title="Generate report">
          <div className="pad16 form-col">
            <Field label="Report title"><input className="input" value={form.title} onChange={set('title')} placeholder="Weekly Safety & Utilization Summary" /></Field>
            <Field label="Workspace / scope">
              <select className="select" value={form.workspace} onChange={set('workspace')}>
                {['Main Plant', 'Assembly Cell', 'Welding Bay', 'Warehouse', 'Full Site'].map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </Field>
            <div className="row-2">
              <Field label="From"><input className="input" type="date" value={form.from} onChange={set('from')} /></Field>
              <Field label="To"><input className="input" type="date" value={form.to} onChange={set('to')} /></Field>
            </div>
            {err && <div className="form-error">{err}</div>}
            <button className="btn btn-primary" disabled={busy} onClick={submit}>{busy ? 'Generating…' : 'Generate Report'}</button>
            <p className="hint">A report captures live worker, robot, incident and compliance counts at generation time.</p>
          </div>
        </Panel>

        <Panel title="Report archive" className="feed-panel">
          <div className="report-list">
            {loading && !data && <p className="td-muted pad16">Loading…</p>}
            {!loading && reports.length === 0 && <p className="td-muted pad16">No reports yet — generate your first one.</p>}
            {reports.map((r) => (
              <article className="report-item" key={r.id}>
                <span className="report-ic"><DocIcon /></span>
                <div className="report-main">
                  <strong>{r.title}</strong>
                  <small>{r.reportId} · {r.workspace} · {r.from} → {r.to}</small>
                  <small className="faint">{r.createdBy} · {fmtDateTime(r.createdAt)}</small>
                </div>
                <button className="btn btn-ghost xs" onClick={() => setPreview(r)}>Preview</button>
              </article>
            ))}
          </div>
        </Panel>
      </div>

      <Modal open={Boolean(preview)} title={preview?.title || 'Report'} onClose={() => setPreview(null)}
        footer={<button className="btn btn-primary" onClick={() => setPreview(null)}>Close</button>}>
        {preview && (
          <div className="preview">
            <div className="preview-meta">
              <span><b>Report ID</b> {preview.reportId}</span>
              <span><b>Workspace</b> {preview.workspace}</span>
              <span><b>Period</b> {preview.from} → {preview.to}</span>
              <span><b>Created</b> {fmtDateTime(preview.createdAt)} by {preview.createdBy}</span>
            </div>
            <div className="preview-grid">
              <div className="pv"><span>Workers</span><strong>{preview.summary?.workers}</strong></div>
              <div className="pv"><span>Active now</span><strong>{preview.summary?.activeWorkers}</strong></div>
              <div className="pv"><span>Robots</span><strong>{preview.summary?.robots}</strong></div>
              <div className="pv"><span>Utilization</span><strong>{preview.summary?.robotUtilization}%</strong></div>
              <div className="pv"><span>Open incidents</span><strong>{preview.summary?.openIncidents}</strong></div>
              <div className="pv"><span>Compliance</span><strong>{preview.summary?.compliance}%</strong></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
