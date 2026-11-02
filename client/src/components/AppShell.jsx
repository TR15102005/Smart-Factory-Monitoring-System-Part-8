import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import {
  FactoryIcon, LogoutIcon, HomeIcon, PinIcon, UsersIcon, RobotIcon,
  AlertIcon, WrenchIcon, ChartIcon, ClipboardIcon, DocIcon, GearIcon, KeyIcon, BellIcon
} from './icons.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/zones', label: 'Zone Layout', icon: PinIcon },
  { to: '/workers', label: 'Workers', icon: UsersIcon },
  { to: '/robots', label: 'Robots', icon: RobotIcon },
  { to: '/safety', label: 'Safety', icon: AlertIcon },
  { to: '/maintenance', label: 'Maintenance', icon: WrenchIcon },
  { to: '/analytics', label: 'Analytics', icon: ChartIcon },
  { to: '/compliance', label: 'Compliance', icon: ClipboardIcon },
  { to: '/reports', label: 'Reports', icon: DocIcon },
  { to: '/settings', label: 'Settings', icon: GearIcon },
  { to: '/admin', label: 'Admin', icon: KeyIcon, admin: true }
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString(undefined, { hour12: false });
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const clock = useClock();
  const [meta, setMeta] = useState({ openHigh: 0, openTotal: 0 });
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () =>
      api.incidents({ status: 'OPEN' })
        .then((d) => { if (alive && d.meta) setMeta(d.meta); })
        .catch(() => {});
    load();
    const t = setInterval(load, 15000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items = NAV.filter((n) => !n.admin || user?.role === 'admin');

  return (
    <div className="app">
      <aside className={`sidebar ${navOpen ? 'open' : ''}`}>
        <div className="side-brand">
          <span className="brand-logo"><FactoryIcon /></span>
          <div>
            <strong>SmartFactory</strong>
            <small>Monitor</small>
          </div>
        </div>
        <nav className="side-nav">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setNavOpen(false)}
              className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
              <Icon />
              <span>{label}</span>
              {to === '/safety' && meta.openHigh > 0 && <em className="nav-badge">{meta.openHigh}</em>}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <div className="side-user">
            <span className="avatar">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
            <div className="side-usermeta">
              <strong>{user?.name}</strong>
              <span className={`role-chip role-${user?.role}`}>{user?.role}</span>
            </div>
          </div>
          <button className="icon-btn" title="Log out" onClick={handleLogout}><LogoutIcon /></button>
        </div>
      </aside>

      {navOpen && <div className="side-scrim" onClick={() => setNavOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setNavOpen(true)} aria-label="Menu">☰</button>
          <span className="live-pill"><i /> LIVE</span>
          <div className="topbar-spacer" />
          <button className="bell" title={`${meta.openTotal} open incidents`} onClick={() => navigate('/safety')}>
            <BellIcon />
            {meta.openHigh > 0 && <em className="bell-badge">{meta.openHigh}</em>}
          </button>
          <span className="clock">{clock}</span>
          <span className="topbar-user">
            <span className="avatar sm">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
            <span className="tu-name">{user?.name}</span>
          </span>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
