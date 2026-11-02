import { useState } from 'react';
import { api } from '../api/client.js';
import useFetch from '../hooks/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHead, Panel, Chip, Field } from '../components/ui.jsx';
import { fmtDate } from '../lib/format.js';

export default function Admin() {
  const { user } = useAuth();
  const { data, loading, reload } = useFetch(() => api.users());
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'supervisor' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  if (user?.role !== 'admin') {
    return (
      <div className="page">
        <PageHead title="Admin" subtitle="User management" />
        <Panel><div className="pad16"><div className="form-error">Administrator access required.</div></div></Panel>
      </div>
    );
  }

  const users = data?.users || [];
  const ov = data?.overview || {};
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setErr(''); setMsg('');
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setErr('Name, valid email and a 6+ character password are required.');
      return;
    }
    setBusy(true);
    try {
      const res = await api.createUser(form);
      setMsg(`Created ${res.user.email} (${res.user.role}).`);
      setForm({ name: '', email: '', password: '', role: 'supervisor' });
      reload();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="page">
      <PageHead title="Admin" subtitle="User management and system overview." />

      <div className="mini-stats">
        <div className="mini"><span>Users</span><strong>{ov.users ?? '—'}</strong></div>
        <div className="mini"><span>Workers</span><strong className="txt-cyan">{ov.workers ?? '—'}</strong></div>
        <div className="mini"><span>Robots</span><strong>{ov.robots ?? '—'}</strong></div>
        <div className="mini warn"><span>Open incidents</span><strong>{ov.openIncidents ?? '—'}</strong></div>
        <div className="mini"><span>Utilization</span><strong className="txt-ok">{ov.robotUtilization ?? '—'}%</strong></div>
      </div>

      <div className="split-2">
        <Panel title="Users" className="feed-panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
              <tbody>
                {loading && !data && <tr><td colSpan="4" className="td-muted">Loading…</td></tr>}
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="cell-user">
                        <span className="avatar sm">{u.name.charAt(0).toUpperCase()}</span>
                        <strong>{u.name}</strong>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td><Chip tone={u.role === 'admin' ? 'ok' : 'busy'}>{u.role}</Chip></td>
                    <td>{u.createdAt ? fmtDate(u.createdAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Create new user">
          <div className="pad16 form-col">
            <Field label="Full name"><input className="input" value={form.name} onChange={set('name')} placeholder="Jordan Lee" /></Field>
            <Field label="Email"><input className="input" type="email" value={form.email} onChange={set('email')} placeholder="jordan@factory.io" /></Field>
            <Field label="Password"><input className="input" type="password" value={form.password} onChange={set('password')} placeholder="min 6 characters" /></Field>
            <Field label="Role">
              <select className="select" value={form.role} onChange={set('role')}>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            {msg && <div className="form-ok">{msg}</div>}
            {err && <div className="form-error">{err}</div>}
            <button className="btn btn-primary" disabled={busy} onClick={submit}>{busy ? 'Creating…' : 'Create User'}</button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
