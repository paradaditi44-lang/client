
import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  const [theme, setTheme] = useState("light");

  const location = useLocation();

 console.log(location.pathname);
 
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    
    <div className={`app ${theme}`}>

      {/* Hide Navbar on Dashboard */}
      {location.pathname !== "/dashboard" && (
        <Navbar toggleTheme={toggleTheme} theme={theme} />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

    </div>
  );
}

export default App;