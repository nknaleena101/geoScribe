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
  const [searchParams, setSearchParams] = useState({ lat: '', lng: '', distance: 10 });
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [activeCoords, setActiveCoords] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [notification, setNotification] = useState('');
  const [editingJournal, setEditingJournal] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // 💡 State to toggle the floating Form panel on top of the Map
  const [showFormPanel, setShowFormPanel] = useState(false);

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
            fetchJournals();
          }}
        />
      )}

      {/* Navbar Structure */}
      <div className="custom-navbar">
        <div className="nav-container">
          <div className="nav-group">
            <button className="nav-item">Dashboard</button>
            <button className="nav-item">Gallery</button>
          </div>
          <img src={logoImg} alt="GeoScribe Logo" className="nav-logo" />
          <div className="nav-group">
            {token ? (
              <>
                <button className="nav-item" onClick={() => setShowProfileModal(true)}>Profile</button>
                <button className="nav-item" onClick={handleLogout} style={{ color: 'black' }}>Logout</button>
              </>
            ) : (
              <button className="nav-item" onClick={() => setShowAuthModal(true)} style={{ color: 'black' }}>Sign In</button>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', position: 'relative' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>❌</button>
            <Auth onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}

      {/* Hidden Proximity Search Tracker */}
      <form onSubmit={(e) => { e.preventDefault(); }} style={{ display: 'none' }}></form>

      {/* 2-Column Dashboard Layout (Left: Map, Right: Timeline) */}
      <div className="main-dashboard">
        
        {/* Left Side: Map with Floating Form Wrapper */}
        <div className="map-column-wrapper">
          
          {/* Conditional Rendering for Drop Pin Button or Floating Panel */}
          {!showFormPanel ? (
            <button 
              className="floating-drop-btn"
              onClick={() => {
                if (!token) return setShowAuthModal(true); // Ask to login if not authenticated
                setShowFormPanel(true);
              }}
            >
              📍 Drop Pin
            </button>
          ) : (
            /* Floating Overlap Journal Form Panel */
            <div className="floating-form-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 'bold' }}>Log Your Journey</span>
                <button 
                  onClick={() => setShowFormPanel(false)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#6c757d' }}
                >
                  ✕
                </button>
              </div>
              <JournalForm
                onJournalAdded={() => {
                  fetchJournals();
                  setShowFormPanel(false); // Close panel on success
                  triggerNotification("🚀 New pin dropped successfully!");
                }}
                selectedCoords={selectedCoords}
                token={token}
              />
            </div>
          )}

          {/* Leaflet Map Rendering inside wrapper */}
          <MapView 
            journals={journals} 
            onMapClick={(lat, lng) => {
              if (token) {
                setSelectedCoords({ lat, lng });
                setShowFormPanel(true); // Automatically open panel when map is clicked
              }
            }} 
            activeCoords={activeCoords} 
          />
        </div>

        {/* Right Side: Travel Timeline List */}
        <div className="timeline-column-card">
          <h3 style={{ marginBottom: '15px', fontFamily: 'Georgia, serif', fontSize: '22px' }}>Travel Timeline</h3>
          <div className="timeline-list">
            {journals.map((journal) => (
              <div key={journal.id} className="journal-card" onClick={() => setActiveCoords({ lat: parseFloat(journal.latitude), lng: parseFloat(journal.longitude) })} style={{ cursor: 'pointer' }}>
                {journal.media_url ? <img src={journal.media_url} alt={journal.title} className="card-image" /> : <div style={{ height: '140px', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>No Image</div>}

                <div className="card-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: '#f0f0f0', color: '#333', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '500' }}>
                      By: {journal.creator_name || "Unknown"}
                    </span>

                    {token && parseInt(currentUserId) === journal.user_id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(journal.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  <h4 style={{ marginTop: '10px', fontSize: '16px', fontFamily: 'Georgia, serif' }}>{journal.title}</h4>
                  <p style={{ color: '#666', fontSize: '13px', lineHeight: '1.4', marginTop: '5px' }}>{journal.content || "No description provided."}</p>

                  {token && parseInt(currentUserId) === journal.user_id && (
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setEditingJournal(journal);
                    }} style={{ background: '#f0f0f0', color: '#333', border: '1px solid #ccc', padding: '4px 10px', cursor: 'pointer', marginTop: '10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                      ✏️ Edit
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