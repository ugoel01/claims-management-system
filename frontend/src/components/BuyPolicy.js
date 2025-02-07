import React, { useEffect, useState } from "react";

const BuyPolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch all policies from the backend
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await fetch("http://localhost:5000/policies");
        if (!response.ok) {
          throw new Error("Failed to fetch policies");
        }
        const data = await response.json();
        setPolicies(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPolicies();
  }, []);

  // Function to handle policy purchase
  const handleBuyPolicy = async (policyId) => {
    try {
      const response = await fetch(`http://localhost:5000/policies/buy/${policyId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming token is stored in localStorage
        },
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Policies</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {policies.length > 0 ? (
          policies.map((policy) => (
            <div
              key={policy._id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                width: "300px",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#cccccc"
              }}
            >
              <h4>{policy.name}</h4>
              <p>
                <strong>Description:</strong> {policy.description}
              </p>
              <p>
                <strong>Coverage Amount:</strong> ${policy.premium_amount}
              </p>
              <p>
                <strong>Policy End Date:</strong> {new Date(policy.policy_end_date).toLocaleDateString()}
              </p>
              <button
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#45474a",
                  color: "#cccccc",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => handleBuyPolicy(policy._id)}
              >
                Buy
              </button>
            </div>
          ))
        ) : (
          <p>No policies available to purchase.</p>
        )}
      </div>
    </div>
  );
};

export default BuyPolicy;
