export default function StatCard({ icon, label, value, sub, tone = 'info' }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        <span className="stat-sub">{sub}</span>
      </div>
    </div>
  );
}
