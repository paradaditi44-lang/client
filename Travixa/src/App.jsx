import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import TravelChatbot from "./components/TravelChatbot/TravelChatbot";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PlanTrip from "./pages/PlanTrip";
import TripDetails from "./pages/TripDetails";
import AITripResult from "./components/AITripResult";
import Hotels from "./pages/Hotels";
import Weather from "./pages/Weather";
import Maps from "./pages/Maps";
import About from "./pages/About";
import Profile from "./pages/Profile";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/plan-trip" element={<PlanTrip />} />
        <Route path="/trip-details" element={<TripDetails />} />
        <Route path="/trip-result" element={<AITripResult />} />

        <Route path="/hotels" element={<Hotels />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/maps" element={<Maps />} />

        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>

      {/* Global AI Travel Chatbot Widget */}
      <TravelChatbot />
    </>
  );
}

export default App;