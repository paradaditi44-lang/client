import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    localStorage.getItem("travexaUserEmail") || ""
  );

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    /*
      Frontend login for now.
      Backend authentication can replace this later.
    */

    localStorage.setItem("travexaLoggedIn", "true");

    /*
      If username doesn't exist for some reason,
      create a default name from email.
    */
    if (!localStorage.getItem("travexaUserName")) {

      const emailName = email
        .split("@")[0]
        .replace(/[0-9]/g, "")
        .trim();

      const defaultName =
        emailName.charAt(0).toUpperCase() +
        emailName.slice(1);

      localStorage.setItem(
        "travexaUserName",
        defaultName || "Traveller"
      );
    }

    localStorage.setItem("travexaUserEmail", email);

    /* Login → Plan Trip */
    navigate("/plan-trip");
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