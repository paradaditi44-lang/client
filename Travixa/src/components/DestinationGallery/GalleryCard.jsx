import React from "react";
import "./DestinationGallery.css";

function GalleryCard({ image, onSelect }) {
  if (!image) return null;

  return (
    <div className="gallery-card-item" onClick={() => onSelect(image)}>
      {/* Thumbnail Wrap */}
      <div className="gallery-image-wrap">
        <img
          src={image.imageUrl}
          alt={image.alt || "Destination photo"}
          className="gallery-card-image"
          loading="lazy"
        />

        {/* Floating Category Badge */}
        <span className="gallery-category-badge">{image.category}</span>

        {/* Hover Overlay Hint */}
        <div className="gallery-card-overlay">
          <span className="gallery-view-icon">🔍 View Fullscreen</span>
        </div>
      </div>

      {/* Card Details */}
      <div className="gallery-card-body">
        <p className="gallery-card-caption">
          <span className="ai-star-icon">✨</span> {image.caption}
        </p>
      </div>
    </div>
  );
}

export default GalleryCard;
