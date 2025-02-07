import React, { useState } from "react";

const SubmitClaim = () => {
  const [formData, setFormData] = useState({
    policy_id: "",
    claim_date: "",
    amount: "",
    description: "",
  });

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit claim form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
      // eslint-disable-next-line
      const data = await response.json();
      setMessage("Claim submitted successfully!");
      setFormData({
        policy_id: "",
        claim_date: "",
        amount: "",
        description: "",
      });
    } catch (err) {
      setError(err.message || "An error occurred while submitting the claim.");
    }
  };

  return (
    <div className="container">
      <h2>Submit a Claim</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="claim-form">
        <div className="form-group">
          <label>Policy ID:</label>
          <input
            type="text"
            name="policy_id"
            value={formData.policy_id}
            placeholder="Copy from your policy"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Claim Date:</label>
          <input
            type="date"
            name="claim_date"
            value={formData.claim_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Claim Amount:</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
          ></textarea>
        </div>

        <button type="submit" className="submit-button">
          Submit Claim
        </button>
      </form>

      <style>{`
        .container {
          max-width: 450px;
          margin: auto;
          padding: 20px;
          background: #ebebeb;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        h2 {
          text-align: center;
          color: #333;
        }

        .success-message {
          color: green;
          text-align: center;
        }

        .error-message {
          color: red;
          text-align: center;
        }

        .claim-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: bold;
          margin-bottom: 5px;
        }

        .form-group input,
        .form-group textarea {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 16px;
          transition: 0.3s ease-in-out;
          background-color: whitesmoke;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #ebebeb;
          box-shadow: 0 0 5px #45474a;
          outline: none;
        }

        .submit-button {
          padding: 12px;
          background-color: #45474a;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          transition: 0.3s ease-in-out;
        }

        .submit-button:hover {
          background-color: black;
        }
      `}</style>
    </div>
  );
};

export default SubmitClaim;
