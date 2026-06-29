import React from 'react';
import { Trash } from 'lucide-react';


export default function GalleryView({ journals, token, currentUserId, onDelete }) {
  return (
    <div className="gallery-container">
      <h3 className="gallery-main-title">Global Exploration Gallery</h3>
      
      {journals.length === 0 ? (
        <div className="gallery-empty-state">No journal drops available in the gallery yet.</div>
      ) : (
        <div className="gallery-grid">
          {journals.map((journal) => (
            <div key={journal.id} className="premium-gallery-card">
              
              {/* Top Media Container with Overlays */}
              <div className="popup-media-container">
                <div className="popup-author-tag">
                  By: {token && parseInt(currentUserId) === journal.user_id 
                        ? "You" 
                        : (journal.creator_name || "Unknown")}
                </div>
                
                {token && parseInt(currentUserId) === journal.user_id && (
                  <button 
                    className="gallery-card-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(journal.id);
                    }}
                    title="Delete Drop"
                  >
                    <Trash />
                  </button>
                )}
                
                {journal.media_url ? (
                  <img src={journal.media_url} alt={journal.title} className="popup-card-image" />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>No Image</div>
                )}
                
                <div className="popup-gradient-overlay"></div>
              </div>

              {/* Bottom Text Content */}
              <div className="popup-text-content">
                <h4 className="popup-title">{journal.title}</h4>
                <p className="popup-description">{journal.content || "No description provided."}</p>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}