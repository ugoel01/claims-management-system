import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";

const ViewAllPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    premium_amount: "",
    policy_end_date: "",
  });

  // Fetch all policies from the backend
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

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Handle input change in form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (Add Policy)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/policies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create policy");
      }

      const newPolicy = await response.json();
      setPolicies([...policies, newPolicy]); // Add new policy to UI
      setShowForm(false);
      setFormData({ name: "", description: "", premium_amount: "", policy_end_date: "" }); // Reset form
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle policy deletion
  const handleDelete = async (policyId) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;

    try {
      const response = await fetch(`http://localhost:5000/policies/${policyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete policy");
      }

      alert("Policy deleted successfully");
      setPolicies(policies.filter((policy) => policy._id !== policyId)); // Remove deleted policy from UI
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>All Policies</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {policies.length > 0 ? (
          policies.map((policy) => (
            <div
              key={policy._id}
              style={{
                position: "relative",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                width: "300px",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#cccccc",
              }}
            >
              {/* Delete button in top-right corner */}
              <button
                onClick={() => handleDelete(policy._id)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <FaTrash color="black" size={18} />
              </button>

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
                <strong>Policy End Date:</strong> {new Date(policy.policy_end_date).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p>No policies found.</p>
        )}
      </div>

      {/* Floating Add Policy Button */}
      <button onClick={() => setShowForm(true)} className="add-policy-btn">
        +
      </button>

      {/* Floating Button Styles */}
      <style>{`
        .add-policy-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background-color: #45474a;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            display: flex;
            justify-content: center;
            align-items: center;
            transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .add-policy-btn:hover {
            background-color: black;
            transform: scale(1.1);
        }

        .add-policy-btn:active {
            transform: scale(0.95);
        }
      `}</style>

      {/* Popup Form for Adding Policy */}
{showForm && (
  <div className="popup-overlay">
    <div className="popup-container">
      <h3>Create Policy</h3>
      <form onSubmit={handleSubmit} className="popup-form">
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <label>Premium Amount:</label>
        <input
          type="number"
          name="premium_amount"
          value={formData.premium_amount}
          onChange={handleChange}
          required
        />

        <label>Policy End Date:</label>
        <input
          type="date"
          name="policy_end_date"
          value={formData.policy_end_date}
          onChange={handleChange}
          required
        />

        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>

      <button onClick={() => setShowForm(false)} className="cancel-btn">
        Cancel
      </button>
    </div>

    <style>{`
        /* Background Overlay */
        .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        /* Popup Container */
        .popup-container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            width: 350px;
            animation: fadeIn 0.3s ease-in-out;
        }

        /* Form Styling */
        .popup-form {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .popup-form label {
            font-weight: bold;
        }

        .popup-form input,
        .popup-form textarea {
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
            transition: 0.3s;
        }

        .popup-form input:focus,
        .popup-form textarea:focus {
            border-color: #ebebebb;
            box-shadow: black;
            outline: none;
        }

        /* Buttons */
        .submit-btn {
            padding: 12px;
            background-color: #45474a;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: 0.3s;
        }

        .submit-btn:hover {
            background-color: black;
        }

        .cancel-btn {
            margin-top: 10px;
            padding: 12px;
            background-color: red;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
            transition: 0.3s;
        }

        .cancel-btn:hover {
            background-color: darkred;
        }

        /* Fade-in Animation */
        @keyframes fadeIn {
            from {
            opacity: 0;
            transform: translateY(-10px);
            }
            to {
            opacity: 1;
            transform: translateY(0);
            }
        }
        `}</style>
  </div>
)}
    </div>
  );
};

export default ViewAllPolicies;
