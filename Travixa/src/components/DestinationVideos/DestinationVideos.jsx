import React, { useState, useEffect } from "react";
import VideoCard from "./VideoCard";
import "./DestinationVideos.css";

// Helper Skeleton Component for loading state
function SkeletonVideoCard() {
  return (
    <div className="video-card-item skeleton-card">
      <div className="skeleton-thumb"></div>
      <div className="video-card-body">
        <div className="skeleton-text title-line"></div>
        <div className="skeleton-text title-line-short"></div>
        <div className="skeleton-text meta-line"></div>
      </div>
    </div>
  );
}

function DestinationVideos({ destination = "" }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const dest = (destination || "").trim();
    if (!dest) {
      setVideos([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchVideos = async () => {
      setLoading(true);
      setError(null);

      try {
        let response = await fetch(
          `/api/videos?destination=${encodeURIComponent(dest)}`
        );

        // Fallback port in case proxy is bypassed during local development
        if (!response.ok && response.status === 404) {
          response = await fetch(
            `http://localhost:5000/api/videos?destination=${encodeURIComponent(
              dest
            )}`
          );
        }

        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setVideos(data.videos || []);
          }
        } else {
          if (isMounted) {
            setError("Unable to load destination videos.");
          }
        }
      } catch (err) {
        console.error("Error fetching destination videos:", err);
        if (isMounted) {
          setError("Failed to fetch videos.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchVideos();

    return () => {
      isMounted = false;
    };
  }, [destination]);

  const destName = (destination || "").trim();
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    (destName || "travel") + " travel guide"
  )}`;

  return (
    <section className="destination-videos-section" id="destination-videos">
      {/* Header */}
      <div className="videos-section-header">
        <span className="videos-eyebrow">🎥 DESTINATION DISCOVERY</span>
        <h2 className="videos-title">🎥 Explore Before You Go</h2>
        <p className="videos-subtitle">
          Watch travel guides and discover your destination before your journey.
        </p>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="videos-grid">
          <SkeletonVideoCard />
          <SkeletonVideoCard />
          <SkeletonVideoCard />
          <SkeletonVideoCard />
        </div>
      ) : videos && videos.length > 0 ? (
        <>
          <div className="videos-grid">
            {videos.map((video) => (
              <VideoCard key={video.id || video.videoId} video={video} />
            ))}
          </div>

          {/* View More on YouTube Button */}
          <div className="videos-footer-action">
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-view-more-youtube"
            >
              🎥 Explore More — View More on YouTube →
            </a>
          </div>
        </>
      ) : (
        <div className="videos-empty-card">
          <div className="videos-empty-icon">🎬</div>
          <h3>No videos found</h3>
          <p>
            {destName
              ? `We couldn't find videos for "${destName}". Try searching directly on YouTube!`
              : "Select a destination to discover travel guides and videos."}
          </p>
          {destName && (
            <div className="videos-footer-action">
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-view-more-youtube"
              >
                🎥 Search "{destName}" on YouTube →
              </a>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default DestinationVideos;
