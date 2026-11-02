import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FactoryIcon, ShieldIcon, RobotIcon, UsersIcon } from '../components/icons.jsx';

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  if (user) return <Navigate to="/" replace />;

  const submit = async (mode) => {
    setError('');
    setBusy(mode);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="login-page">
      <aside className="login-hero">
        <div className="login-hero-inner">
          <div className="brand">
            <span className="brand-logo"><FactoryIcon width={26} height={26} /></span>
            <div>
              <strong>SmartFactory Monitor</strong>
              <small>MERN · MongoDB · Express · React · Node</small>
            </div>
          </div>
          <h1>Zone Layout &amp; Occupancy Intelligence</h1>
          <p>
            Track collaborative workspaces in real time to improve worker safety, robot
            utilization and compliance across every factory zone.
          </p>
          <ul className="hero-points">
            <li><UsersIcon /> Live worker occupancy per zone with capacity alerts</li>
            <li><RobotIcon /> Robot fleet utilization and charging state</li>
            <li><ShieldIcon /> Gas alerts, hazard zones and response team dispatch</li>
          </ul>
        </div>
      </aside>

      <section className="login-panel">
        <form className="login-card" onSubmit={(e) => e.preventDefault()}>
          <h2>Sign in to continue</h2>
          <p className="muted">Monitor zones, occupancy and compliance from one console.</p>

          <div className="demo-box">
            <span className="demo-title">Default admin account</span>
            <span className="demo-line"><b>Admin ID:</b> admin@factory.io</span>
            <span className="demo-line"><b>Password:</b> admin123</span>
          </div>

          <label className="field">
            <span>Email / User ID</span>
            <input
              type="email"
              autoComplete="username"
              placeholder="you@factory.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <div className="login-actions">
            <button className="btn btn-primary" disabled={Boolean(busy)} onClick={() => submit('login')}>
              {busy === 'login' ? 'Logging in…' : 'Log In'}
            </button>
            <button className="btn btn-ghost" disabled={Boolean(busy)} onClick={() => submit('register')}>
              {busy === 'register' ? 'Creating…' : 'Create New User'}
            </button>
          </div>
          <p className="hint">
            “Create New User” registers a supervisor account with the credentials above and signs you in.
          </p>
        </form>
      </section>
    </div>
  );
}
