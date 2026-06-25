import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';

// Component to handle map click events and pass coordinates up
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng); 
    },
  });
  return null;
}

// Component to handle smooth camera flights when activeCoords change
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
  const defaultCenter = [7.8731, 80.7718]; // Sri Lanka Center

  return (
    <div className="map-container">
      <MapContainer center={defaultCenter} zoom={7} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onMapClick={onMapClick} />
        <RecenterMap activeCoords={activeCoords} />

        {journals.map((journal) => (
          <Marker key={journal.id} position={[parseFloat(journal.latitude), parseFloat(journal.longitude)]}>
            <Popup>
              <div style={{ minWidth: '150px' }}>
                {/* 💡 Added: Displaying the creator's name inside the Map Popup */}
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