import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_CLASS = {
  Pending: 'badge badge-pending',
  'In Progress': 'badge badge-progress',
  Resolved: 'badge badge-resolved',
  Rejected: 'badge badge-rejected',
};

// USER DASHBOARD -> Submit Complaint / User tracks status
const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: 'General' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/complaints/my');
      setComplaints(data);
    } catch (err) {
      setError('Could not load your complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/complaints', form);
      setMessage('Complaint submitted (status: Pending)');
      setForm({ title: '', description: '', category: 'General' });
      loadComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    }
  };

  return (
    <div className="container">
      <div className="topbar">
        <h2>User Dashboard</h2>
        <div>
          <span className="muted">Signed in as {user?.name}</span>
          <button className="btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Submit Complaint</h3>
          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}
          <form onSubmit={handleSubmit}>
            <label>Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <label>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option>General</option>
              <option>Academic</option>
              <option>Hostel</option>
              <option>Facilities</option>
              <option>Faculty</option>
              <option>Other</option>
            </select>
            <label>Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <button type="submit">Submit Complaint</button>
          </form>
        </div>

        <div className="card">
          <h3>My Complaints (Track Status)</h3>
          {loading ? (
            <p>Loading...</p>
          ) : complaints.length === 0 ? (
            <p className="muted">No complaints submitted yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id}>
                    <td>{c.title}</td>
                    <td>{c.category}</td>
                    <td>
                      <span className={STATUS_CLASS[c.status] || 'badge'}>{c.status}</span>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
