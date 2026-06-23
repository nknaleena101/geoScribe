import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';

// Map Click එක අල්ලගන්න Component එක
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng); 
    },
  });
  return null;
}

// Active Coordinates වෙනස් වෙද්දි Smooth Fly වෙන්න හදන Component එක (Frontend Flex!)
function RecenterMap({ activeCoords }) {
  const map = useMap(); // Leaflet map instance එක ගන්නවා

  useEffect(() => {
    if (activeCoords) {
      // map.flyTo([lat, lng], zoomLevel, { animation options })
      map.flyTo([activeCoords.lat, activeCoords.lng], 12, {
        animate: true,
        duration: 1.5 // තත්පර ගණන (Smooth වෙන්න 1.5ක් වගේ හොඳයි)
      });
    }
  }, [activeCoords, map]);

  return null;
}

export default function MapView({ journals, onMapClick, activeCoords }) {
  const defaultCenter = [7.8731, 80.7718]; 

  return (
    <div className="map-container">
      <MapContainer center={defaultCenter} zoom={7} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onMapClick={onMapClick} />
        
        {/* Active Coords වෙනස් වෙද්දි Fly වෙන එක මෙතනින් සිදු වෙනවා */}
        <RecenterMap activeCoords={activeCoords} />

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