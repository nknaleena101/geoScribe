import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './components/MapView';
import JournalForm from './components/JournalForm';
import Auth from './components/Auth';
import EditModal from './components/EditModal';
import ProfileModal from './components/ProfileModal';
import logoImg from './assets/GeoScribe.png';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userId'));
  const [journals, setJournals] = useState([]);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [activeCoords, setActiveCoords] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [notification, setNotification] = useState('');
  const [editingJournal, setEditingJournal] = useState(null);

  // New State to control Profile Modal visibility
  const [showProfileModal, setShowProfileModal] = useState(false);

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const fetchJournals = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/journals');
      setJournals(res.data);
    } catch (err) {
      console.error("Error fetching journals:", err);
    }
  };

  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this pin?")) {
      try {
        await axios.delete(`http://localhost:5000/api/journals/${id}`, getAuthHeader());
        triggerNotification("📍 Pin deleted successfully!");
        fetchJournals();
      } catch (err) {
        console.error(err);
        alert("Failed to delete pin");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
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
      {/* Notification Banner */}
      {notification && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#333', color: 'white', padding: '12px 24px', borderRadius: '30px', zIndex: 10001, boxShadow: '0 4px 10px rgba(0,0,0,0.3)', fontWeight: 'bold' }}>
          {notification}
        </div>
      )}

      {/* Edit Journey Popup Modal */}
      {editingJournal && (
        <EditModal
          journal={editingJournal}
          token={token}
          onClose={() => setEditingJournal(null)}
          onUpdateSuccess={() => {
            setEditingJournal(null);
            triggerNotification("📝 Journal updated successfully!");
            fetchJournals();
          }}
        />
      )}

      {/* Profile Settings Popup Modal */}
      {showProfileModal && (
        <ProfileModal
          token={token}
          onClose={() => setShowProfileModal(false)}
          onProfileUpdate={() => {
            triggerNotification("👤 Profile name updated successfully!");
            fetchJournals(); // Refresh timeline list to display the new name
          }}
        />
      )}

      {/* Navbar with Profile Icon Trigger */}
      <div className="custom-navbar">
        <div className="nav-container">

          {/* Left Side Links */}
          <div className="nav-group">
            <button className="nav-item">Dashboard</button>
            <button className="nav-item">Gallery</button>
          </div>

          {/* Middle Logo Component */}
          <img src={logoImg} alt="GeoScribe Logo" className="nav-logo" />

          {/* Right Side Links (Conditional rendering based on Auth Token) */}
          <div className="nav-group">
            {token ? (
              <>
                {/* Profile Button triggers your Profile Modal */}
                <button className="nav-item" onClick={() => setShowProfileModal(true)}>
                  Profile
                </button>
                {/* Logout Button triggers logout function */}
                <button className="nav-item" onClick={handleLogout} style={{ color: 'black' }}>
                  Logout
                </button>
              </>
            ) : (
              /* If not logged in, show Sign In link */
              <button className="nav-item" onClick={() => setShowAuthModal(true)} style={{ color: 'black' }}>
                Sign In
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Auth Screen Modal */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', position: 'relative' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>❌</button>
            <Auth onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}

      {/* Hidden Proximity Search Tracker */}
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
            <JournalForm
              onJournalAdded={() => {
                fetchJournals();
                triggerNotification("🚀 New pin dropped successfully!");
              }}
              selectedCoords={selectedCoords}
              token={token}
            />
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

                <div className="card-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: '#6c757d', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                      By: {journal.creator_name || "Unknown"}
                    </span>

                    {token && parseInt(currentUserId) === journal.user_id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(journal.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  <h4 style={{ marginTop: '8px' }}>{journal.title}</h4>
                  <p style={{ color: '#555', fontSize: '14px' }}>{journal.content || "No description provided."}</p>

                  {token && parseInt(currentUserId) === journal.user_id && (
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setEditingJournal(journal);
                    }} style={{ background: '#ffc107', color: 'black', border: 'none', padding: '4px 10px', cursor: 'pointer', marginTop: '10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      ✏️ Edit Trip
                    </button>
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