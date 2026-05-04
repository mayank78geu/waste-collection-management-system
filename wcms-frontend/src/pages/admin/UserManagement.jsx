// UserManagement.jsx — Stub (to be fully implemented in Increment 1)
import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    api.get('/api/users')
      .then(res => setUsers(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/api/users/${id}`);
    fetchUsers();
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>User Management</h2>
        <button className="btn btn-primary" id="btn-add-user">+ Create User</button>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.userId}>
              <td>{u.userId}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td><span className={`badge badge-role-${u.role?.toLowerCase()}`}>{u.role}</span></td>
              <td>
                <button className="btn btn-sm btn-secondary" id={`btn-edit-user-${u.userId}`}>Edit</button>
                <button className="btn btn-sm btn-danger" id={`btn-delete-user-${u.userId}`} onClick={() => handleDelete(u.userId)}>Delete</button>
              </td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan={5}>No users found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
