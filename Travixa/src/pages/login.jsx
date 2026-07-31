import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import API from "../api/api";


function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    localStorage.getItem("travexaUserEmail") || ""
  );

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  if (!email.trim()) {
    setError("Please enter your email.");
    return;
  }

  if (!password.trim()) {
    setError("Please enter your password.");
    return;
  }

  try {
    const response = await API.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    // Save authentication
    localStorage.setItem("travexaToken", token);
    localStorage.setItem("travexaLoggedIn", "true");

    // Save user details
    localStorage.setItem("travexaUserName", user.name);
    localStorage.setItem("travexaUserEmail", user.email);

    navigate("/dashboard");
  } catch (err) {
    if (err.response) {
      setError(err.response.data.message || "Login failed");
    } else {
      setError("Unable to connect to server.");
    }
  }
};


  return (
    <main className="login-page">

      {/* LEFT TRAVEL IMAGE */}

      <div className="login-image-section">

        <div className="login-image-overlay"></div>

        <div className="login-image-content">

          <div className="login-logo">
            ✈️ Travexa
          </div>

          <div className="login-travel-icon">
            🌍
          </div>

          <h1>
            Welcome
            <br />
            <span>Back</span>
          </h1>

          <p>
            Your next adventure is waiting.
            Sign in to continue planning smarter
            journeys with Travexa.
          </p>

          <div className="login-tags">

            <span>🗺️ Plan</span>

            <span>🏨 Discover</span>

            <span>✈️ Explore</span>

          </div>

        </div>

      </div>


      {/* LOGIN FORM */}

      <div className="login-form-section">

        <div className="login-card">

          <div className="login-icon">
            🔐
          </div>

          <h2>Welcome Back</h2>

          <p className="login-subtitle">
            Login to your Travexa account
          </p>


          {error && (
            <div className="login-error">
              {error}
            </div>
          )}


          <form onSubmit={handleLogin}>

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

            <button type="submit">
              Login to Travexa →
            </button>

          </form>


          <p className="login-register-text">
            Don't have an account?

            <button
              type="button"
              onClick={() => navigate("/register")}
            >
              Create Account
            </button>

          </p>

        </div>

      </div>

    </main>
  );
}

export default Login;