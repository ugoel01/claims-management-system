import React from "react";
import { Link, Routes, Route, Outlet, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import BuyPolicy from "../components/BuyPolicy"; 
import ViewPolicies from "../components/ViewPolicies";
import SubmitClaim from "../components/SubmitClaim";
import ViewClaims from "../components/ViewClaims"; 

const Dashboard = () => {
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
          <li><Link to="/dashboard/buy-policy">Buy a Policy</Link></li>
          <li><Link to="/dashboard/view-policies">View All Policies</Link></li>
          <li><Link to="/dashboard/submit-claim">Submit a Claim</Link></li>
          <li><Link to="/dashboard/view-claims">View Submitted Claims</Link></li>
          <li><p onClick={handleLogout} className="logout-button">Logout</p></li>
        </ul>
      </div>

      <div className="content">
        <Routes>
          <Route path="/" element={<div>Welcome to the Dashboard!</div>} />
          <Route path="buy-policy" element={<BuyPolicy />} />
          <Route path="view-policies" element={<ViewPolicies />} />
          <Route path="submit-claim" element={<SubmitClaim />} />
          <Route path="view-claims" element={<ViewClaims />} />
        </Routes>
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
