import { api } from '../api/client.js';
import useFetch from '../hooks/useFetch.js';
import { PageHead, Panel } from '../components/ui.jsx';
import { BarChart, HBarChart, Donut, LineArea, StackedBars } from '../components/charts/Charts.jsx';
import { titleCase, zoneName } from '../lib/format.js';

const ROBOT_COLORS = { working: '#22d3ee', idle: '#64748b', charging: '#f59e0b', maintenance: '#ef4444' };

export default function Analytics() {
  const { data, loading } = useFetch(() => api.analytics());

  if (loading && !data) return <div className="empty-state">Crunching analytics…</div>;
  if (!data) return <div className="empty-state">No analytics available.</div>;

  const dist = Object.entries(data.statusDistribution).map(([label, value]) => ({
    label: titleCase(label), value, color: ROBOT_COLORS[label] || '#38bdf8'
  }));
  const totalRobots = dist.reduce((s, d) => s + d.value, 0);
  const alertFreq = data.alertFrequency.map((d) => ({ label: zoneName(d.label).split(' ')[0], value: d.value }));

  return (
    <div className="page">
      <PageHead title="Analytics" subtitle="Trends across utilization, incidents, maintenance and fleet health." live />

      <div className="mini-stats">
        <div className="mini"><span>Robot utilization</span><strong className="txt-cyan">{data.robotUtilization}%</strong></div>
        <div className="mini"><span>Robots tracked</span><strong>{totalRobots}</strong></div>
        <div className="mini"><span>Peak zone alerts</span><strong className="txt-warn">{alertFreq[0]?.label || '—'}</strong></div>
      </div>

      <div className="grid-2">
        <Panel title="Robot utilization trend (14 days)">
          <div className="pad16"><LineArea data={data.utilizationTrend} height={210} unit="%" /></div>
        </Panel>
        <Panel title="Fleet status distribution">
          <div className="pad16">
            <Donut data={dist} centerValue={totalRobots} centerLabel="robots" />
          </div>
        </Panel>

        <Panel title="Daily incidents by severity (14 days)">
          <div className="pad16"><StackedBars data={data.incidentsBySeverity} height={220} /></div>
        </Panel>
        <Panel title="Weekly incident trend">
          <div className="pad16"><BarChart data={data.weeklyTrend} height={220} color="#38bdf8" /></div>
        </Panel>

        <Panel title="Robot operating hours">
          <div className="pad16"><HBarChart data={data.operatingHours} color="#22d3ee" unit="h" /></div>
        </Panel>
        <Panel title="Alert frequency by zone">
          <div className="pad16"><HBarChart data={alertFreq} color="#f59e0b" /></div>
        </Panel>
      </div>

      <Panel title="Maintenance response time (hours)">
        <div className="pad16"><BarChart data={data.maintenanceResponse} height={200} color="#22c55e" unit="h" /></div>
      </Panel>
    </div>
  );
}
