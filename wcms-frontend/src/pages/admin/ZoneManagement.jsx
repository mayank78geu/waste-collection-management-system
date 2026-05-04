// ZoneManagement.jsx — Stub (to be fully implemented in Increment 1)
// Provides: list zones, add zone modal, edit zone, delete zone

import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ZoneManagement() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchZones = () => {
    api.get('/api/zones')
      .then(res => setZones(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchZones(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this zone?')) return;
    await api.delete(`/api/zones/${id}`);
    fetchZones();
  };

  if (loading) return <div className="loading">Loading zones...</div>;

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>Zone Management</h2>
        <button className="btn btn-primary" id="btn-add-zone">+ Add Zone</button>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Zone Name</th><th>Description</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {zones.map(z => (
            <tr key={z.zoneId}>
              <td>{z.zoneId}</td>
              <td>{z.zoneName}</td>
              <td>{z.description || '—'}</td>
              <td>
                <button className="btn btn-sm btn-secondary" id={`btn-edit-zone-${z.zoneId}`}>Edit</button>
                <button className="btn btn-sm btn-danger" id={`btn-delete-zone-${z.zoneId}`} onClick={() => handleDelete(z.zoneId)}>Delete</button>
              </td>
            </tr>
          ))}
          {zones.length === 0 && <tr><td colSpan={4}>No zones found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
