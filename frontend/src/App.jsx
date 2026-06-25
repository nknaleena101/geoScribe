import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './components/MapView';
import JournalForm from './components/JournalForm';
import Auth from './components/Auth';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userId')); // Track logged in user ID
  const [journals, setJournals] = useState([]);
  const [searchParams, setSearchParams] = useState({ lat: '', lng: '', distance: 10 });
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [activeCoords, setActiveCoords] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false); // To toggle login screen gracefully

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // Fetch journals - Works for everyone (Public)
  const fetchJournals = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/journals');
      setJournals(res.data);
    } catch (err) {
      console.error("Error fetching journals:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setCurrentUserId(null);
    fetchJournals();
  };

  const handleLoginSuccess = () => {
    setToken(localStorage.getItem('token'));
    setCurrentUserId(localStorage.getItem('userId'));
    setShowAuthModal(false);
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  return (
    <div>
      {/* Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', background: '#343a40', color: 'white', alignItems: 'center' }}>
        <h2>GeoScribe 📍</h2>
        {token ? (
          <button onClick={handleLogout} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>Logout</button>
        ) : (
          <button onClick={() => setShowAuthModal(true)} style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>Sign In to Drop Pins</button>
        )}
      </div>

      {/* Auth Screen as an overlay if not logged in but wants to */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', position: 'relative' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>❌</button>
            <Auth onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}

      {/* Proximity Search (Hidden Form kept for backend tracking) */}
      <form onSubmit={(e) => {
        e.preventDefault();
        axios.get(`http://localhost:5000/api/journals/search`, { params: { lat: searchParams.lat, lng: searchParams.lng, distanceKm: searchParams.distance } })
          .then(res => setJournals(res.data))
          .catch(err => console.error(err));
      }} style={{ display: 'none' }}>
      </form>

      <div className="main-dashboard">
        {/* Left Column: Log Your Journey */}
        <div className="column-card">
          <h3 style={{ marginBottom: '15px' }}>Log Your Journey</h3>
          {token ? (
            <JournalForm onJournalAdded={fetchJournals} selectedCoords={selectedCoords} token={token} />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 10px' }}>
              <h4>Want to log your journey?</h4>
              <button onClick={() => setShowAuthModal(true)} style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', marginTop: '10px', borderRadius: '4px' }}>Sign In Now</button>
            </div>
          )}
        </div>

        {/* Middle Column: Map View */}
        <div className="map-column">
          <MapView journals={journals} onMapClick={(lat, lng) => token && setSelectedCoords({ lat, lng })} activeCoords={activeCoords} />
        </div>

        {/* Right Column: Travel Timeline */}
        <div className="column-card">
          <h3 style={{ marginBottom: '15px' }}>Global Travel Timeline</h3>
          <div className="timeline-list">
            {journals.map((journal) => (
              <div key={journal.id} className="journal-card" onClick={() => setActiveCoords({ lat: parseFloat(journal.latitude), lng: parseFloat(journal.longitude) })} style={{ cursor: 'pointer' }}>
                {journal.media_url ? <img src={journal.media_url} alt={journal.title} className="card-image" /> : <div style={{ height: '180px', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>}
                
                {/* Updated Card Content Block to display creator_name */}
                <div className="card-content">
                  <span style={{ background: '#6c757d', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                    By: {journal.creator_name || "Unknown"}
                  </span>
                  <h4 style={{ marginTop: '8px' }}>{journal.title}</h4>
                  <p style={{ color: '#555', fontSize: '14px' }}>{journal.content}</p>

                  {/* Only show edit option if the pin belongs to the logged-in user */}
                  {token && parseInt(currentUserId) === journal.user_id && (
                    <button onClick={(e) => {
                      e.stopPropagation(); // Prevents map flying when clicking edit
                      const newTitle = prompt("Enter new title:", journal.title);
                      if (newTitle) {
                        axios.put(`http://localhost:5000/api/journals/${journal.id}`, { ...journal, title: newTitle }, getAuthHeader())
                          .then(() => fetchJournals());
                      }
                    }} style={{ background: '#ffc107', color: 'black', border: 'none', padding: '3px 8px', cursor: 'pointer', marginTop: '10px', borderRadius: '4px', fontSize: '12px' }}>Edit Title</button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}