import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet'; // 💡 Imported Leaflet globally to use L.divIcon

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

export default function MapView({ journals, onMapClick, activeCoords }) {
  const defaultCenter = [7.8731, 80.7718];

  // 💡 Function to create a custom HTML/CSS Pin with User's First Character
  const createCustomIcon = (creatorName) => {
    // Get first character, default to 'U' if name is empty
    const firstChar = creatorName ? creatorName.charAt(0).toUpperCase() : 'U';

    return L.divIcon({
      className: 'custom-pin', // Wrapper class
      html: `<div class="pin-avatar"><span>${firstChar}</span></div>`, // HTML structure
      iconSize: [36, 36], // Total size of the icon
      iconAnchor: [18, 36], // Point of the icon which will correspond to marker's location (Bottom tip)
      popupAnchor: [0, -36] // Point from which the popup should open relative to the iconAnchor
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
            icon={createCustomIcon(journal.creator_name)} // 💡 Injected our custom avatar icon here!
          >
            <Popup>
              <div style={{ minWidth: '150px' }}>
                <span style={{ background: '#007bff', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginBottom: '5px' }}>
                  By: {journal.creator_name || "Unknown"}
                </span>
                
                {journal.media_url && (
                  <img src={journal.media_url} alt={journal.title} style={{ width: '100%', borderRadius: '4px', marginTop: '5px' }} />
                )}
                <h4 style={{ margin: '5px 0 2px 0' }}>{journal.title}</h4>
                <p style={{ margin: '0', color: '#555', fontSize: '12px' }}>{journal.content}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}