import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppShell from './components/AppShell.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ZoneLayout from './pages/ZoneLayout.jsx';
import Workers from './pages/Workers.jsx';
import Robots from './pages/Robots.jsx';
import Safety from './pages/Safety.jsx';
import Maintenance from './pages/Maintenance.jsx';
import Analytics from './pages/Analytics.jsx';
import Compliance from './pages/Compliance.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/zones" element={<ZoneLayout />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/robots" element={<Robots />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
