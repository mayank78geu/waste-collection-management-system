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

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-page">
      <h2>Admin Dashboard</h2>
      <div className="summary-cards">
        <div className="card stat-card">
          <span className="stat-icon">📍</span>
          <div>
            <h3>{summary?.totalZones ?? '—'}</h3>
            <p>Zones</p>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">🚛</span>
          <div>
            <h3>{summary?.totalVehicles ?? '—'}</h3>
            <p>Vehicles</p>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">👷</span>
          <div>
            <h3>{summary?.totalStaff ?? '—'}</h3>
            <p>Staff</p>
          </div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon">👥</span>
          <div>
            <h3>{summary?.totalUsers ?? '—'}</h3>
            <p>Users</p>
          </div>
        </div>
      </div>
    </div>
  );
}
