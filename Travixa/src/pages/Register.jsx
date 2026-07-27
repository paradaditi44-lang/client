import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    /* Save user information */
    localStorage.setItem("travexaUserName", name.trim());
    localStorage.setItem("travexaUserEmail", email.trim());

    /*
      This is only frontend authentication for now.
      Your backend friend can replace this later.
    */
    localStorage.setItem("travexaRegistered", "true");

    /* After registration → Login */
    navigate("/login");
  };

  return (
    <main className="register-page">

      <div className="register-image-section">

        <div className="register-image-overlay"></div>

        <div className="register-image-content">

          <div className="register-logo">
            ✈️ Travexa
          </div>

          <div className="register-travel-icon">
            🌍
          </div>

          <h1>
            Start Your
            <br />
            <span>Journey</span>
            <br />
            Today
          </h1>

          <p>
            Join Travexa and explore the world with
            AI-powered travel planning, personalised
            itineraries, hotel recommendations and
            live travel information.
          </p>

        </div>

      </div>


      <div className="register-form-section">

        <div className="register-card">

          <div className="register-icon">
            👤
          </div>

          <h2>Create Account</h2>

          <p className="register-subtitle">
            Create your Travexa account
          </p>


          {error && (
            <div className="register-error">
              {error}
            </div>
          )}


          <form onSubmit={handleRegister}>

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button type="submit">
              Create Account
            </button>

          </form>


          <p className="register-login-text">
            Already have an account?
            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </p>

        </div>

      </div>

    </main>
  );
}

export default Register;