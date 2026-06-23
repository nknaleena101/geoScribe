import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function MapView({ journals }) {
  // Default center (Sri Lanka වගේ center එකක් ගමු)
  const defaultCenter = [7.8731, 80.7718]; 

  return (
    <div className="map-container">
      <MapContainer center={defaultCenter} zoom={7} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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