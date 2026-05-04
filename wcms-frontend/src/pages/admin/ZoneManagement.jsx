import { useEffect, useState } from 'react';
import api from '../../api/axios';

function ZoneModal({ zone, onClose, onSaved }) {
  const [form, setForm] = useState({ zoneName: zone?.zoneName || '', description: zone?.description || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (zone) await api.put(`/api/zones/${zone.zoneId}`, form);
      else       await api.post('/api/zones', form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save zone');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{zone ? 'Edit Zone' : 'Add Zone'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Zone Name *</label>
            <input value={form.zoneName} onChange={e => setForm(p => ({...p, zoneName: e.target.value}))} placeholder="e.g. North Ward" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Optional description..." rows={3} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Zone'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ZoneManagement() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | zone-object

  const fetch = () => {
    setLoading(true);
    api.get('/api/zones').then(r => setZones(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const handleDelete = async (z) => {
    if (!confirm(`Delete zone "${z.zoneName}"?`)) return;
    try { await api.delete(`/api/zones/${z.zoneId}`); fetch(); }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const handleSaved = () => { setModal(null); fetch(); };

  return (
    <div className="management-page">
      <div className="page-header">
        <div>
          <div className="page-title">Zone Management</div>
          <div className="page-subtitle">{zones.length} zone{zones.length !== 1 ? 's' : ''} configured</div>
        </div>
        <button className="btn btn-primary" id="btn-add-zone" onClick={() => setModal('add')}>+ Add Zone</button>
      </div>

      {loading ? <div className="loading" /> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Zone Name</th><th>Description</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {zones.map(z => (
                <tr key={z.zoneId}>
                  <td style={{ color: 'var(--text-3)', fontFamily: 'monospace' }}>{z.zoneId}</td>
                  <td><strong>{z.zoneName}</strong></td>
                  <td style={{ color: 'var(--text-2)' }}>{z.description || '—'}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-sm btn-secondary" id={`btn-edit-zone-${z.zoneId}`} onClick={() => setModal(z)}>Edit</button>
                      <button className="btn btn-sm btn-danger" id={`btn-delete-zone-${z.zoneId}`} onClick={() => handleDelete(z)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {zones.length === 0 && <tr className="empty-row"><td colSpan={4}>No zones yet. Click "Add Zone" to get started.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <ZoneModal
          zone={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
