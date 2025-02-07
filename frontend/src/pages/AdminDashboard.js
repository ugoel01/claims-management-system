import React from "react";
import { Link, Routes, Route, Outlet, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import ViewAllPolicies from "../components/ViewAllPolicies";
import ViewAllClaims from "../components/ViewAllClaims"; 

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <ul>
          <li><Link to="/admin-dashboard/view-policies">View All Policies</Link></li>
          <li><Link to="/admin-dashboard/view-claims">View All Claims</Link></li>
          <li><p onClick={handleLogout} className="logout-button">Logout</p></li>
        </ul>
      </div>

      <div className="content">
        <Routes>
          <Route path="/" element={<div>Welcome Admin!</div>} />
          <Route path="view-policies" element={<ViewAllPolicies />} />
          <Route path="view-claims" element={<ViewAllClaims />} />
        </Routes>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
