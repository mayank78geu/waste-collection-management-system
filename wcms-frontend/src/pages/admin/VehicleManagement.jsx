// VehicleManagement.jsx — Stub (to be fully implemented in Increment 1)
import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = () => {
    api.get('/api/vehicles')
      .then(res => setVehicles(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this vehicle?')) return;
    await api.delete(`/api/vehicles/${id}`);
    fetchVehicles();
  };

  if (loading) return <div className="loading">Loading vehicles...</div>;

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>Vehicle Management</h2>
        <button className="btn btn-primary" id="btn-add-vehicle">+ Register Vehicle</button>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Vehicle No.</th><th>Type</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {vehicles.map(v => (
            <tr key={v.vehicleId}>
              <td>{v.vehicleId}</td>
              <td>{v.vehicleNumber}</td>
              <td>{v.type || '—'}</td>
              <td><span className={`badge badge-${v.status?.toLowerCase()}`}>{v.status}</span></td>
              <td>
                <button className="btn btn-sm btn-secondary" id={`btn-edit-vehicle-${v.vehicleId}`}>Edit</button>
                <button className="btn btn-sm btn-danger" id={`btn-delete-vehicle-${v.vehicleId}`} onClick={() => handleDelete(v.vehicleId)}>Delete</button>
              </td>
            </tr>
          ))}
          {vehicles.length === 0 && <tr><td colSpan={5}>No vehicles registered.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
