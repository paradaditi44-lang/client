import React, { useState, useEffect } from "react";
import GalleryCard from "./GalleryCard";
import ImageModal from "./ImageModal";
import "./DestinationGallery.css";

const CATEGORIES = [
  { id: "beaches", name: "🏖 Beaches" },
  { id: "sunsets", name: "🌅 Sunsets" },
  { id: "food", name: "🍛 Food" },
  { id: "heritage", name: "🏛 Heritage" },
  { id: "nature", name: "🌿 Nature" },
  { id: "nightlife", name: "🎉 Nightlife" },
];

function generateAICaption(destination, categoryName) {
  const destName = destination || "your destination";

  switch (categoryName) {
    case "🏖 Beaches":
      return `Pristine golden sands and relaxing coastal vibes in ${destName}.`;
    case "🌅 Sunsets":
      return `Breathtaking sunset views across ${destName}.`;
    case "🍛 Food":
      return `Authentic local cuisine and delicious food experiences in ${destName}.`;
    case "🏛 Heritage":
      return `Historic landmarks and rich cultural heritage of ${destName}.`;
    case "🌿 Nature":
      return `Beautiful landscapes and scenic natural beauty around ${destName}.`;
    case "🎉 Nightlife":
      return `Experience the vibrant nightlife and entertainment of ${destName}.`;
    default:
      return `Beautiful travel memories from ${destName}.`;
  }
}

function getFallbackGallery(destination) {
  const dest = destination || "Travel";

  return [
    {
      id: "1",
      destination: dest,
      category: "🏖 Beaches",
      caption: generateAICaption(dest, "🏖 Beaches"),
      imageUrl:
        "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg",
      largeImageUrl:
        "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg",
      photographer: "Pexels",
    },
    {
      id: "2",
      destination: dest,
      category: "🌅 Sunsets",
      caption: generateAICaption(dest, "🌅 Sunsets"),
      imageUrl:
        "https://images.pexels.com/photos/842711/pexels-photo-842711.jpeg",
      largeImageUrl:
        "https://images.pexels.com/photos/842711/pexels-photo-842711.jpeg",
      photographer: "Pexels",
    },
    {
      id: "3",
      destination: dest,
      category: "🍛 Food",
      caption: generateAICaption(dest, "🍛 Food"),
      imageUrl:
        "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg",
      largeImageUrl:
        "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg",
      photographer: "Pexels",
    },
  ];
}

function DestinationGallery({ destination = "" }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const destName = destination.trim();

  useEffect(() => {
    if (!destName) {
      setImages([]);
      return;
    }

    let isMounted = true;

    async function fetchImages() {
      setLoading(true);
      setError(null);

      try {
        const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

        if (!apiKey) {
          setImages(getFallbackGallery(destName));
          setLoading(false);
          return;
        }

        const query = `${destName} tourist attractions`;

        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(
            query
          )}&per_page=8`,
          {
            headers: {
              Authorization: apiKey,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }

        const data = await response.json();

        if (isMounted && data.photos?.length > 0) {
          const formatted = data.photos.map((photo, index) => {
            const category =
              CATEGORIES[index % CATEGORIES.length].name;

            return {
              id: photo.id,
              destination: destName,
              category,
              caption: generateAICaption(destName, category),
              imageUrl: photo.src.large,
              largeImageUrl: photo.src.original,
              photographer: photo.photographer,
              alt: photo.alt || `${destName} tourist attraction`,
            };
          });

          setImages(formatted);
        } else {
          setImages(getFallbackGallery(destName));
        }
      } catch (err) {
        console.error(err);
        setImages(getFallbackGallery(destName));
        setError(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchImages();

    return () => {
      isMounted = false;
    };
  }, [destName]);

  return (
    <section
      className="destination-gallery-section"
      id="destination-gallery"
    >
      <div className="gallery-section-header">
        <span className="gallery-eyebrow">
          📸 AI TRAVEL GALLERY
        </span>

        <h2 className="gallery-title">
          ✨ Destination Visual Highlights
        </h2>

        <p className="gallery-subtitle">
          Explore beautiful moments from{" "}
          <strong>{destName || "your destination"}</strong>.
        </p>
      </div>

      {loading ? (
        <div className="gallery-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="gallery-card-item gallery-skeleton-card"
            >
              <div className="gallery-skeleton-thumb"></div>
              <div className="gallery-skeleton-text"></div>
            </div>
          ))}
        </div>
      ) : images.length > 0 ? (
        <div className="gallery-grid">
          {images.map((img) => (
            <GalleryCard
              key={img.id}
              image={img}
              onSelect={setSelectedImage}
            />
          ))}
        </div>
      ) : (
        <div className="gallery-empty-card">
          <div className="gallery-empty-icon">📷</div>

          <h3>No Images Found</h3>

          <p>
            Try searching for another destination.
          </p>
        </div>
      )}

      <ImageModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </section>
  );
}

export default DestinationGallery;