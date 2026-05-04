import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';

const fmt = (d) => d.toISOString().slice(0, 10);
const today = fmt(new Date());

const TIME_SLOTS = ['MORNING', 'AFTERNOON', 'EVENING'];

const empty = () => ({
  zoneId: '',
  vehicleId: '',
  staffId: '',
  date: today,
  timeSlot: 'MORNING',
});

function statusDot(s) {
  const cls = { PENDING: 'pending', COMPLETED: 'completed', MISSED: 'missed' };
  return <span className={`status-dot ${cls[s] ?? ''}`}>{s}</span>;
}

export default function ScheduleManagement() {
  const [date, setDate] = useState(today);
  const [schedules, setSchedules] = useState([]);
  const [zones, setZones] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadSchedules = useCallback((d) => {
    setLoading(true);
    api.get(`/api/schedules?date=${d}`)
      .then(res => setSchedules(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadSchedules(date); }, [date, loadSchedules]);

  // Load master data once
  useEffect(() => {
    Promise.all([
      api.get('/api/zones'),
      api.get('/api/vehicles'),
      api.get('/api/staff'),
    ]).then(([z, v, s]) => {
      setZones(z.data.data ?? []);
      setVehicles(v.data.data ?? []);
      setStaff(s.data.data ?? []);
    }).catch(console.error);
  }, []);

  const openCreate = () => {
    setForm({ ...empty(), date });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.zoneId || !form.vehicleId || !form.staffId || !form.date || !form.timeSlot) {
      setError('All fields are required.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/api/schedules', {
        zoneId:   Number(form.zoneId),
        vehicleId: Number(form.vehicleId),
        staffId:  Number(form.staffId),
        date:     form.date,
        timeSlot: form.timeSlot,
      });
      setShowModal(false);
      loadSchedules(date);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create schedule';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`/api/schedules/${id}`);
      setDeleteId(null);
      loadSchedules(date);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const available = vehicles.filter(v => v.status === 'AVAILABLE');

  return (
    <div className="management-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Schedule Management</div>
          <div className="page-subtitle">Create and manage daily collection runs</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            id="schedule-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ width: 160 }}
          />
          <button
            id="btn-create-schedule"
            className="btn btn-primary"
            onClick={openCreate}
          >
            ＋ New Schedule
          </button>
        </div>
      </div>

      {/* Quick counts */}
      <div className="summary-cards" style={{ marginBottom: 22 }}>
        {[
          { label: 'Total',     value: schedules.length,                                      icon: '📋', color: 'blue' },
          { label: 'Pending',   value: schedules.filter(s => s.status === 'PENDING').length,  icon: '⏳', color: 'amber' },
          { label: 'Completed', value: schedules.filter(s => s.status === 'COMPLETED').length,icon: '✅', color: 'green' },
          { label: 'Missed',    value: schedules.filter(s => s.status === 'MISSED').length,   icon: '❌', color: 'red-raw' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div
              className={s.color !== 'red-raw' ? `stat-icon-wrap ${s.color}` : 'stat-icon-wrap'}
              style={s.color === 'red-raw' ? { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' } : {}}
            >{s.icon}</div>
            <div>
              <div className="stat-value">{loading ? '—' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Zone</th>
              <th>Vehicle</th>
              <th>Driver / Staff</th>
              <th>Time Slot</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="empty-row"><td colSpan={8}><div className="loading" style={{ minHeight: 80 }} /></td></tr>
            ) : schedules.length === 0 ? (
              <tr className="empty-row"><td colSpan={8}>No schedules for {date}. Create one above.</td></tr>
            ) : (
              schedules.map((s, i) => (
                <tr key={s.scheduleId}>
                  <td style={{ color: 'var(--text-3)' }}>{i + 1}</td>
                  <td>
                    <strong>{s.zone?.zoneName ?? '—'}</strong>
                    {s.zone?.description && <><br /><span style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.zone.description}</span></>}
                  </td>
                  <td>{s.vehicle?.vehicleNumber ?? '—'}<br /><span style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.vehicle?.type}</span></td>
                  <td>{s.staff?.user?.name ?? '—'}<br /><span style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.staff?.designation}</span></td>
                  <td>
                    <span className="badge badge-in_use" style={{ fontSize: 11 }}>
                      {s.timeSlot?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{statusDot(s.status)}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.createdBy?.name ?? '—'}</td>
                  <td>
                    <div className="actions">
                      <button
                        id={`btn-delete-schedule-${s.scheduleId}`}
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteId(s.scheduleId)}
                        title="Cancel Schedule"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Create Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { if (!saving) setShowModal(false); }}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">📅 New Collection Schedule</span>
              <button className="modal-close" onClick={() => setShowModal(false)} disabled={saving}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sch-date">Date</label>
                  <input
                    id="sch-date"
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="sch-slot">Time Slot</label>
                  <select
                    id="sch-slot"
                    value={form.timeSlot}
                    onChange={e => setForm(f => ({ ...f, timeSlot: e.target.value }))}
                    required
                  >
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="sch-zone">Zone</label>
                <select
                  id="sch-zone"
                  value={form.zoneId}
                  onChange={e => setForm(f => ({ ...f, zoneId: e.target.value }))}
                  required
                >
                  <option value="">— Select Zone —</option>
                  {zones.map(z => <option key={z.zoneId} value={z.zoneId}>{z.zoneName} {z.description ? `(${z.description})` : ''}</option>)}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sch-vehicle">Vehicle</label>
                  <select
                    id="sch-vehicle"
                    value={form.vehicleId}
                    onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))}
                    required
                  >
                    <option value="">— Select Vehicle —</option>
                    {vehicles.map(v => (
                      <option key={v.vehicleId} value={v.vehicleId} disabled={v.status !== 'AVAILABLE'}>
                        {v.vehicleNumber} — {v.type} {v.status !== 'AVAILABLE' ? `(${v.status})` : ''}
                      </option>
                    ))}
                  </select>
                  {available.length === 0 && (
                    <span style={{ fontSize: 12, color: 'var(--warning)' }}>⚠ No vehicles currently available</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="sch-staff">Driver / Staff</label>
                  <select
                    id="sch-staff"
                    value={form.staffId}
                    onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))}
                    required
                  >
                    <option value="">— Select Staff —</option>
                    {staff.map(s => (
                      <option key={s.staffId} value={s.staffId}>
                        {s.user?.name ?? `Staff #${s.staffId}`} — {s.designation}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button id="btn-save-schedule" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : '✓ Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal ── */}
      {deleteId !== null && (
        <div className="modal-overlay" onClick={() => { if (!deleting) setDeleteId(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <span className="modal-title">Cancel Schedule?</span>
              <button className="modal-close" onClick={() => setDeleteId(null)} disabled={deleting}>✕</button>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
              This will permanently remove the schedule. The driver will no longer see this task.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)} disabled={deleting}>Keep</button>
              <button
                id="btn-confirm-delete-schedule"
                className="btn btn-danger"
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
              >
                {deleting ? 'Cancelling…' : '🗑 Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
