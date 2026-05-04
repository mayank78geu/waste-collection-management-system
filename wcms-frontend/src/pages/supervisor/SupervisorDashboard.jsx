import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const fmt = (d) => d.toISOString().slice(0, 10);
const today = fmt(new Date());

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const [date, setDate] = useState(today);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = (d) => {
    setLoading(true);
    api.get(`/api/schedules?date=${d}`)
      .then(res => setSchedules(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(date); }, [date]);

  const counts = {
    total:     schedules.length,
    pending:   schedules.filter(s => s.status === 'PENDING').length,
    completed: schedules.filter(s => s.status === 'COMPLETED').length,
    missed:    schedules.filter(s => s.status === 'MISSED').length,
  };

  const stats = [
    { label: 'Total Schedules', value: counts.total,     icon: '📅', color: 'blue' },
    { label: 'Pending',         value: counts.pending,   icon: '⏳', color: 'amber' },
    { label: 'Completed',       value: counts.completed, icon: '✅', color: 'green' },
    { label: 'Missed',          value: counts.missed,    icon: '❌', color: 'red' },
  ];

  const statusDot = (s) => {
    const cls = { PENDING: 'pending', COMPLETED: 'completed', MISSED: 'missed' };
    return <span className={`status-dot ${cls[s] ?? ''}`}>{s}</span>;
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Supervisor Dashboard</div>
          <div className="page-subtitle">Collection schedule overview</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            id="date-picker"
            type="date"
            value={date}
            max={fmt(new Date(Date.now() + 30 * 864e5))}
            onChange={e => setDate(e.target.value)}
            style={{ width: 160 }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/supervisor/schedules')}
            id="btn-manage-schedules"
          >
            📅 Manage Schedules
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="summary-cards">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon-wrap ${s.color === 'red' ? '' : s.color}`}
              style={s.color === 'red' ? { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' } : {}}
            >
              {s.icon}
            </div>
            <div>
              <div className="stat-value">{loading ? '—' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Schedules for {date === today ? 'Today' : date}</span>
          {!loading && <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{counts.total} record{counts.total !== 1 ? 's' : ''}</span>}
        </div>

        {loading ? (
          <div className="loading" style={{ minHeight: 160 }} />
        ) : (
          <div className="table-wrap" style={{ borderRadius: 0, border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Zone</th>
                  <th>Vehicle</th>
                  <th>Driver / Staff</th>
                  <th>Time Slot</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 ? (
                  <tr className="empty-row"><td colSpan={6}>No schedules found for this date</td></tr>
                ) : (
                  schedules.map((s, i) => (
                    <tr key={s.scheduleId}>
                      <td style={{ color: 'var(--text-3)' }}>{i + 1}</td>
                      <td><strong>{s.zone?.zoneName ?? '—'}</strong><br /><span style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.zone?.description}</span></td>
                      <td>{s.vehicle?.vehicleNumber ?? '—'}</td>
                      <td>{s.staff?.user?.name ?? '—'}<br /><span style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.staff?.designation}</span></td>
                      <td>
                        <span className="badge badge-in_use" style={{ fontSize: 11 }}>{s.timeSlot?.replace('_', ' ')}</span>
                      </td>
                      <td>{statusDot(s.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hint card */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ color: 'var(--text-2)', fontSize: 13.5, lineHeight: 1.8 }}>
          <strong style={{ color: 'var(--primary)' }}>Tip:</strong> Use{' '}
          <strong style={{ color: 'var(--accent)' }}>Manage Schedules</strong> to create, view, or cancel
          collection runs. Drivers update their own status (Completed / Missed) from their dashboard.
        </div>
      </div>
    </div>
  );
}
