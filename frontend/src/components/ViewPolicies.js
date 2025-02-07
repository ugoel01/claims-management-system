import React, { useEffect, useState } from "react";

const ViewPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [userPolicies, setUserPolicies] = useState([]);
  const [displayUserPolicies, setDisplayUserPolicies] = useState(false);
  const [error, setError] = useState(null);

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

  // Fetch user-purchased policies
  useEffect(() => {
    const fetchUserPolicies = async () => {
      try {
        const response = await fetch("http://localhost:5000/users/policies", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming the token is stored in localStorage
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user policies");
        }
        const data = await response.json();
        setUserPolicies(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserPolicies();
  }, []);

  // Filter policies to show only user's purchased policies
  const filteredPolicies = displayUserPolicies
    ? policies.filter((policy) =>
        userPolicies.some((userPolicy) => userPolicy._id === policy._id)
      )
    : policies;

  return (
    <div style={{ padding: "20px" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="policy-filter" style={{ marginRight: "10px" }}>
          Show:
        </label>
        <select
          id="policy-filter"
          onChange={(e) => setDisplayUserPolicies(e.target.value === "user")}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          <option value="all">All Policies</option>
          <option value="user">My Policies</option>
        </select>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {filteredPolicies.length > 0 ? (
          filteredPolicies.map((policy) => (
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
                <strong>ID:</strong> {policy._id}
              </p>
              <p>
                <strong>Description:</strong> {policy.description}
              </p>
              <p>
                <strong>Coverage Amount:</strong> ${policy.premium_amount}
              </p>
              <p>
                <strong>Policy End Date:</strong>{" "}
                {new Date(policy.policy_end_date).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p>No policies found.</p>
        )}
      </div>
    </div>
  );
};

export default ViewPolicies;
