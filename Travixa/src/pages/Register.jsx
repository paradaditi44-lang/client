import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

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

    try {
      const response = await API.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password: password,
      });

      setSuccess(response.data?.message || "User registered successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.message) {
          setError(data.message);
        } else if (data.errors && Array.isArray(data.errors)) {
          const errorMsgs = data.errors.map((e) => e.msg || e.message).join(", ");
          setError(errorMsgs || "Validation error");
        } else {
          setError("Server error");
        }
      } else {
        setError("Server error");
      }
    }
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

          {success && (
            <div
              className="register-success"
              style={{
                padding: "12px 15px",
                marginBottom: "18px",
                borderRadius: "10px",
                background: "#ecfdf5",
                color: "#059669",
                fontSize: "14px",
              }}
            >
              {success}
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