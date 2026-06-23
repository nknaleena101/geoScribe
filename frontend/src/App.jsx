import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './components/MapView';
import JournalForm from './components/JournalForm';

export default function App() {
  const [journals, setJournals] = useState([]);
  const [searchParams, setSearchParams] = useState({ lat: '', lng: '', distance: 10 });
  
  // Map ක්ලික් එකෙන් ලැබෙන Coordinates තියාගන්න State එක
  const [selectedCoords, setSelectedCoords] = useState(null);

  const fetchJournals = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/journals');
      setJournals(res.data);
    } catch (err) {
      console.error("Error fetching journals:", err);
    }
  };

  // Map එක Click කරද්දි Run වන Function එක
  const handleMapClick = (lat, lng) => {
    setSelectedCoords({ lat, lng });
  };

  const handleProximitySearch = async (e) => {
    e.preventDefault();
    if (!searchParams.lat || !searchParams.lng) return alert("Please provide Lat and Lng!");
    try {
      const res = await axios.get(`http://localhost:5000/api/journals/search`, {
        params: { lat: searchParams.lat, lng: searchParams.lng, distanceKm: searchParams.distance }
      });
      setJournals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: 'center', margin: '20px' }}>GeoScribe 📍</h1>
      
      {/* Proximity Search */}
      <div style={{ background: '#e9ecef', padding: '15px', margin: '0 20px 20px 20px', borderRadius: '8px' }}>
        <form onSubmit={handleProximitySearch} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <strong>Find Journals Within:</strong>
          <input type="number" placeholder="Distance (km)" value={searchParams.distance} onChange={e => setSearchParams({...searchParams, distance: e.target.value})} style={{ width: '80px' }} />
          <span>of Lat:</span>
          <input type="number" step="any" placeholder="Lat" value={searchParams.lat} onChange={e => setSearchParams({...searchParams, lat: e.target.value})} />
          <span>& Lng:</span>
          <input type="number" step="any" placeholder="Lng" value={searchParams.lng} onChange={e => setSearchParams({...searchParams, lng: e.target.value})} />
          <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 15px', cursor: 'pointer' }}>Search</button>
          <button type="button" onClick={fetchJournals} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '5px 15px', cursor: 'pointer' }}>Reset Map</button>
        </form>
      </div>

      <div className="dashboard">
        {/* Form එකට selectedCoords පාස් කරනවා */}
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px' }}>
          <JournalForm onJournalAdded={fetchJournals} selectedCoords={selectedCoords} />
        </div>
        
        {/* Map එකට handleMapClick Function එක පාස් කරනවා */}
        <div>
          <MapView journals={journals} onMapClick={handleMapClick} />
        </div>
      </div>

      {/* Media Cards Grid */}
      <div style={{ padding: '20px' }}>
        <h3>Your Travel Timeline</h3>
        <div className="journal-grid">
          {journals.map((journal) => (
            <div key={journal.id} className="journal-card">
              {journal.media_url ? (
                <img src={journal.media_url} alt={journal.title} className="card-image" />
              ) : (
                <div style={{ height: '180px', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
              )}
              <div className="card-content">
                <h4>{journal.title}</h4>
                <p style={{ color: '#555', fontSize: '14px' }}>{journal.content}</p>
                <small style={{ color: '#888' }}>📍 {parseFloat(journal.latitude).toFixed(4)}, {parseFloat(journal.longitude).toFixed(4)}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}