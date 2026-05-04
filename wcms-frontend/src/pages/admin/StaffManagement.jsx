// StaffManagement.jsx — Stub (to be fully implemented in Increment 1)
import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = () => {
    api.get('/api/staff')
      .then(res => setStaff(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Remove this staff member?')) return;
    await api.delete(`/api/staff/${id}`);
    fetchStaff();
  };

  if (loading) return <div className="loading">Loading staff...</div>;

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>Staff Management</h2>
        <button className="btn btn-primary" id="btn-add-staff">+ Add Staff</button>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Email</th><th>Designation</th><th>Zone</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {staff.map(s => (
            <tr key={s.staffId}>
              <td>{s.staffId}</td>
              <td>{s.user?.name}</td>
              <td>{s.user?.email}</td>
              <td>{s.designation || '—'}</td>
              <td>{s.zone?.zoneName || '—'}</td>
              <td>
                <button className="btn btn-sm btn-secondary" id={`btn-edit-staff-${s.staffId}`}>Edit</button>
                <button className="btn btn-sm btn-danger" id={`btn-delete-staff-${s.staffId}`} onClick={() => handleDelete(s.staffId)}>Remove</button>
              </td>
            </tr>
          ))}
          {staff.length === 0 && <tr><td colSpan={6}>No staff registered.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
