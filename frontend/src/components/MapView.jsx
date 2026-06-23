import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

// Map එක Click කරනකොට Coordinates අල්ලගන්න Helper Component එක
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      // Parent Component (App.jsx) එකෙන් ලැබුන Function එකට Coordinates ටික යවනවා
      onMapClick(lat, lng); 
    },
  });
  return null;
}

export default function MapView({ journals, onMapClick }) {
  const defaultCenter = [7.8731, 80.7718]; // Sri Lanka Center

  return (
    <div className="map-container">
      <MapContainer center={defaultCenter} zoom={7} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Click Handler එක Map Container එක ඇතුලට දානවා */}
        <MapClickHandler onMapClick={onMapClick} />

        {journals.map((journal) => (
          <Marker key={journal.id} position={[parseFloat(journal.latitude), parseFloat(journal.longitude)]}>
            <Popup>
              <div>
                {journal.media_url && <img src={journal.media_url} alt={journal.title} style={{ width: '100%', borderRadius: '4px' }} />}
                <h4>{journal.title}</h4>
                <p>{journal.content}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}