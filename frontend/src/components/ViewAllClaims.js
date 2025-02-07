import React, { useEffect, useState } from "react";
import "./ViewAllClaims.css"; // Import the CSS file

function ViewAllClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch("http://localhost:5000/claims", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch claims");
        }

        const data = await response.json();
        // Filter out claims that are not pending
        const pendingClaims = data.filter((claim) => claim.status === "pending");
        setClaims(pendingClaims);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const handleUpdateStatus = async (claimId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/claims/${claimId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update claim status");
      }

      const updatedClaim = await response.json();

      // Remove the updated claim from the UI if it is no longer pending
      setClaims((prevClaims) =>
        prevClaims.filter((claim) => claim._id !== updatedClaim._id)
      );
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  if (loading) return <p>Loading claims...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container">
      {claims.map((claim) => (
        <div key={claim._id} className="card">
          <h3>Claim ID: {claim._id}</h3>
          <p><strong>User:</strong> {claim.user_id?.username || "N/A"}</p>
          <p><strong>Policy Name:</strong> {claim.policy_id?.name || "N/A"}</p>
          <p><strong>Policy End Date:</strong> {new Date(claim.policy_id?.policy_end_date).toLocaleDateString() || "N/A"}</p>
          <p><strong>Claim Date:</strong> {new Date(claim.claim_date).toLocaleDateString()}</p>
          <p><strong>Claim Amount:</strong> ${claim.amount}</p>
          <p><strong>Coverage Amount:</strong> ${claim.policy_id?.premium_amount || "N/A"}</p>
          <p><strong>Description:</strong> {claim.description}</p>
          <p><strong>Status:</strong> {claim.status}</p>
          <div className="actions">
            <button
              className="approve-btn"
              onClick={() => handleUpdateStatus(claim._id, "approved")}
              disabled={claim.status !== "pending"}
            >
              Approve
            </button>
            <button
              className="reject-btn"
              onClick={() => handleUpdateStatus(claim._id, "rejected")}
              disabled={claim.status !== "pending"}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ViewAllClaims;
