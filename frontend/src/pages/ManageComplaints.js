import React, { useEffect, useState } from 'react';
import api from '../api/axios';

// ADMIN -> Manage Complaints: View All / Search / Filter / View Details / Update Status
const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (search) params.search = search;
      const { data } = await api.get('/complaints', { params });
      setComplaints(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const updateStatus = async (id, newStatus) => {
    setMessage('');
    try {
      await api.put(`/complaints/${id}/status`, { status: newStatus, adminNotes: notes });
      setMessage('Complaint updated');
      setSelected(null);
      setNotes('');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="card">
      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <input
          placeholder="Search title or description..."
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
      ) : complaints.length === 0 ? (
        <p className="muted">No complaints found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Submitted By</th>
              <th>Category</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c._id}>
                <td>{c.title}</td>
                <td>{c.submittedBy?.name}</td>
                <td>{c.category}</td>
                <td>
                  <span className={`badge badge-${c.status.replace(' ', '').toLowerCase()}`}>
                    {c.status}
                  </span>
                </td>
                <td>
                  <button className="btn-secondary" onClick={() => setSelected(c)}>
                    View / Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selected.title}</h3>
            <p className="muted">
              By {selected.submittedBy?.name} ({selected.submittedBy?.email}) &middot;{' '}
              {selected.category}
            </p>
            <p>{selected.description}</p>
            <label>Admin Notes</label>
            <textarea
              rows={3}
              defaultValue={selected.adminNotes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="actions">
              <button onClick={() => updateStatus(selected._id, 'In Progress')}>
                Mark In Progress
              </button>
              <button onClick={() => updateStatus(selected._id, 'Resolved')}>
                Mark Resolved
              </button>
              <button className="btn-danger" onClick={() => updateStatus(selected._id, 'Rejected')}>
                Reject
              </button>
              <button className="btn-secondary" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageComplaints;
