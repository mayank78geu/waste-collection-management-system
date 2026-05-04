import { useEffect, useState } from 'react';
import api from '../../api/axios';

const fmt = (d) => d.toISOString().slice(0, 10);
const today = fmt(new Date());

const STATUS_MAP = {
  PENDING:   { label: 'Pending',   color: 'var(--warning)', icon: '⏳', glow: 'rgba(245,158,11,0.12)' },
  COMPLETED: { label: 'Completed', color: 'var(--success)', icon: '✅', glow: 'rgba(16,185,129,0.12)' },
  MISSED:    { label: 'Missed',    color: 'var(--danger)',  icon: '❌', glow: 'rgba(244,63,94,0.12)' },
};

const SLOT_ICONS = { MORNING: '🌅', AFTERNOON: '☀️', EVENING: '🌆' };

export default function DriverDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // id being updated

  const load = () => {
    setLoading(true);
    // Fetch upcoming tasks (today + future)
    api.get('/api/schedules/my')
      .then(res => setTasks(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/api/schedules/${id}/status`, { status });
      setTasks(prev => prev.map(t => t.scheduleId === id ? { ...t, status } : t));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const todayTasks    = tasks.filter(t => t.date === today);
  const upcomingTasks = tasks.filter(t => t.date > today);

  const counts = {
    total:     todayTasks.length,
    pending:   todayTasks.filter(t => t.status === 'PENDING').length,
    completed: todayTasks.filter(t => t.status === 'COMPLETED').length,
    missed:    todayTasks.filter(t => t.status === 'MISSED').length,
  };

  const TaskCard = ({ task }) => {
    const st = STATUS_MAP[task.status] || STATUS_MAP.PENDING;
    const isUpdating = updating === task.scheduleId;
    const isPast = task.date < today;
    return (
      <div
        className="card"
        style={{
          position: 'relative',
          borderColor: `rgba(${st.color === 'var(--warning)' ? '245,158,11' : st.color === 'var(--success)' ? '16,185,129' : '244,63,94'}, 0.25)`,
          transition: 'all 0.2s',
        }}
      >
        {/* Status banner */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: st.glow, borderRadius: '0 14px 0 8px',
          padding: '4px 14px', fontSize: 12, fontWeight: 600, color: st.color,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          {st.icon} {st.label}
        </div>

        {/* Date + slot */}
        <div style={{ marginBottom: 14, paddingRight: 90 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>
            {SLOT_ICONS[task.timeSlot] || '🕐'} {task.timeSlot?.replace('_', ' ')} &nbsp;·&nbsp; {task.date}
            {task.date === today && <span style={{ color: 'var(--primary)', marginLeft: 8, fontWeight: 600 }}>TODAY</span>}
          </div>
        </div>

        {/* Zone info */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
            📍 {task.zone?.zoneName ?? 'Unknown Zone'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{task.zone?.description}</div>
          {task.zone?.description && (
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{task.zone.description}</div>
          )}
        </div>

        {/* Vehicle info */}
        <div style={{
          background: 'var(--bg-base)', borderRadius: 8, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
          border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 20 }}>🚛</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{task.vehicle?.vehicleNumber ?? '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{task.vehicle?.type} · Cap: {task.vehicle?.capacityTons ?? '—'} tons</div>
          </div>
        </div>

        {/* Action buttons */}
        {task.status === 'PENDING' && !isPast && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              id={`btn-complete-${task.scheduleId}`}
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={isUpdating}
              onClick={() => updateStatus(task.scheduleId, 'COMPLETED')}
            >
              {isUpdating ? 'Updating…' : '✅ Mark Completed'}
            </button>
            <button
              id={`btn-miss-${task.scheduleId}`}
              className="btn btn-danger"
              disabled={isUpdating}
              onClick={() => updateStatus(task.scheduleId, 'MISSED')}
            >
              ❌ Missed
            </button>
          </div>
        )}

        {task.status === 'COMPLETED' && (
          <div style={{
            padding: '10px 16px', borderRadius: 8,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            color: 'var(--success)', fontSize: 13, fontWeight: 500, textAlign: 'center',
          }}>
            ✅ Collection completed — great work!
          </div>
        )}

        {task.status === 'MISSED' && (
          <div style={{
            padding: '10px 16px', borderRadius: 8,
            background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
            color: 'var(--danger)', fontSize: 13, fontWeight: 500, textAlign: 'center',
          }}>
            ❌ Marked as missed — contact your supervisor
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">My Tasks</div>
          <div className="page-subtitle">Your assigned collection runs</div>
        </div>
        <button id="btn-refresh-tasks" className="btn btn-secondary btn-sm" onClick={load}>
          🔄 Refresh
        </button>
      </div>

      {/* Today's stats */}
      <div className="summary-cards" style={{ marginBottom: 24 }}>
        {[
          { label: "Today's Tasks", value: counts.total,     icon: '📋', color: 'blue' },
          { label: 'Pending',       value: counts.pending,   icon: '⏳', color: 'amber' },
          { label: 'Completed',     value: counts.completed, icon: '✅', color: 'green' },
          { label: 'Missed',        value: counts.missed,    icon: '❌', color: 'red' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div
              className={s.color !== 'red' ? `stat-icon-wrap ${s.color}` : 'stat-icon-wrap'}
              style={s.color === 'red' ? { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' } : {}}
            >{s.icon}</div>
            <div>
              <div className="stat-value">{loading ? '—' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="loading" style={{ minHeight: 240 }} />
      ) : (
        <>
          {/* Today's tasks */}
          <div style={{ marginBottom: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--primary)' }}>●</span> Today — {today}
            </h3>
            {todayTasks.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text-3)', padding: 40 }}>
                🎉 No tasks assigned for today. Enjoy your day!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {todayTasks.map(t => <TaskCard key={t.scheduleId} task={t} />)}
              </div>
            )}
          </div>

          {/* Upcoming tasks */}
          {upcomingTasks.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--accent)' }}>◎</span> Upcoming
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {upcomingTasks.map(t => <TaskCard key={t.scheduleId} task={t} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
