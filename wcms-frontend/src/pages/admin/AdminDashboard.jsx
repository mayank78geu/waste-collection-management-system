import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/dashboard/summary')
      .then(res => setSummary(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Zones',    value: summary?.totalZones,    icon: '📍', color: 'green' },
    { label: 'Vehicles',       value: summary?.totalVehicles,  icon: '🚛', color: 'blue' },
    { label: 'Staff Members',  value: summary?.totalStaff,     icon: '👷', color: 'purple' },
    { label: 'System Users',   value: summary?.totalUsers,     icon: '👥', color: 'amber' },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard Overview</div>
          <div className="page-subtitle">System health at a glance</div>
        </div>
      </div>

      {loading ? (
        <div className="loading" />
      ) : (
        <div className="summary-cards">
          {stats.map(s => (
            <div className="stat-card" key={s.label}>
              <div className={`stat-icon-wrap ${s.color}`}>{s.icon}</div>
              <div>
                <div className="stat-value">{s.value ?? '—'}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginTop: 8 }}>
        <div style={{ color: 'var(--text-2)', fontSize: 13.5, lineHeight: 1.8 }}>
          <strong style={{ color: 'var(--primary)' }}>Increment 1</strong> — Admin master data management is live.
          Use the sidebar to manage Zones, Vehicles, Staff, and Users.
          <br />
          <strong style={{ color: 'var(--accent)' }}>Increment 2</strong> — Scheduling &amp; Driver tracking coming next.
        </div>
      </div>
    </div>
  );
}
