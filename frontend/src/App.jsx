import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './components/MapView';
import JournalForm from './components/JournalForm';
import { motion } from 'framer-motion';

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
      setEditingId(null);
      fetchJournals();
    } catch (err) {
      console.error("Error updating journal:", err);
    }
  };

  const startEditing = (journal) => {
    setEditingId(journal.id);
    setEditForm({ title: journal.title, content: journal.content });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="app-header"
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="brand-font" style={{ fontSize: '36px', marginRight: '10px' }}>GeoScribe</span>
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', marginTop: '6px' }}>Interactive Spatial Journal</span>
        </div>
      </motion.header>

      {/* Top Proximity Search Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="search-container"
      >
        <form onSubmit={handleProximitySearch} style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}>PostGIS Proximity:</span>
          <input className="search-input" type="number" placeholder="Distance (km)" value={searchParams.distance} onChange={e => setSearchParams({ ...searchParams, distance: e.target.value })} style={{ width: '120px' }} />
          <span style={{ fontSize: '14px', color: '#64748b' }}>within radius of</span>
          <input className="search-input" type="number" step="any" placeholder="Lat" value={searchParams.lat} onChange={e => setSearchParams({ ...searchParams, lat: e.target.value })} style={{ width: '130px' }} />
          <input className="search-input" type="number" step="any" placeholder="Lng" value={searchParams.lng} onChange={e => setSearchParams({ ...searchParams, lng: e.target.value })} style={{ width: '130px' }} />
          <button type="submit" className="btn-primary">Search</button>
          <button type="button" onClick={fetchJournals} className="btn-secondary">Reset</button>
        </form>
      </motion.div>

      {/* 3-Column Dashboard Section */}
      <main className="main-dashboard">

        {/* COLUMN 1: LEFT SIDE (Smaller Form) */}
        <motion.section 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="column-card"
        >
          <JournalForm onJournalAdded={fetchJournals} selectedCoords={selectedCoords} />
        </motion.section>

        {/* COLUMN 2: MIDDLE (Bigger Map Section) */}
        <motion.section 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="map-column"
        >
          <MapView journals={journals} onMapClick={handleMapClick} activeCoords={activeCoords} />
        </motion.section>

        {/* COLUMN 3: RIGHT SIDE (Travel Timeline Cards with Edit Mode) */}
        <motion.section 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="column-card"
        >
          <h3 style={{ fontSize: '28px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '8px' }}>Travel Timeline</h3>
          <div className="timeline-list">
            {journals.map((journal, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                key={journal.id}
                className="journal-card"
                onClick={() => editingId !== journal.id && handleCardClick(journal.latitude, journal.longitude)}
                style={{ cursor: editingId === journal.id ? 'default' : 'pointer' }}
              >
                {journal.media_url ? (
                  <img src={journal.media_url} alt={journal.title} className="card-image" />
                ) : (
                  <div style={{ height: '140px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>No Image Included</div>
                )}

                <div className="card-content">
                  {editingId === journal.id ? (
                    <form onSubmit={(e) => handleUpdateSubmit(e, journal.id)} onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                        required
                      />
                      <textarea
                        value={editForm.content}
                        onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                        style={{ height: '80px', resize: 'none' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" className="btn-primary" style={{ padding: '6px 12px', flex: 1 }}>Save</button>
                        <button type="button" onClick={() => setEditingId(null)} className="btn-secondary" style={{ padding: '6px 12px', flex: 1 }}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h4>{journal.title}</h4>
                      <p>{journal.content}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                        <span className="pill-badge">📍 {parseFloat(journal.latitude).toFixed(3)}, {parseFloat(journal.longitude).toFixed(3)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(journal);
                          }}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </main>
    </div>
  );
}
