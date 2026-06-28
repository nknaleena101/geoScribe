import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng); 
    },
  });
  return null;
}

function RecenterMap({ activeCoords }) {
  const map = useMap();

  useEffect(() => {
    if (activeCoords) {
      map.flyTo([activeCoords.lat, activeCoords.lng], 12, {
        animate: true,
        duration: 1.5
      });
    }
  }, [activeCoords, map]);

  return null;
}

// 💡 Props වලට token සහ currentUserId එකතු කරා
export default function MapView({ journals, onMapClick, activeCoords, token, currentUserId }) {
  const defaultCenter = [7.8731, 80.7718];

  const createCustomIcon = (creatorName) => {
    const firstChar = creatorName ? creatorName.charAt(0).toUpperCase() : 'U';

    return L.divIcon({
      className: 'custom-pin',
      html: `<div class="pin-avatar"><span>${firstChar}</span></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });
  };

  return (
    <div className="map-container">
      <MapContainer center={defaultCenter} zoom={7} zoomControl={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onMapClick={onMapClick} />
        <RecenterMap activeCoords={activeCoords} />

        {journals.map((journal) => (
          <Marker 
            key={journal.id} 
            position={[parseFloat(journal.latitude), parseFloat(journal.longitude)]}
            icon={createCustomIcon(journal.creator_name)}
          >
            <Popup minWidth={280}>
              <div className="premium-popup-card">
                
                <div className="popup-media-container">
                  {/* 💡 Updated Component: Conditional rendering logic for Map Floating Card */}
                  <div className="popup-author-tag">
                    By: {token && parseInt(currentUserId) === journal.user_id 
                          ? "You" 
                          : (journal.creator_name || "Unknown")}
                  </div>
                  
                  {journal.media_url ? (
                    <img src={journal.media_url} alt={journal.title} className="popup-card-image" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>No Image</div>
                  )}
                  
                  <div className="popup-gradient-overlay"></div>
                </div>

                <div className="popup-text-content">
                  <h4 className="popup-title">{journal.title}</h4>
                  <p className="popup-description">{journal.content || "No description provided."}</p>
                </div>

              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}