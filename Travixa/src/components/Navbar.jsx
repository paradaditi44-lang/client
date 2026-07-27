import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {

  const navigate = useNavigate();
  const location = useLocation();

  const loggedIn =
    localStorage.getItem("travexaLoggedIn") === "true";

  const userName =
    localStorage.getItem("travexaUserName") || "Traveller";


  const handleLogout = () => {

    localStorage.removeItem("travexaLoggedIn");

    navigate("/");

    window.location.reload();
  };


  const handlePlanTrip = () => {

    if (loggedIn) {
      navigate("/plan-trip");
    } else {
      navigate("/register");
    }

  };


  return (

    <nav className="navbar">

      {/* LOGO */}

      <div
        className="navbar-logo"
        onClick={() => navigate("/")}
      >
        ✈️ Travexa
      </div>


      {/* MENU */}

      <div className="navbar-menu">

        <button
          className={location.pathname === "/" ? "active" : ""}
          onClick={() => navigate("/")}
        >
          Home
        </button>


        <button
          className={
            location.pathname === "/plan-trip"
              ? "active"
              : ""
          }
          onClick={handlePlanTrip}
        >
          Plan Trip
        </button>


        <button onClick={() => navigate("/hotels")}>
          Hotels
        </button>


        <button onClick={() => navigate("/weather")}>
          Weather
        </button>


        <button onClick={() => navigate("/maps")}>
          Maps
        </button>


        <button onClick={() => navigate("/about")}>
          About
        </button>

      </div>


      {/* RIGHT SIDE */}

      <div className="navbar-right">

        {loggedIn ? (

          <>
            {/* SMALL PROFILE */}

            <button
              className="navbar-profile"
              onClick={() => navigate("/profile")}
              title="Profile"
            >
              <span className="profile-icon">
                👤
              </span>

              <span className="profile-name">
                {userName}
              </span>
            </button>


            {/* LOGOUT */}

            <button
              className="navbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>

        ) : (

          <button
            className="navbar-login"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

        )}


        {/* DARK MODE */}

        <button className="navbar-theme">
          🌙
        </button>

      </div>

    </nav>

  );
}

export default Navbar;