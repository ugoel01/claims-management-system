import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./Register.css";  

const Login = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); 

  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token); 
        localStorage.setItem("user", JSON.stringify(data.user)); 
        
        // Redirect based on role
        if (data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        setMessage(data.message || "Invalid credentials"); 
      }
    } catch (error) {
      setMessage("Error during login.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="signup-modal">
      <div className="signup-form">
        <div className="company-name">Quick Claims</div>

        <h2>Login</h2>
        {message && <p className="message">{message}</p>} 

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="8"
            />
          </div>
          <button type="submit" className="signup-button">Login</button>
        </form>
        <button type="button" className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Login;
