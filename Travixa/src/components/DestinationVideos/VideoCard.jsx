import React from "react";
import "./DestinationVideos.css";

// Utility function to decode HTML entities (e.g. &#39; -> ', &amp; -> &)
function decodeHtmlEntities(str) {
  if (!str) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

function VideoCard({ video }) {
  if (!video) return null;

  const { title, channelTitle, thumbnailUrl, videoUrl, duration, viewCount } = video;
  const cleanTitle = decodeHtmlEntities(title);

  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="video-card-item"
    >
      {/* Thumbnail Container */}
      <div className="video-card-thumbnail-wrap">
        <img
          src={thumbnailUrl}
          alt={cleanTitle}
          className="video-card-thumbnail"
          loading="lazy"
        />

        {/* Semi-transparent dark overlay */}
        <div className="video-card-overlay">
          <div className="video-play-btn" title="Play Video">
            <span className="play-icon">▶</span>
          </div>
        </div>

        {/* Duration Badge (e.g. ▶ 12:34) */}
        {duration && (
          <span className="video-duration-badge">
            <span className="badge-play-mini">▶</span> {duration}
          </span>
        )}
      </div>

      {/* Card Info */}
      <div className="video-card-body">
        <h4 className="video-card-title" title={cleanTitle}>
          {cleanTitle}
        </h4>

        <div className="video-card-meta">
          <span className="video-channel-name">📺 {channelTitle}</span>
          {viewCount && <span className="video-views-badge">👁 {viewCount}</span>}
        </div>
      </div>
    </a>
  );
}

export default VideoCard;
