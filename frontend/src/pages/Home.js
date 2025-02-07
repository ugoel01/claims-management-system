import React, { useState, useEffect } from "react";
import "./Home.css"; // Import the CSS file
import Register from "../components/Register";
import Login from "../components/Login"; 

const Home = () => {
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  // eslint-disable-next-line
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch data from backend
    fetch("http://localhost:5000/") // Backend API URL
      .then((response) => response.text()) // Expect text response
      .then((data) => setMessage(data)) // Set message from backend
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleSignupClick = () => {
    setShowSignupForm(true);
  };

  const handleLoginClick = () => {
    setShowLoginForm(true);
  };

  const handleCloseForm = () => {
    setShowSignupForm(false);
    setShowLoginForm(false);
  };

  return (
    <div className="home-container">
      <header className="hero">
        <h1>Quick Claims - A Claims Management System</h1>
        <p>To get started Login/SignUp First.</p>
        <button className="cta-button-1" onClick={handleLoginClick}>Login</button>
        <button className="cta-button-2" onClick={handleSignupClick}>Signup</button>
      </header>

      <section className="features">
        <h2>Key Features</h2>
        <div className="features-container">
          <div className="feature-box">
            <h3>Submit Claims</h3>
            <p>Easily submit and track insurance claims online.</p>
          </div>
          <div className="feature-box">
            <h3>Real-time Updates</h3>
            <p>Receive real-time email notifications on status update.</p>
          </div>
          <div className="feature-box">
            <h3>Buy Policy</h3>
            <p>Purchase from an exclusive list of policies.</p>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="cta">
        <h2>About Us</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean feugiat
          viverra nulla. Class aptent taciti sociosqu ad litora torquent per conubia
          nostra, per inceptos himenaeos. In hac habitasse platea dictumst.
          Suspendisse viverra bibendum orci sed convallis. Cras pharetra aliquam nisl,
          nec blandit odio posuere sit amet. In volutpat condimentum velit.
        </p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Claims Management System. All Rights Reserved.</p>
      </footer>

      {/* Render Forms */}
      {showSignupForm && <Register onClose={handleCloseForm} />}
      {showLoginForm && <Login onClose={handleCloseForm} />}
    </div>
  );
};

export default Home;
