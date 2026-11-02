export const ZONES = [
  { id: 'assembly', name: 'Assembly Hall A1' },
  { id: 'welding', name: 'Welding Bay' },
  { id: 'cnc', name: 'CNC Machining' },
  { id: 'paint', name: 'Paint Shop' },
  { id: 'qc', name: 'Quality Lab' },
  { id: 'packaging', name: 'Packaging Line' },
  { id: 'warehouse', name: 'Warehouse' },
  { id: 'charging', name: 'Robot Charging Dock' }
];

export const zoneName = (id) => ZONES.find((z) => z.id === id)?.name || id || '—';

export const titleCase = (s = '') =>
  String(s).toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export function fmtDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function relTime(value) {
  if (!value) return '—';
  const s = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (s < 60) return `${Math.max(0, s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
