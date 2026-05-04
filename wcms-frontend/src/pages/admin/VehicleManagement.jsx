import { useEffect, useState } from 'react';
import api from '../../api/axios';

const STATUS_OPTIONS = ['AVAILABLE', 'IN_USE', 'MAINTENANCE'];

function VehicleModal({ vehicle, onClose, onSaved }) {
  const [form, setForm] = useState({
    vehicleNumber: vehicle?.vehicleNumber || '',
    type: vehicle?.type || '',
    status: vehicle?.status || 'AVAILABLE',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (vehicle) await api.put(`/api/vehicles/${vehicle.vehicleId}`, form);
      else         await api.post('/api/vehicles', form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vehicle');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{vehicle ? 'Edit Vehicle' : 'Register Vehicle'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label>Vehicle Number *</label>
              <input value={form.vehicleNumber} onChange={e => set('vehicleNumber', e.target.value)} placeholder="e.g. MH12AB1234" required />
            </div>
            <div className="form-group">
              <label>Type</label>
              <input value={form.type} onChange={e => set('type', e.target.value)} placeholder="e.g. Compactor" />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Vehicle'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetch = () => {
    setLoading(true);
    api.get('/api/vehicles').then(r => setVehicles(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const handleDelete = async (v) => {
    if (!confirm(`Delete vehicle "${v.vehicleNumber}"?`)) return;
    try { await api.delete(`/api/vehicles/${v.vehicleId}`); fetch(); }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const statusBadge = (s) => {
    const cls = s === 'AVAILABLE' ? 'available' : s === 'IN_USE' ? 'in_use' : 'maintenance';
    return <span className={`badge badge-${cls}`}>{s.replace('_', ' ')}</span>;
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <div>
          <div className="page-title">Vehicle Management</div>
          <div className="page-subtitle">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered</div>
        </div>
        <button className="btn btn-primary" id="btn-add-vehicle" onClick={() => setModal('add')}>+ Register Vehicle</button>
      </div>

      {loading ? <div className="loading" /> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Vehicle No.</th><th>Type</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.vehicleId}>
                  <td style={{ color: 'var(--text-3)', fontFamily: 'monospace' }}>{v.vehicleId}</td>
                  <td><strong>{v.vehicleNumber}</strong></td>
                  <td style={{ color: 'var(--text-2)' }}>{v.type || '—'}</td>
                  <td>{statusBadge(v.status)}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-sm btn-secondary" id={`btn-edit-vehicle-${v.vehicleId}`} onClick={() => setModal(v)}>Edit</button>
                      <button className="btn btn-sm btn-danger" id={`btn-delete-vehicle-${v.vehicleId}`} onClick={() => handleDelete(v)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && <tr className="empty-row"><td colSpan={5}>No vehicles registered yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <VehicleModal
          vehicle={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetch(); }}
        />
      )}
    </div>
  );
}
