import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './components/MapView';
import JournalForm from './components/JournalForm';

export default function App() {
  const [journals, setJournals] = useState([]);
  const [searchParams, setSearchParams] = useState({ lat: '', lng: '', distance: 10 });
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [activeCoords, setActiveCoords] = useState(null);

  const fetchJournals = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/journals');
      setJournals(res.data);
    } catch (err) {
      console.error("Error fetching journals:", err);
    }
  };

  const handleMapClick = (lat, lng) => {
    setSelectedCoords({ lat, lng });
  };

  const handleCardClick = (lat, lng) => {
    setActiveCoords({ lat: parseFloat(lat), lng: parseFloat(lng) });
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header className="app-header">
        GeoScribe 📍 <span style={{ fontWeight: 400, marginLeft: 8, fontSize: 16, color: '#64748b' }}>Interactive Spatial Journal</span>
      </header>
      
      {/* Top Proximity Search Bar */}
      <div className="search-container">
        <form onSubmit={handleProximitySearch} style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>PostGIS Proximity:</span>
          <input type="number" placeholder="Distance (km)" value={searchParams.distance} onChange={e => setSearchParams({...searchParams, distance: e.target.value})} style={{ width: '110px', padding: '6px 10px' }} />
          <span style={{ fontSize: '14px' }}>within radius of</span>
          <input type="number" step="any" placeholder="Lat" value={searchParams.lat} onChange={e => setSearchParams({...searchParams, lat: e.target.value})} style={{ width: '120px', padding: '6px 10px' }} />
          <input type="number" step="any" placeholder="Lng" value={searchParams.lng} onChange={e => setSearchParams({...searchParams, lng: e.target.value})} style={{ width: '120px', padding: '6px 10px' }} />
          <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '7px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Search</button>
          <button type="button" onClick={fetchJournals} style={{ background: '#64748b', color: 'white', border: 'none', padding: '7px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Reset</button>
        </form>
      </div>

      {/* 3-Column Dashboard Section */}
      <main className="main-dashboard">
        
        {/* COLUMN 1: LEFT SIDE (Smaller Form) */}
        <section className="column-card">
          <JournalForm onJournalAdded={fetchJournals} selectedCoords={selectedCoords} />
        </section>
        
        {/* COLUMN 2: MIDDLE (Bigger Map Section) */}
        <section className="map-column">
          <MapView journals={journals} onMapClick={handleMapClick} activeCoords={activeCoords} />
        </section>
        
        {/* COLUMN 3: RIGHT SIDE (Travel Timeline Cards) */}
        <section className="column-card">
          <h3 style={{ fontSize: '18px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>Travel Timeline</h3>
          <div className="timeline-list">
            {journals.map((journal) => (
              <div 
                key={journal.id} 
                className="journal-card"
                onClick={() => handleCardClick(journal.latitude, journal.longitude)}
              >
                {journal.media_url ? (
                  <img src={journal.media_url} alt={journal.title} className="card-image" />
                ) : (
                  <div style={{ height: '100px', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '12px' }}>No Image Included</div>
                )}
                <div className="card-content">
                  <h4>{journal.title}</h4>
                  <p>{journal.content}</p>
                  <small>📍 {parseFloat(journal.latitude).toFixed(4)}, {parseFloat(journal.longitude).toFixed(4)}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}