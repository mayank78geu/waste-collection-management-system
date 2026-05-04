import { useEffect, useState } from 'react';
import api from '../../api/axios';

function StaffModal({ staff, users, zones, onClose, onSaved }) {
  const [form, setForm] = useState({
    userId:      staff?.user?.userId  || '',
    zoneId:      staff?.zone?.zoneId  || '',
    designation: staff?.designation   || '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const body = {
        userId:      parseInt(form.userId),
        zoneId:      form.zoneId ? parseInt(form.zoneId) : null,
        designation: form.designation,
      };
      if (staff) await api.put(`/api/staff/${staff.staffId}`, body);
      else        await api.post('/api/staff', body);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save staff');
    } finally { setLoading(false); }
  };

  const availableUsers = users.filter(u => u.role === 'DRIVER' || u.role === 'SUPERVISOR');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{staff ? 'Edit Staff' : 'Add Staff Member'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Linked User Account *</label>
            <select value={form.userId} onChange={e => set('userId', e.target.value)} required disabled={!!staff}>
              <option value="">Select a user...</option>
              {availableUsers.map(u => (
                <option key={u.userId} value={u.userId}>{u.name} — {u.email} ({u.role})</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Designation</label>
              <input value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="e.g. Driver, Helper" />
            </div>
            <div className="form-group">
              <label>Assigned Zone</label>
              <select value={form.zoneId} onChange={e => set('zoneId', e.target.value)}>
                <option value="">None</option>
                {zones.map(z => <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Staff'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffManagement() {
  const [staff,   setStaff]   = useState([]);
  const [users,   setUsers]   = useState([]);
  const [zones,   setZones]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);

  const fetch = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/staff'),
      api.get('/api/users'),
      api.get('/api/zones'),
    ]).then(([s, u, z]) => {
      setStaff(s.data.data || []);
      setUsers(u.data.data || []);
      setZones(z.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const handleDelete = async (s) => {
    if (!confirm(`Remove ${s.user?.name} from staff?`)) return;
    try { await api.delete(`/api/staff/${s.staffId}`); fetch(); }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <div>
          <div className="page-title">Staff Management</div>
          <div className="page-subtitle">{staff.length} staff member{staff.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary" id="btn-add-staff" onClick={() => setModal('add')}>+ Add Staff</button>
      </div>

      {loading ? <div className="loading" /> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Email</th><th>Designation</th><th>Zone</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.staffId}>
                  <td style={{ color: 'var(--text-3)', fontFamily: 'monospace' }}>{s.staffId}</td>
                  <td><strong>{s.user?.name}</strong></td>
                  <td style={{ color: 'var(--text-2)' }}>{s.user?.email}</td>
                  <td>{s.designation || '—'}</td>
                  <td>
                    {s.zone
                      ? <span style={{ color: 'var(--accent)', fontSize: 13 }}>📍 {s.zone.zoneName}</span>
                      : <span style={{ color: 'var(--text-3)' }}>—</span>
                    }
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-sm btn-secondary" id={`btn-edit-staff-${s.staffId}`} onClick={() => setModal(s)}>Edit</button>
                      <button className="btn btn-sm btn-danger" id={`btn-delete-staff-${s.staffId}`} onClick={() => handleDelete(s)}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && <tr className="empty-row"><td colSpan={6}>No staff registered yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <StaffModal
          staff={modal === 'add' ? null : modal}
          users={users}
          zones={zones}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetch(); }}
        />
      )}
    </div>
  );
}
