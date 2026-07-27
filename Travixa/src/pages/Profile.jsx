import { useEffect, useState } from "react";
import "../styles/Profile.css";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "Travexa Traveller",
    email: "traveller@example.com",
    phone: "",
    location: "",
    travelStyle: "Adventure",
  });

  const [formData, setFormData] = useState(profile);

  // Load saved profile
  useEffect(() => {
    const savedProfile = localStorage.getItem("travexaProfile");

    if (savedProfile) {
      const data = JSON.parse(savedProfile);

      setProfile(data);
      setFormData(data);
    }
  }, []);

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setSaved(false);
  };

  // Save profile
  const handleSave = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!formData.email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    setProfile(formData);

    localStorage.setItem(
      "travexaProfile",
      JSON.stringify(formData)
    );

    setIsEditing(false);
    setSaved(true);
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  return (
    <main className="profile-page">

      {/* Header */}

      <section className="profile-header">

        <div>
          <span className="profile-label">
            TRAVEXA ACCOUNT
          </span>

          <h1>Your Profile</h1>

          <p>
            Manage your personal information and travel preferences.
          </p>
        </div>

        {!isEditing && (
          <button
            className="edit-profile-btn"
            onClick={() => {
              setIsEditing(true);
              setSaved(false);
            }}
          >
            ✏️ Edit Profile
          </button>
        )}

      </section>


      {/* Profile Card */}

      <section className="profile-container">

        <div className="profile-card">

          {/* Avatar */}

          <div className="profile-top">

            <div className="profile-avatar">
              {profile.name
                ? profile.name.charAt(0).toUpperCase()
                : "T"}
            </div>

            <div>
              <h2>{profile.name}</h2>

              <p>
                {profile.email}
              </p>

              <span className="traveller-badge">
                ✈️ Traveller
              </span>
            </div>

          </div>


          {/* Saved message */}

          {saved && (
            <div className="saved-message">
              ✓ Profile updated successfully!
            </div>
          )}


          {/* Form */}

          <form onSubmit={handleSave}>

            <div className="profile-grid">

              {/* Name */}

              <div className="profile-field">

                <label>FULL NAME</label>

                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                ) : (
                  <div className="profile-value">
                    👤 {profile.name || "Not added"}
                  </div>
                )}

              </div>


              {/* Email */}

              <div className="profile-field">

                <label>EMAIL ADDRESS</label>

                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="profile-value">
                    📧 {profile.email || "Not added"}
                  </div>
                )}

              </div>


              {/* Phone */}

              <div className="profile-field">

                <label>PHONE NUMBER</label>

                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="profile-value">
                    📱 {profile.phone || "Not added"}
                  </div>
                )}

              </div>


              {/* Location */}

              <div className="profile-field">

                <label>LOCATION</label>

                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Nashik, India"
                  />
                ) : (
                  <div className="profile-value">
                    📍 {profile.location || "Not added"}
                  </div>
                )}

              </div>

            </div>


            {/* Travel style */}

            <div className="travel-preference">

              <div>

                <label>TRAVEL STYLE</label>

                <p>
                  What type of trips do you enjoy?
                </p>

              </div>


              {isEditing ? (

                <select
                  name="travelStyle"
                  value={formData.travelStyle}
                  onChange={handleChange}
                >

                  <option value="Adventure">
                    🏔️ Adventure
                  </option>

                  <option value="Relaxation">
                    🌴 Relaxation
                  </option>

                  <option value="Culture">
                    🏛️ Culture
                  </option>

                  <option value="Food">
                    🍜 Food & Cafés
                  </option>

                  <option value="Luxury">
                    💎 Luxury
                  </option>

                </select>

              ) : (

                <div className="travel-style-display">
                  ✨ {profile.travelStyle}
                </div>

              )}

            </div>


            {/* Buttons */}

            {isEditing && (

              <div className="profile-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                >
                  💾 Save Changes
                </button>

              </div>

            )}

          </form>

        </div>


        {/* Side card */}

        <aside className="profile-side-card">

          <div className="side-icon">
            ✨
          </div>

          <h3>
            Personalise your travels
          </h3>

          <p>
            Keep your travel preferences updated so Travexa
            can create better recommendations for you.
          </p>

          <div className="profile-benefits">

            <div>
              <span>✓</span>
              Personalised trips
            </div>

            <div>
              <span>✓</span>
              Better recommendations
            </div>

            <div>
              <span>✓</span>
              Faster trip planning
            </div>

          </div>

        </aside>

      </section>

    </main>
  );
}

export default Profile;