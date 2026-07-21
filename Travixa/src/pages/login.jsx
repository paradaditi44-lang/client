import "../styles/Login.css";

function Login() {
  return (
    <div className="login-page">

     <div className="login-left">
    <div className="login-left-content">
        <h1>✈️ Travexa</h1>
        <h2>Travel Smarter with AI</h2>

        <p>
            Plan your dream vacation with personalized AI itineraries,
            discover amazing destinations, book hotels, and get live
            weather updates — all in one place.
        </p>
    </div>
</div>
      <div className="login-right">

        <div className="login-box">

          <h2>Welcome Back 👋</h2>

          <p>Login to continue your journey.</p>

          <input
            type="email"
            placeholder="Enter your email"
          />

          <input
            type="password"
            placeholder="Enter your password"
          />

          <button>Login</button>

          <span>
            Don't have an account?
            <a href="#"> Register</a>
          </span>

        </div>

      </div>

    </div>
  );
}

export default Login;