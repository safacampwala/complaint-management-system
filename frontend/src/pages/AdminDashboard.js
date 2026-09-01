import React from 'react';
import { Link, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ManageUsers from './ManageUsers';
import ManageComplaints from './ManageComplaints';

// ADMIN DASHBOARD -> Manage Users / Manage Complaints
const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <div className="topbar">
        <h2>Admin Dashboard</h2>
        <div>
          <span className="muted">Signed in as {user?.name}</span>
          <button className="btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="tabs">
        <Link to="/admin/users" className="tab">
          Manage Users
        </Link>
        <Link to="/admin/complaints" className="tab">
          Manage Complaints
        </Link>
      </div>

      <Routes>
        <Route index element={<Navigate to="users" replace />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="complaints" element={<ManageComplaints />} />
      </Routes>
    </div>
  );
};

export default AdminDashboard;
