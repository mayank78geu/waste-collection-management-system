import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';

const STATUS_META = {
  OPEN:        { label: 'Open',        color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.3)'  },
  IN_PROGRESS: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  RESOLVED:    { label: 'Resolved',    color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.OPEN;
  return (
    <span className="complaint-status-badge" style={{ color: m.color, background: m.bg, border: `1px solid ${m.border}` }}>
      {m.label}
    </span>
  );
}

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [zones, setZones] = useState([]);
  const [filterZone, setFilterZone] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Confirm delete
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterZone) params.zone = filterZone;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/api/complaints', { params });
      setComplaints(res.data.data || []);
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [filterZone, filterStatus]);

  useEffect(() => {
    api.get('/api/zones').then(r => setZones(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const openModal = (c) => {
    setSelected(c);
    setNewStatus(c.status);
    setResolution(c.resolution || '');
    setError('');
  };
  const closeModal = () => { setSelected(null); setError(''); };

  const handleUpdate = async () => {
    if (!newStatus) return;
    setSaving(true);
    setError('');
    try {
      await api.put(`/api/complaints/${selected.complaintId}/status`, {
        status: newStatus,
        resolution: resolution || null,
      });
      closeModal();
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  // Stats
  const counts = complaints.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {});

  return (
    <div className="management-page">
      {/* ── Stats ── */}
      <div className="summary-cards" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total',       value: complaints.length, icon: '📋', cls: 'blue'   },
          { label: 'Open',        value: counts.OPEN || 0,  icon: '🔴', cls: 'amber'  },
          { label: 'In Progress', value: counts.IN_PROGRESS || 0, icon: '🟡', cls: 'purple' },
          { label: 'Resolved',    value: counts.RESOLVED || 0,    icon: '🟢', cls: 'green'  },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon-wrap ${s.cls}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Header + Filters ── */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title">Complaint Management</div>
          <div className="page-subtitle">Review and resolve citizen complaints</div>
        </div>
        <div className="filter-row">
          <select
            id="filter-zone"
            value={filterZone}
            onChange={e => setFilterZone(e.target.value)}
            style={{ minWidth: 160 }}
          >
            <option value="">All Zones</option>
            {zones.map(z => <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>)}
          </select>
          <select
            id="filter-status"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ minWidth: 140 }}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <button className="btn btn-secondary btn-sm" onClick={fetchComplaints} id="btn-refresh-complaints">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="table-wrap">
        {loading ? (
          <div className="loading">Loading complaints…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Zone</th>
                <th>Description</th>
                <th>Status</th>
                <th>Resolution</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr className="empty-row"><td colSpan={6}>No complaints found for the selected filters.</td></tr>
              ) : complaints.map(c => (
                <tr key={c.complaintId}>
                  <td>
                    <code style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'monospace' }}>
                      {c.trackingCode}
                    </code>
                  </td>
                  <td>📍 {c.zone?.zoneName || '—'}</td>
                  <td style={{ maxWidth: 260 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}
                          title={c.description}>
                      {c.description}
                    </span>
                  </td>
                  <td><StatusBadge status={c.status} /></td>
                  <td style={{ maxWidth: 200 }}>
                    {c.resolution
                      ? <span style={{ color: 'var(--success)', fontSize: 12 }}>✅ {c.resolution}</span>
                      : <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>}
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openModal(c)} id={`btn-update-${c.complaintId}`}>
                        ✏️ Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Update Modal ── */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <span className="modal-title">Update Complaint</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="complaint-detail-block">
              <div style={{ marginBottom: 6 }}>
                <code style={{ color: 'var(--accent)', fontFamily: 'monospace', fontSize: 13 }}>{selected.trackingCode}</code>
                <span style={{ marginLeft: 10 }}><StatusBadge status={selected.status} /></span>
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: 13.5, marginTop: 6, lineHeight: 1.5 }}>{selected.description}</p>
              <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 4 }}>📍 {selected.zone?.zoneName}</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label>Status</label>
              <select id="modal-status" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div className="form-group">
              <label>Resolution Notes {newStatus !== 'RESOLVED' && <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span>}</label>
              <textarea
                id="modal-resolution"
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                rows={3}
                placeholder="Describe the action taken to resolve this issue…"
                required={newStatus === 'RESOLVED'}
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={saving} id="btn-save-complaint-status">
                {saving ? 'Saving…' : '✓ Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
