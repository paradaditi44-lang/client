import React, { useState, useEffect } from "react";
import API from "../services/api";
import "../styles/TripMemoryModal.css";

const PRESET_PHOTOS = [
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
  "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800",
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
  "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
];

function TripMemoryModal({ trip, existingMemory, onClose, onSave }) {
  const [title, setTitle] = useState(existingMemory?.title || `Memories of ${trip?.destination || "Trip"}`);
  const [rating, setRating] = useState(existingMemory?.rating || 5);
  const [notes, setNotes] = useState(existingMemory?.notes || "");
  const [favoriteMoments, setFavoriteMoments] = useState(existingMemory?.favoriteMoments || "");
  const [placesVisited, setPlacesVisited] = useState(existingMemory?.placesVisited || "");
  const [photos, setPhotos] = useState(existingMemory?.photos || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingMemory) {
      setTitle(existingMemory.title || `Memories of ${trip?.destination || "Trip"}`);
      setRating(existingMemory.rating || 5);
      setNotes(existingMemory.notes || "");
      setFavoriteMoments(existingMemory.favoriteMoments || "");
      setPlacesVisited(existingMemory.placesVisited || "");
      setPhotos(existingMemory.photos || []);
    }
  }, [existingMemory, trip]);

  const handleAddPhotoUrl = () => {
    if (newPhotoUrl.trim()) {
      setPhotos((prev) => [...prev, newPhotoUrl.trim()]);
      setNewPhotoUrl("");
    }
  };

  const handleAddPresetPhoto = (url) => {
    if (!photos.includes(url)) {
      setPhotos((prev) => [...prev, url]);
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotos((prev) => [...prev, event.target.result]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);

    const tripId = trip?.id || trip?._id || Date.now();
    const memoryPayload = {
      tripId,
      title: title.trim(),
      rating,
      notes: notes.trim(),
      favoriteMoments: favoriteMoments.trim(),
      placesVisited: placesVisited.trim(),
      photos,
    };

    try {
      const token = localStorage.getItem("travexaToken") || localStorage.getItem("token");
      if (token) {
        await API.post("/memories", memoryPayload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.warn("Backend API memory save skipped or failed, saving to localStorage:", err);
    }

    // Save to local storage cache for seamless offline/demo access
    try {
      const localMemoriesStr = localStorage.getItem("travexaMemories");
      const localMemories = localMemoriesStr ? JSON.parse(localMemoriesStr) : {};
      localMemories[tripId] = {
        ...memoryPayload,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("travexaMemories", JSON.stringify(localMemories));
    } catch (e) {
      console.error("Failed to save memory to localStorage:", e);
    }

    setSaving(false);
    onSave(memoryPayload);
    onClose();
  };

  return (
    <div className="memory-modal-overlay" onClick={onClose}>
      <div className="memory-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="memory-modal-header">
          <div>
            <span className="memory-modal-badge">📖 TRAVEL JOURNAL</span>
            <h2>{existingMemory ? "Edit Trip Memory" : "Create Trip Memory"}</h2>
            <p className="memory-modal-sub">
              Preserve your favorite moments & memories from {trip?.destination}
            </p>
          </div>
          <button className="memory-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="memory-modal-form">
          {/* Title */}
          <div className="memory-form-group">
            <label>Memory Title *</label>
            <input
              type="text"
              placeholder="e.g. Unforgettable Summer in Paris"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Rating */}
          <div className="memory-form-group">
            <label>Travel Rating</label>
            <div className="star-rating-picker">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`star-btn ${star <= rating ? "active" : ""}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
              <span className="rating-label">{rating} / 5 Stars</span>
            </div>
          </div>

          {/* Personal Notes / Story */}
          <div className="memory-form-group">
            <label>Personal Story & Travel Journal</label>
            <textarea
              rows={4}
              placeholder="Write about your journey, experiences, feelings, and highlights..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Favorite Moments */}
          <div className="memory-form-group">
            <label>Favorite Moments</label>
            <input
              type="text"
              placeholder="e.g. Watching the sunset at Eiffel Tower, trying street tacos in Mexico"
              value={favoriteMoments}
              onChange={(e) => setFavoriteMoments(e.target.value)}
            />
          </div>

          {/* Places Visited */}
          <div className="memory-form-group">
            <label>Places Visited</label>
            <input
              type="text"
              placeholder="e.g. Louvre Museum, Seine River Cruise, Montmartre Cafe"
              value={placesVisited}
              onChange={(e) => setPlacesVisited(e.target.value)}
            />
          </div>

          {/* Trip Photos */}
          <div className="memory-form-group">
            <label>Trip Photos</label>

            {/* Photo List */}
            {photos.length > 0 && (
              <div className="memory-photo-grid">
                {photos.map((url, idx) => (
                  <div key={idx} className="memory-photo-thumb">
                    <img src={url} alt={`Memory ${idx + 1}`} />
                    <button
                      type="button"
                      className="photo-remove-btn"
                      onClick={() => handleRemovePhoto(idx)}
                      title="Remove photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Photo Input Controls */}
            <div className="memory-photo-inputs">
              <div className="url-input-row">
                <input
                  type="url"
                  placeholder="Paste photo image URL..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                />
                <button type="button" onClick={handleAddPhotoUrl} className="btn-add-url">
                  + Add URL
                </button>
              </div>

              <div className="photo-upload-row">
                <label className="btn-file-upload">
                  📷 Upload Image File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            {/* Preset Samples */}
            <div className="preset-photos-wrap">
              <span className="preset-label">Quick Sample Photos:</span>
              <div className="preset-chips">
                {PRESET_PHOTOS.map((pUrl, i) => (
                  <button
                    type="button"
                    key={i}
                    className="preset-chip-btn"
                    onClick={() => handleAddPresetPhoto(pUrl)}
                  >
                    <img src={pUrl} alt={`Preset ${i + 1}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="memory-modal-actions">
            <button
              type="button"
              className="btn-memory-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn-memory-save" disabled={saving}>
              {saving ? "Saving..." : "✨ Save Trip Memory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TripMemoryModal;
