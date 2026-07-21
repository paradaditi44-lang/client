import "../styles/Register.css";

function Register() {
  return (
    <div className="register-page">

      {/* Left Side */}

      <div className="register-left">

        <div className="register-left-content">

          <h1>✈️ Travexa</h1>

          <h2>Start Your Journey Today</h2>

          <p>
            Join Travexa and explore the world with AI-powered travel planning,
            personalized itineraries, hotel recommendations, and live weather updates.
          </p>

        </div>

      </div>

      {/* Right Side */}

      <div className="register-right">

        <div className="register-box">

          <div className="user-icon">👤</div>

          <h2>Create Account</h2>

          <p>Create your Travexa account</p>

          <input
            type="text"
            placeholder="Full Name"
          />

          <input
            type="email"
            placeholder="Email Address"
          />

          <input
            type="password"
            placeholder="Password"
          />

          <input
            type="password"
            placeholder="Confirm Password"
          />

          <button>Create Account</button>

          <span>
            Already have an account?
            <a href="#"> Login</a>
          </span>

        </div>

      </div>

    </div>
  );
}

export default Register;