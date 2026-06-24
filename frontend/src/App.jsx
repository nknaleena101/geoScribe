import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './components/MapView';
import JournalForm from './components/JournalForm';

export default function App() {
  const [journals, setJournals] = useState([]);
  const [searchParams, setSearchParams] = useState({ lat: '', lng: '', distance: 10 });
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [activeCoords, setActiveCoords] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });

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

  const handleUpdateSubmit = async (e, id) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/journals/${id}`, editForm);
      setEditingId(null); // hide Edit mode 
      fetchJournals(); // refresh the app and get the new data
    } catch (err) {
      console.error("Error updating journal:", err);
    }
  };

  const startEditing = (journal) => {
    setEditingId(journal.id);
    setEditForm({ title: journal.title, content: journal.content });
  };

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
          <input type="number" placeholder="Distance (km)" value={searchParams.distance} onChange={e => setSearchParams({ ...searchParams, distance: e.target.value })} style={{ width: '110px', padding: '6px 10px' }} />
          <span style={{ fontSize: '14px' }}>within radius of</span>
          <input type="number" step="any" placeholder="Lat" value={searchParams.lat} onChange={e => setSearchParams({ ...searchParams, lat: e.target.value })} style={{ width: '120px', padding: '6px 10px' }} />
          <input type="number" step="any" placeholder="Lng" value={searchParams.lng} onChange={e => setSearchParams({ ...searchParams, lng: e.target.value })} style={{ width: '120px', padding: '6px 10px' }} />
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

        {/* COLUMN 3: RIGHT SIDE (Travel Timeline Cards with Edit Mode) */}
        <section className="column-card">
          <h3 style={{ fontSize: '18px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>Travel Timeline</h3>
          <div className="timeline-list">
            {journals.map((journal) => (
              <div
                key={journal.id}
                className="journal-card"
                onClick={() => editingId !== journal.id && handleCardClick(journal.latitude, journal.longitude)}
                style={{ cursor: editingId === journal.id ? 'default' : 'pointer' }}
              >
                {journal.media_url ? (
                  <img src={journal.media_url} alt={journal.title} className="card-image" />
                ) : (
                  <div style={{ height: '100px', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '12px' }}>No Image Included</div>
                )}

                <div className="card-content">
                  {editingId === journal.id ? (
                    /* EDIT MODE ON */
                    <form onSubmit={(e) => handleUpdateSubmit(e, journal.id)} onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                        required
                        style={{ padding: '4px 8px' }}
                      />
                      <textarea
                        value={editForm.content}
                        onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                        style={{ padding: '4px 8px', height: '60px' }}
                      />
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Save</button>
                        <button type="button" onClick={() => setEditingId(null)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    /* EDIT MODE OFF*/
                    <>
                      <h4>{journal.title}</h4>
                      <p>{journal.content}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                        <small>📍 {parseFloat(journal.latitude).toFixed(4)}, {parseFloat(journal.longitude).toFixed(4)}</small>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // stop Card click 
                            startEditing(journal);
                          }}
                          style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Edit Description
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}