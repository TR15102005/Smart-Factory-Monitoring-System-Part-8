import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import useFetch from '../hooks/useFetch.js';
import { PageHead, Panel, Field } from '../components/ui.jsx';

export default function Settings() {
  const { data, loading } = useFetch(() => api.settings());
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (data?.settings) setForm({ ...data.settings });
  }, [data]);

  if (loading && !form) return <div className="empty-state">Loading settings…</div>;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setErr(''); setMsg(''); setBusy(true);
    try {
      await api.updateSettings(form);
      setMsg('Settings saved.');
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="page">
      <PageHead title="Settings" subtitle="Workspace preferences and alert routing." />

      <div className="split-2">
        <Panel title="Workspace">
          <div className="pad16 form-col">
            <Field label="Workspace name"><input className="input" value={form?.workspaceName || ''} onChange={set('workspaceName')} /></Field>
            <div className="row-2">
              <Field label="Timezone">
                <select className="select" value={form?.timezone || 'UTC'} onChange={set('timezone')}>
                  {['UTC', 'America/New_York', 'America/Chicago', 'Europe/Berlin', 'Asia/Kolkata', 'Asia/Tokyo'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Theme">
                <select className="select" value={form?.theme || 'dark'} onChange={set('theme')}>
                  <option value="dark">Dark</option><option value="light">Light</option>
                </select>
              </Field>
            </div>
            <Field label="Shift handover"><input className="input" value={form?.shiftHandover || ''} onChange={set('shiftHandover')} placeholder="06:00 / 18:00" /></Field>
          </div>
        </Panel>

        <Panel title="Alerts">
          <div className="pad16 form-col">
            <Field label="Alert notification email"><input className="input" type="email" value={form?.alertEmail || ''} onChange={set('alertEmail')} placeholder="safety@factory.io" /></Field>
            <p className="hint">High-severity incidents and gas alerts are routed to this mailbox by the monitoring service.</p>
            {msg && <div className="form-ok">{msg}</div>}
            {err && <div className="form-error">{err}</div>}
            <button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save changes'}</button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
