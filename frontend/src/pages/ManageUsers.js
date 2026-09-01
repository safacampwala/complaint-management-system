import React, { useEffect, useState } from 'react';
import api from '../api/axios';

// ADMIN -> Manage Users: View Pending Users / Approve / Reject / Activate-Deactivate / Roles
const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;
      const { data } = await api.get('/users', { params });
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const act = async (action, id, body) => {
    setMessage('');
    try {
      if (action === 'approve') await api.put(`/users/${id}/approve`);
      if (action === 'reject') await api.put(`/users/${id}/reject`);
      if (action === 'status') await api.put(`/users/${id}/status`, body);
      if (action === 'role') await api.put(`/users/${id}/role`, body);
      setMessage('Updated successfully');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="card">
      <div className="toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="pending">Pending Users</option>
          <option value="active">Active Users</option>
          <option value="deactivated">Deactivated Users</option>
          <option value="rejected">Rejected Users</option>
          <option value="all">All Users</option>
        </select>
        <input
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <button className="btn-secondary" onClick={load}>
          Search
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p className="muted">No users found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => act('role', u._id, { role: e.target.value })}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <span className={`badge badge-${u.status}`}>{u.status}</span>
                </td>
                <td className="actions">
                  {u.status === 'pending' && (
                    <>
                      <button onClick={() => act('approve', u._id)}>Approve</button>
                      <button className="btn-danger" onClick={() => act('reject', u._id)}>
                        Reject
                      </button>
                    </>
                  )}
                  {u.status === 'active' && (
                    <button
                      className="btn-danger"
                      onClick={() => act('status', u._id, { status: 'deactivated' })}
                    >
                      Deactivate
                    </button>
                  )}
                  {u.status === 'deactivated' && (
                    <button onClick={() => act('status', u._id, { status: 'active' })}>
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsers;
