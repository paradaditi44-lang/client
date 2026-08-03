import React, { useEffect } from "react";
import "./DestinationGallery.css";

function ImageModal({ image, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!image) return null;

  return (
    <div className="gallery-modal-overlay" onClick={onClose}>
      <div className="gallery-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="gallery-modal-close" onClick={onClose} title="Close Preview">
          ✕
        </button>

        {/* Large Image View */}
        <div className="gallery-modal-image-wrap">
          <img
            src={image.largeImageUrl || image.imageUrl}
            alt={image.alt || image.title}
            className="gallery-modal-image"
          />
        </div>

        {/* Modal Info Footer */}
        <div className="gallery-modal-body">
          <div className="modal-header-row">
            <span className="modal-category-badge">{image.category}</span>
            <h3 className="modal-title">📍 {image.destination || "Destination Gallery"}</h3>
          </div>

          <p className="modal-caption-text">
            <span className="ai-sparkle">✨ AI Snapshot:</span> {image.caption}
          </p>

          {image.photographer && (
            <span className="modal-photographer-credit">
              📷 Photo by {image.photographer} on Unsplash
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageModal;
