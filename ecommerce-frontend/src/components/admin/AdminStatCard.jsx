const AdminStatCard = ({
  label,
  value,
  icon,
  color = 'blue',
  sub = '',
  prefix = '',
}) => {
  return (
    <div className={`stat-card ${color} position-relative`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {prefix}{value ?? '—'}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
      <span className="stat-icon">{icon}</span>
    </div>
  );
};

export default AdminStatCard;