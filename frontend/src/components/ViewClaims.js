import React, { useEffect, useState } from "react";

const ViewClaims = () => {
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch("http://localhost:5000/claims/userClaims", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token for authentication
          },
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = await response.json();
        setClaims(data); // Store claims in state
      } catch (err) {
        setError(err.message || "An error occurred while fetching claims.");
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  if (loading) {
    return <p>Loading claims...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (claims.length === 0) {
    return <p>No claims found.</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Claims</h2>
      <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {claims.map((claim) => (
          <div
            key={claim._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#cccccc"
            }}
          >
            <p><strong>Policy Id:</strong> {claim.policy_id?._id || "N/A"}</p>
            <p><strong>Claim Date:</strong> {new Date(claim.claim_date).toLocaleDateString()}</p>
            <p><strong>Amount:</strong> ${claim.amount.toFixed(2)}</p>
            <p><strong>Description:</strong> {claim.description}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color:
                    claim.status === "approved"
                      ? "green"
                      : claim.status === "rejected"
                      ? "red"
                      : "#007BFF",
                }}
              >
                {claim.status}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewClaims;
