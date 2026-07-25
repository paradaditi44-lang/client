import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Hotels from "./pages/Hotels";
import Weather from "./pages/Weather";
import Maps from "./pages/Maps";
import About from "./pages/About";
import Profile from "./pages/Profile";

function App() {
  const [theme, setTheme] = useState("light");

  const location = useLocation();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className={`app ${theme}`}>
      {/* Show Navbar only after login */}
      {!["/", "/register", "/dashboard"].includes(location.pathname) && (
        <Navbar toggleTheme={toggleTheme} theme={theme} />
      )}

      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Pages */}
        <Route path="/home" element={<Home />} />

        <Route
          path="/dashboard"
          element={
            <Dashboard
              theme={theme}
              toggleTheme={toggleTheme}
            />
          }
        />

        <Route path="/hotels" element={<Hotels />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/maps" element={<Maps />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;